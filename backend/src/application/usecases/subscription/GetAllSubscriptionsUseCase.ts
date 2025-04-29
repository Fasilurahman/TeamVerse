import { IsItRecordAndNotAny } from "mongoose";
import { Subscription } from "../../../domain/entities/Subscription";
import { ISubscriptionRepository } from "../../../domain/repositories/ISubscriptionRepository";

export class GetAllSubscriptionsUseCase {
    constructor(
        private subscriptionRepository: ISubscriptionRepository
    ){}

    async execute(): Promise<Subscription[] | null>{
        return await this.subscriptionRepository.getAll()
    }
}