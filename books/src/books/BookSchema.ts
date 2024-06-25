import mongoose from 'mongoose';
import BookInterface from './BookInterface';

const bookSchema = new mongoose.Schema<BookInterface>(
  {
    title: String,
    content: String,
  },
  { timestamps: true }
);

export default bookSchema;
