import { singleton } from 'tsyringe';
import axios from 'axios';
import Book from '../books/Book.js';
import BookModel from '../books/BookModel.js';

@singleton()
export default class BooksService {
  async getAllBooks(timeout: boolean): Promise<Array<Book>> | null {
    if (timeout) {
      const instance = axios.create({
        baseURL: 'https://httpstat.us/504?sleep=30000',
        // timeout: 5000,
      });
      await instance.request({ method: 'get' });
    }
    const found: unknown = await BookModel.find({}, null, {
      sort: { createdAt: 1 },
    }).exec();
    return found as [Book];
  }
}
