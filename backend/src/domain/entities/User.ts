export class User {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public role: "admin" | "team-lead" | "employee",
    public password: string | null,
    public profilePic: string,
    public teamId: string | null,
    public projects: string[] | null,
    public createdAt: Date | null,
    public updatedAt: Date | null,
    public isBlocked: boolean,
    public phone: string | null,
    public location: string | null,
    public company: string | null,
    public status: "active" | "inactive",
    
    // ✅ Stripe-related fields
    public isSubscribed: boolean,
    public stripeSubscriptionId: string | null,
    public subscriptionId: string | null, // optional, maps to your internal SubscriptionModel
    public subscriptionStart: Date | null,
    public subscriptionExpiry: Date | null
  ) {}
}
