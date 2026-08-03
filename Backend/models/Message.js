import mongoose from "mongoose";
const messageSchema = new mongoose.Schema({
  room: { type: String, required: true },
  author: String,
  message: String,
  type: { type: String, default: "text" },
  fileData: String,
  fileName: String,
  replyTo: {
    author: String,
    message: String,
  },
  reactions: { type: Object, default: {} },
  deleted: { type: Boolean, default: false },
  time: String,
  createdAt: { type: Date, default: Date.now },
  status: {
  type: String,
  default: "sent"
}
});
export default mongoose.model("Message", messageSchema);