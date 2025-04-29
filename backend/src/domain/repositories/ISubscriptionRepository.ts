import { Subscription } from "../entities/Subscription";

export interface ISubscriptionRepository {
    create(subscription: Subscription):Promise<Subscription>;
    getAll():Promise<Subscription[] | null>;
    getById(id: string): Promise<Subscription | null>;
    update(id: string, subscription: Partial<Subscription>): Promise<Subscription | null>;
    delete(id: string): Promise<boolean>;
}