import User from '../models/user.js';
import { getLogger } from './Logger.js';

const logger = getLogger('seedUsers');

const seedUsers = async () => {
  const foundUser1 = await User.findOneBy({ id: 1 });
  if (!foundUser1) {
    logger.info('user1 not found, seeding  user...');
    await User.create({
      id: 1,
      username: 'testuser1',
      email: 'test1@example.com',
    }).save();
  } else {
    logger.info(`user found: ${foundUser1.id}, created at: ${foundUser1.createdAt}`);
  }

  const foundUser2 = await User.findOneBy({ id: 2 });
  if (!foundUser2) {
    logger.info('user2 not found, seeding  user...');
    await User.create({
      id: 2,
      username: 'testuser2',
      email: 'test2@example.com',
    }).save();
  } else {
    logger.info(`user found: ${foundUser2.id}, created at: ${foundUser2.createdAt}`);
  }
};

export default seedUsers;
