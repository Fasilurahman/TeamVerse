import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { 
      type: Date, 
      required: true, 
      validate: {
        validator: function (this: any, value: Date) {
          return value > this.startDate;
        },
        message: "End date must be after start date.",
      },
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "on-hold"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    category: { type: String, required: true },

    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
    teamLeadId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    image: { type: String },
    documents: [{ type: String }],
  },
  { timestamps: true }
);

export const ProjectModel = mongoose.model("Project", ProjectSchema);
