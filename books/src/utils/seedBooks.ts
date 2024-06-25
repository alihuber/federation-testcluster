import BookModel from '../books/BookModel.js';
import { getLogger } from './Logger.js';

const logger = getLogger('seedBooks');

const seedBooks = async () => {
  const foundBook1 = await BookModel.findOne({ title: 'Test Book 1' }).exec();
  if (!foundBook1) {
    logger.info('book 1 not found, seeding  book...');
    await BookModel.create({
      title: 'Test Book 1',
      content: 'some content 1',
    });
  } else {
    logger.info(`book 1 found: ${foundBook1._id}, created at: ${foundBook1.createdAt}`);
  }

  const foundBook2 = await BookModel.findOne({ title: 'Test Book 2' }).exec();
  if (!foundBook2) {
    logger.info('book 2 not found, seeding  book...');
    await BookModel.create({
      title: 'Test Book 2',
      content: 'some content 2',
    });
  } else {
    logger.info(`book 2 found: ${foundBook2._id}, created at: ${foundBook2.createdAt}`);
  }
};

export default seedBooks;
