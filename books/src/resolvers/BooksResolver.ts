import { FieldResolver, Query, Resolver, Root } from 'type-graphql';
import { getLogger } from '../utils/Logger.js';
import BookModel from '../books/BookModel.js';
import Book from '../books/Book.js';
import BookInterface from '../books/BookInterface.js';

const logger = getLogger('BooksResolver');

@Resolver((_of) => Book)
export default class BooksResolver {
  @Query(() => [Book], { nullable: true })
  async allBooks(): Promise<Array<Book> | null> {
    logger.info({
      message: 'got all books request',
    });
    const found: unknown = await BookModel.find({}, null, {
      sort: { createdAt: 1 },
    }).exec();
    return found as [Book];
  }

  // this resolves the minimal version of the other entity
  @FieldResolver()
  author(@Root() book: BookInterface) {
    return { id: book.author.id };
  }
}
