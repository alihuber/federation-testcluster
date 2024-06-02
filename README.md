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

## Deploy users service

Start User-Service at least once, to make sure database migrations are working and file users.graphql is created:   
`cd users && npm run dev`  
`docker build -t users-service:1 .`  

`docker images` should now display kubernetes stuff and users-service image    

`kubectl apply -f users-service-deployment.yaml`  
`kubectl apply -f users-service-svc.yaml`  
`cd ..`  

## Deploy gateway

`cd gateway`  
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
  --data '{"query":"query { user(userId: 1) { username } }"}'
```
Alternatively expose via ingress, see next step  

## Expose gateway via ingress and domain

Enable ingress addon, wait a few minutes  
`minikube addons enable ingress`  
In a separate terminal, start minikube tunnel  
`minikube tunnel`  
Apply ingress config  
`kubectl apply ingress.yaml`  
This should not error:  
`curl --resolve "hello-world.example:80:127.0.0.1" -i http://hello-world.example`  
Add the line  
`127.0.0.1 hello-world.example`  
in /etc/hosts  

Now the gateway can be queried like  
```bash
curl --request POST \
  --header 'content-type: application/json' \
  --url 'http://hello-world.example/graphql' \
  --data '{"query":"query { user(userId: 1) { username } }"}'
```

## Cleanup
`kubectl delete all --all -n federation`  
`kubectl delete ingress example-ingress -n federation`  
`kubectl get all -A` should only display stuff from ingress-nginx, kube-system and kubernetes-dashboard namespaces  
Delete images:  
`docker image rm <image id>`  
Stop minikube:  
`minikube stop`  
Reset docker-env:  
`unset $(env | grep DOCKER | awk -F'=' '{print $1}' | xargs)`  
