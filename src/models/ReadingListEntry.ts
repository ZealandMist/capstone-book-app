import mongoose, { Schema } from "mongoose";

const EntrySchema = new Schema({
  list_id: {
    type: Schema.Types.ObjectId,
    ref: "ReadingList",
    required: true
  },
  book_id: {
    type: Schema.Types.ObjectId,
    ref: "Book",
    required: true
  },
  status: {
    type: String,
    enum: ["unread", "reading", "finished"],
    default: "unread"
  },
  date_added: {
    type: Date,
    default: Date.now
  },
  date_started: Date,
  date_finished: Date,
  rating: Number,
  review_text: String,
  reading_notes: String
});

export default mongoose.models.ReadingListEntry || mongoose.model("ReadingListEntry", EntrySchema);