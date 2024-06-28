import User from '../models/user.js';
import { Arg, Query, Resolver } from 'type-graphql';
import { getLogger } from '../utils/Logger.js';

const logger = getLogger('UsersResolver');

@Resolver((_of) => User)
export default class AccountsResolver {
  @Query(() => User, { nullable: true })
  async user(@Arg('username', () => String) username: string): Promise<User | null> {
    logger.info({
      message: `Got user request for user ${username}`,
    });
    return User.findOneBy({ username });
  }
}

// this is what would be defined in the resolvers object in standard ApolloGraphQL, we have to merge this manually?
export const UserReferenceResolver = {
  __resolveReference: ({ id }) => {
    logger.info({
      message: `Got user reference request for user ${id}`,
    });
    return User.findOneBy({ id });
  },
};
