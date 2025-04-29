import { Subscription } from "../../../domain/entities/Subscription";
import { ISubscriptionRepository } from "../../../domain/repositories/ISubscriptionRepository";
import { MESSAGES } from "../../../shared/constants/ResponseMessages";

export class DeleteSubscriptionUseCase {
    constructor(
        private subscriptionRepository: ISubscriptionRepository
    ){}

    async execute(id: string): Promise<boolean>{
        if(!id) throw new Error(MESSAGES.SUBSCRIPTION.INVALID_SUBSCRIPTION_ID);
        return await this.subscriptionRepository.delete(id);
    }
}