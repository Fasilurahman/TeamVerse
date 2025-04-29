import { stripe } from "../../../config/stripe";
import { SubscriptionModel } from "../../../infrastructure/database/models/SubscriptionModel";
import { UserModel } from "../../../infrastructure/database/models/userModel";


export class HandleStripeWebhookUseCase {
    async execute(event: any): Promise<void> {
        console.log('going to hanlde stripe webhook usecase')
        switch(event.type){
            case 'checkout.session.completed':
                await this.handleCheckoutSessionCompleted(event.data.object);
                break;

            case 'invoice.payment_succeeded':
                await this.handleInvoicePaymentSucceeded(event.data.object);
                break;
            
            case 'customer.subscription.deleted':
                await this.handleSubscriptionCanceled(event.data.object);
                break;
            
        }
    }

    private async handleCheckoutSessionCompleted(session: any) {
        console.log('payment successful');
        const userId = session.metadata.userId;
        const subscriptionId = session.subscription;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const start = new Date(subscription.current_period_start * 1000);
        const end = new Date(start);
        end.setDate(start.getDate() + 28);
        const localSub = await SubscriptionModel.findOne({ stripeProductId: subscription.items.data[0].price.product });

        if (!localSub) {
            console.error('Subscription plan not found in local database.');
            return;
        }

        await UserModel.findByIdAndUpdate(userId, {
            isSubscribed: true,
            stripeSubscriptionId: subscription.id,
            subscriptionId: localSub?._id || null,
            subscriptionStart: start,
            subscriptionExpiry: end
        })

        await SubscriptionModel.findByIdAndUpdate(localSub._id, {
            $inc: { activeUsers: 1 }
        });
        console.log(`User ID: ${userId}, Subscription ID: ${subscriptionId}`);
    }

    private async handleInvoicePaymentSucceeded(invoice: any) {
        console.log('invoice payment succeeded');
    }

    private async handleSubscriptionCanceled(subscription: any) {
        console.log("Subscription canceled:", subscription.id);
    }
}