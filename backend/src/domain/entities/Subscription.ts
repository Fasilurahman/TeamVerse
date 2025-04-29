export class Subscription{
    constructor(
        public name: string,
        public price: number,
        public billingCycle: 'month' | 'year',
        public features: string[],
        public isPopular: boolean,
        public color: string,
        public description: string,
        public recommendedFor: string,
        public activeUsers: number,
        public stripeProductId?: string, 
        public stripePriceId?: string,
        public createdAt?: Date,
    ){}
}