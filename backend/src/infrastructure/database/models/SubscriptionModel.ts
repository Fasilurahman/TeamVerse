import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    billingCycle: { type: String, enum: ["month", "year"], required: true },
    features: { type: [String], default: [] },
    isPopular: { type: Boolean, default: false },
    color: { type: String, default: "#6366F1" },
    description: { type: String, required: true },
    recommendedFor: { type: String, required: true },
    activeUsers: { type: Number, default: 0 },
    stripeProductId: { type: String, required: true },
    stripePriceId: { type: String, required: true }
  },
  { timestamps: true }
);

export const SubscriptionModel = mongoose.model("Subscription", SubscriptionSchema);
