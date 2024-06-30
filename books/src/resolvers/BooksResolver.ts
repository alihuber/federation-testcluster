import { Arg, FieldResolver, Query, Resolver, Root } from 'type-graphql';
import { container } from 'tsyringe';
import { getLogger } from '../utils/Logger.js';
import Book from '../books/Book.js';
import BookInterface from '../books/BookInterface.js';
import BooksService from '../services/BooksService.js';

const logger = getLogger('BooksResolver');

@Resolver((_of) => Book)
export default class BooksResolver {
  readonly booksService: BooksService;

  constructor() {
    this.booksService = container.resolve(BooksService);
  }

  @Query(() => [Book], { nullable: true })
  async allBooks(@Arg('timeout', { nullable: true, defaultValue: false }) timeout: boolean): Promise<Array<Book> | null> {
    logger.info({
      message: 'got all books request',
    });
    return this.booksService.getAllBooks(timeout);
  }

  // this resolves the minimal version of the other entity
  @FieldResolver()
  author(@Root() book: BookInterface) {
    return { id: book.author.id };
  }
}
