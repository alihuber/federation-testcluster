import * as argon2 from 'argon2';
import User from '../models/user.js';
import { getLogger } from './Logger.js';

const logger = getLogger('seedUsers');

const seedUsers = async () => {
  const foundUser1 = await User.findOneBy({ username: 'testuser1' });
  if (!foundUser1) {
    logger.info('user1 not found, seeding  user...');
    const password = await argon2.hash('example1', { secret: Buffer.from(process.env['PW_SECRET'] || 'supersecret') });
    await User.create({
      username: 'testuser1',
      password,
    }).save();
  } else {
    logger.info(`user found: ${foundUser1.id}, created at: ${foundUser1.createdAt}`);
  }

  const foundUser2 = await User.findOneBy({ username: 'testuser2' });
  if (!foundUser2) {
    logger.info('user2 not found, seeding  user...');
    const password = await argon2.hash('example2', { secret: Buffer.from(process.env['PW_SECRET'] || 'supersecret') });
    await User.create({
      username: 'testuser2',
      password,
    }).save();
  } else {
    logger.info(`user found: ${foundUser2.id}, created at: ${foundUser2.createdAt}`);
  }
};

export default seedUsers;
