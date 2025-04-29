import { Request, Response , NextFunction } from "express";
import { SubscriptionRepository } from "../../infrastructure/database/repositories/SubscriptionRepository";
import { UserRepository } from "../../infrastructure/database/repositories/UserRepository";
import { GetAdminChartDataUseCase } from "../../application/usecases/chart/GetAdminChartDataUseCase";
import { GetAdminStatsUseCase } from "../../application/usecases/chart/GetAdminStatsUseCase";
import { GetDashboardStatsUseCase } from "../../application/usecases/chart/GetDashboardStatsUseCase";
import { StatsRepository } from "../../infrastructure/database/repositories/StatsRepository";
import { STATUS_CODES } from "../../shared/constants/statusCodes";



export class ChartDataController {
    private getAdminChartDataUseCase: GetAdminChartDataUseCase;
    private getAdminStatsUseCase: GetAdminStatsUseCase;
    private getDashboardStatsUseCase: GetDashboardStatsUseCase;
    private statsRepository: StatsRepository;


    constructor(){
        const subscriptionRepository = new SubscriptionRepository();
        const userRepository = new UserRepository();
        this.statsRepository = new StatsRepository();
        this.getAdminChartDataUseCase = new GetAdminChartDataUseCase(subscriptionRepository, userRepository);
        this.getAdminStatsUseCase = new GetAdminStatsUseCase(subscriptionRepository, userRepository);
        this.getDashboardStatsUseCase = new GetDashboardStatsUseCase(this.statsRepository);
    }

    async getChartData(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await this.getAdminChartDataUseCase.execute()
            res.status(STATUS_CODES.OK).json(data);
        } catch (error) {
            next(error);
        }
    }

    async getStatsData(req: Request, res: Response, next: NextFunction){
        try {
            const data = await this.getAdminStatsUseCase.execute();
            res.status(STATUS_CODES.OK).json(data);
        } catch (error) {
            next(error);
        }
    }

    async getStatsUserData(req: Request, res: Response, next: NextFunction){
        try {
            const data = await this.getDashboardStatsUseCase.execute();
            res.status(STATUS_CODES.OK).json(data);
        } catch (error) {
            next(error);
        }
    }
}