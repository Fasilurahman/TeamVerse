import Stripe from "stripe";
import { stripe } from "../../config/stripe";

export class StripeService {

    async createProductAndPrice(name: string, price: number, interval: 'month' | 'year'){
        const product = await stripe.products.create({name});
        const projectObject = await stripe.prices.create({
            unit_amount: price * 100,
            currency: 'usd',
            recurring: { interval },
            product: product.id
        })
        return { productId: product.id, priceId: projectObject.id };
    }

    async createCheckoutSession(priceId: string, userId: string){
        return await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1
            }],
            mode: 'subscription',
            success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/cancel`,
            metadata: {
                userId: userId
            }
        })
    }

    async retrieveSession(sessionId: string) {
        return await stripe.checkout.sessions.retrieve(sessionId)
    }

    async retrieveInvoice(invoiceId: string) {
        return await stripe.invoices.retrieve(invoiceId)
    }
}