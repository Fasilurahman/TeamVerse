import { Subscription } from "../../../domain/entities/Subscription";
import { ISubscriptionRepository } from "../../../domain/repositories/ISubscriptionRepository";
import { SubscriptionModel } from "../models/SubscriptionModel";

export class SubscriptionRepository implements ISubscriptionRepository {
    async create(subscription: Subscription): Promise<Subscription>{
        console.log('entring to subscription repo')
        const newSubscription = new SubscriptionModel({
            name: subscription.name,
            price: subscription.price,
            billingCycle: subscription.billingCycle,
            features: subscription.features,
            isPopular: subscription.isPopular,
            color: subscription.color,
            description: subscription.description,
            recommendedFor: subscription.recommendedFor,
            activeUsers: subscription.activeUsers,
            stripeProductId: subscription.stripeProductId, 
            stripePriceId: subscription.stripePriceId
        });
        return await newSubscription.save();
    }

    async getAll(): Promise<Subscription[] | null>{ 
        return await SubscriptionModel.find();
    }

    async update(id: string, subscription: Partial<Subscription>):Promise<Subscription | null>{
        return await SubscriptionModel.findByIdAndUpdate(id, subscription, {new: true});
    }

    async delete(id: string): Promise<boolean>{
        const result = await SubscriptionModel.findByIdAndDelete(id);
        return !!result;

    }   

    async getById(id: string): Promise<Subscription | null>{
        return await SubscriptionModel.findById(id);
    }
}