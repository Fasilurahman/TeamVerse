import mongoose from 'mongoose';

const MeetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  duration: { type: String, required: true },
  privacy: { type: String, enum: ['public', 'private'], default: 'public' },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  summary: { type: String },   // 👉 New field added
  createdAt: { type: Date, default: Date.now },
});

export const MeetingModel = mongoose.model('Meeting', MeetingSchema);
