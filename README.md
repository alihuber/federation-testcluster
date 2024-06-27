# Apollo GraphQL Federation running in local kubernetes cluster via minikube recipe

## Install & start minikube

`brew install minikube`  
`minikube delete`  
`minikube start`  
`kubectl get po -A` This should output kubernetes stuff

Activate dashboard, leave it open:  
`minikube addons enable metrics-server`  
`minikube dashboard`  

Finally:  
`kubectl create namespace federation`  

## Build/push local images

To be able to deploy local images (`https://minikube.sigs.k8s.io/docs/handbook/pushing/#macOS`):   
`eval $(minikube docker-env)`  
This alters the current `docker` command in this shell. To reset docker-env:   
`unset $(env | grep DOCKER | awk -F'=' '{print $1}' | xargs)`  

## Setup databases
ssh into minikube node and create data directories, those will be mounted by the volumes into the container:  
`minikube ssh`  
`sudo mkdir /mnt/data/`  
`sudo mkdir /mnt/data/pg`  
All files related to databases reside in the 'data' directory.  
How to see env variables in any of the pods?  
`kubectl -n federation exec pg-pod env`

### Setup postgres
Apply claim and volume files:  
`kubectl apply -f pg-volume.yaml`  
`kubectl apply -f pg-claim.yaml`  
This will setup a 400mb volume claim that will mount the pg data directory into `/mnt/data/pg` within the kubernetes node.  
Then apply the pod and service files to expose the database to services:  
`kubectl apply -f postgres.yaml`  
`kubectl apply -f pg-svc.yaml`  

Now check again with `minikube ssh`, there should be postgres data in `/mnt/data/pg`  

Now create the database used by the services below. Either ssh into the pod or use the dashboard:  
`kubectl exec -n federation --stdin --tty pg-pod -- /bin/bash`  
`psql -U postgres`  
`CREATE DATABASE federation;`  

### Setup mongodb
Apply claim and volume files:  
`kubectl apply -f mongo-volume.yaml`  
`kubectl apply -f mongo-claim.yaml`  
This will setup a 400mb volume claim that will mount the mongodb data directory into `/mnt/data/mongo` within the kubernetes node.  
Then apply the pod and service files to expose the database to services:  
`kubectl apply -f mongo.yaml`  
`kubectl apply -f mongo-svc.yaml`  

Now check again with `minikube ssh`, there should be data in `/mnt/data/mongo`  

Now create the database used by the services below. Either ssh into the pod or use the dashboard:  
`kubectl exec -n federation --stdin --tty mongo-pod -- /bin/bash`  
`mongosh --authenticationDatabase "admin" -u "admin" -p "admin"`  
```javascript
use federation
db.createUser(
  {
    user: "federationuser",  
    pwd:  "federationpw",  
    roles: [ { role: "readWrite", db: "federation" } ]
  }
)
```

## Deploy users service

Start User-Service at least once, to make sure database migrations are working and file users.graphql is created:   
`cd users && npm run dev`  
`docker build -t users-service:1 .`  

`docker images` should now display kubernetes stuff and users-service image    

`kubectl apply -f users-service-deployment.yaml`  
`kubectl apply -f users-service-svc.yaml`  
`cd ..`  

## Deploy books service

Start Book-Service at least once, to make sure database migrations are working and file books.graphql is created:   
`cd books && npm run dev`  
`docker build -t books-service:1 .`  

`docker images` should now display kubernetes stuff and books-service image    

`kubectl apply -f books-service-deployment.yaml`  
`kubectl apply -f books-service-svc.yaml`  
`cd ..`  

## Deploy and expose via gateway

`cd gateway`  
Make sure `HOST_IP` is set to the host computers IP in Dockerfile, this sets CORS for the gateway.   
Make sure supergraph.graphql is created and build image:  
`npm run compose-supergraph && docker build -t gateway:1 .`  
`kubectl apply -f gateway-deployment.yaml`  
`cd ..`  

## Expose gateway service, query data

First, expose the gateway deployment with a node port  
`kubectl expose deployment gateway --type=NodePort --port=4000 -n federation`  
Then expose it as a service to be reached from host system  
`minikube service gateway --url -n federation`  
Then this should return data:
```bash
curl --request POST \
  --header 'content-type: application/json' \
  --url 'http://127.0.0.1:61126/graphql' \
  --data '{"query":"query { user(username: \"testuser1\") { id } }"}'
```
Alternatively expose via ingress, see step below   

## Deploy Apollo router instead of gateway

In gateway folder, make sure supergraph.graphql is created:  
`npm run compose-supergraph`   
Copy supergraphl.graphql to router folder  
Make sure `GATEWAY_ORIGIN` is switched to `http://router:4000` in user-service's Dockerfile   
Make sure host IP is whitelisted in `router.yaml`   
`cd router`   
`docker build -t router:1 .`   
`kubectl apply -f router-deployment.yaml`   

## Expose router service, query data

First, expose the router deployment with a node port  
`kubectl expose deployment router --type=NodePort --port=4000 -n federation`  
Then expose it as a service to be reached from host system  
`minikube service router --url -n federation`  
Then this should return data:
```bash
curl --request POST \
  --header 'content-type: application/json' \
  --url 'http://127.0.0.1:61126/graphql' \
  --data '{"query":"query { user(username: \"testuser1\") { id } }"}'
```
Alternatively expose via ingress, see step below   

## Expose gateway/router via ingress and domain

Make sure the deployment is exposed via NodePort, see above.  
Enable ingress addon, wait a few minutes  
`minikube addons enable ingress`  
In a separate terminal, start minikube tunnel  
`minikube tunnel`  
Switch routed service in `ingress.yaml` to router or gateway, apply ingress config  
`kubectl apply -f ingress.yaml`  
This should not error:  
`curl --resolve "hello-world.example:80:127.0.0.1" -i http://hello-world.example`  
Add the line  
`127.0.0.1 hello-world.example`  
in /etc/hosts  

Now the graph can be queried like  
```bash
curl --request POST \
  --header 'content-type: application/json' \
  --url 'http://hello-world.example/graphql' \
  --data '{"query":"query { user(username: \"testuser1\") { id } }"}'
```

## Cleanup
Delete deployments, pods and services:  
`kubectl delete all --all -n federation`  
`kubectl delete ingress example-ingress -n federation`  
`kubectl get all -A` should only display stuff from ingress-nginx, kube-system and kubernetes-dashboard namespaces  
Delete volumes and claims:  
`kubectl delete pvc pg-claim -n federation`  
`kubectl delete pv pg-volume -n federation`  
`kubectl delete pvc mongo-claim -n federation`  
`kubectl delete pv mongo-volume -n federation`  
Delete images of built images:  
`docker rmi <image id> <image id>`  
Stop minikube:  
`minikube stop`  
Reset docker-env:  
`unset $(env | grep DOCKER | awk -F'=' '{print $1}' | xargs)`  
