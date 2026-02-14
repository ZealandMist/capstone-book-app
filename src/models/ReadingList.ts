import mongoose, { Schema} from "mongoose";
// ensure related models are registered with mongoose
import "./ReadingListEntry";

const ReadingListSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: String,
  description: String,
  created_at: {
    type: Date,
    default: Date.now
  }
});


ReadingListSchema.virtual("entries", {
  ref: "ReadingListEntry",
  localField: "_id",
  foreignField: "list_id",
});

// allow virtuals in responses
ReadingListSchema.set("toJSON", { virtuals: true });
ReadingListSchema.set("toObject", { virtuals: true });

export default mongoose.models.ReadingList || mongoose.model("ReadingList", ReadingListSchema);
