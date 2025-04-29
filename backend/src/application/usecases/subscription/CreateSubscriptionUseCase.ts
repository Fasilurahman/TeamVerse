import { Subscription } from "../../../domain/entities/Subscription";
import { ISubscriptionRepository } from "../../../domain/repositories/ISubscriptionRepository";
import { stripe } from "../../../config/stripe";
export class CreateSubscriptionUseCase {
    constructor(
        private subscriptionRepository: ISubscriptionRepository
    ){}

    async execute(subscription: Subscription): Promise<Subscription>{
        const product = await stripe.products.create({
            name: subscription.name,
            description: subscription.description,
        })

        const price = await stripe.prices.create({
            unit_amount: subscription.price * 100,
            currency: 'usd',
            recurring: { interval: subscription.billingCycle },
            product: product.id,
        })

        const newSubscription = new Subscription(
            subscription.name,
            subscription.price,
            subscription.billingCycle,
            subscription.features,
            subscription.isPopular,
            subscription.color,
            subscription.description,
            subscription.recommendedFor,
            subscription.activeUsers,
            product.id,
            price.id
        )

        return await this.subscriptionRepository.create(newSubscription)
    }
}