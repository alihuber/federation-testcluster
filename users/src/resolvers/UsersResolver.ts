import User from '../models/user.js';
import { Arg, Int, Query, Resolver } from 'type-graphql';
import { getLogger } from '../utils/Logger.js';

const logger = getLogger('UsersResolver');

@Resolver((_of) => User)
export default class AccountsResolver {
  @Query(() => User, { nullable: true })
  async user(@Arg('userId', () => Int) userId: number): Promise<User | null> {
    logger.debug({
      message: `Got user request for user ${userId}`,
    });
    return User.findOneBy({ id: userId });
  }
}
