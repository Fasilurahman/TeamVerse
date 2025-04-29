import mongoose from "mongoose";

const SubtaskSchema = new mongoose.Schema(
  {
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ["low", "medium", "high"], default: "low" },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ["todo", "in-progress", "completed"], default: "todo" },
  },
  { timestamps: true }
);

const TaskSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    status: { type: String, enum: ["backlog", "todo", "in-progress", "completed"], default: "backlog" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    dueDate: { type: Date, required: true },
    sprintId: { type: mongoose.Schema.Types.ObjectId, ref: "Sprint", default: null },
    subtasks: [SubtaskSchema],
  },
  { timestamps: true }
);

export const TaskModel = mongoose.model("Task", TaskSchema);
