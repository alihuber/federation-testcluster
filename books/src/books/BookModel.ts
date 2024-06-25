import BookInterface from './BookInterface.js';
import bookSchema from './BookSchema.js';

import mongoose from 'mongoose';

const BookModel = mongoose.model<BookInterface>('Book', bookSchema);

export default BookModel;
