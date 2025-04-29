import { Request, Response, NextFunction } from "express";
import { SubscriptionRepository } from "../../infrastructure/database/repositories/SubscriptionRepository";
import { CreateSubscriptionUseCase } from "../../application/usecases/subscription/CreateSubscriptionUseCase";
import { UpdateSubscriptionUseCase } from "../../application/usecases/subscription/UpdateSubscriptionUseCase";
import { DeleteSubscriptionUseCase } from "../../application/usecases/subscription/DeleteSubscriptionUseCase";
import { GetAllSubscriptionsUseCase } from "../../application/usecases/subscription/GetAllSubscriptionsUseCase";
import { StripeService } from "../../infrastructure/services/StripeService";
import { STATUS_CODES } from "../../shared/constants/statusCodes";
import { MESSAGES } from "../../shared/constants/ResponseMessages";
import { GetReceiptBySessionId } from "../../application/usecases/subscription/GetReceiptBySessionId";

export class SubscriptionController {
    private readonly subscriptionRepository: SubscriptionRepository;
    private readonly createSubscriptionUseCase: CreateSubscriptionUseCase;
    private readonly updateSubscriptionUseCase: UpdateSubscriptionUseCase;
    private readonly deleteSubscriptionUseCase: DeleteSubscriptionUseCase;
    private readonly getAllSubscriptionsUseCase: GetAllSubscriptionsUseCase;
    private readonly stripeService: StripeService;
    private readonly getReceiptBySessionId: GetReceiptBySessionId;

    constructor() {
        this.subscriptionRepository = new SubscriptionRepository();
        this.stripeService = new StripeService();
        this.createSubscriptionUseCase = new CreateSubscriptionUseCase(this.subscriptionRepository);
        this.updateSubscriptionUseCase = new UpdateSubscriptionUseCase(this.subscriptionRepository);
        this.deleteSubscriptionUseCase = new DeleteSubscriptionUseCase(this.subscriptionRepository);
        this.getAllSubscriptionsUseCase = new GetAllSubscriptionsUseCase(this.subscriptionRepository);
        this.getReceiptBySessionId = new GetReceiptBySessionId(this.stripeService);
    }

    async createSubscription(req: Request, res: Response, next: NextFunction) {
        try {
            const subscription = await this.createSubscriptionUseCase.execute(req.body);
            return res.status(STATUS_CODES.CREATED).json(subscription);
        } catch (error) {
            next(error);
        }
    }

    async getAllSubscriptions(req: Request, res: Response, next: NextFunction) {
        try {
            const subscriptions = await this.getAllSubscriptionsUseCase.execute();
            res.status(STATUS_CODES.OK).json(subscriptions);
        } catch (error) {
            next(error);
        }
    }

    async updateSubscription(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const subscription = await this.updateSubscriptionUseCase.execute(id, req.body);
            return res.status(STATUS_CODES.OK).json(subscription);
        } catch (error) {
            next(error);
        }
    }

    async deleteSubscription(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await this.deleteSubscriptionUseCase.execute(id);
            return res.status(STATUS_CODES.OK).json(result);
        } catch (error) {
            next(error);
        }
    }

    async createCheckoutSession(req: Request, res: Response, next: NextFunction) {
        try {
            const { priceId } = req.body;
            if (!priceId) {
                return res.status(STATUS_CODES.BAD_REQUEST).json({ error: "Missing sessionId"});
            }

            const session = await this.stripeService.createCheckoutSession(
                priceId, 
                req.user.id
            );
            console.log('session',session)
            return res.status(STATUS_CODES.OK).json({ url: session.url });
        } catch (error) {
            next(error);
        }
    }

    async getReceipt(req: Request, res: Response, next: NextFunction) {
        try {
            const { sessionId } = req.query;
            if (!sessionId) {
                return res.status(STATUS_CODES.BAD_REQUEST).json({
                    error: "Missing priceId"
                });
            }

            const receipt = await this.getReceiptBySessionId.execute(sessionId as string);
            res.status(STATUS_CODES.OK).json(receipt);
        } catch (error) {
            next(error);
        }
    }
}
