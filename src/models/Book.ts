import mongoose, { Schema } from "mongoose";

const BookSchema = new Schema({
  google_books_id: {
    type: String,
    unique: true
  },
  title: String,
  subtitle: String,
  publication_date: Date,
  publisher: String,
  description: String,
  page_count: Number,
  language: String,
  authors: [String],
  thumbnail: String
});

export default mongoose.models.Book || mongoose.model("Book", BookSchema);