import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { 
      type: String, 
      required: true, 
      enum: ["admin", "team-lead", "employee"], 
      default: "employee" 
    },
    password: { type: String },
    phone: { type: String },
    location: { type: String},
    company: { type: String},
    status: { type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    profilePic: { type: String, default: "" },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    isSubscribed: { type: Boolean, default: false },
    stripeSubscriptionId: { type: String, default: null },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", default: null },
    subscriptionStart: { type: Date, default: null },
    subscriptionExpiry: { type: Date, default: null },
    isBlocked: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const UserModel = mongoose.model('User', UserSchema);