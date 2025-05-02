import { IStatsRepository } from "../../../domain/repositories/IStatsRepository";


export class GetUserChartDataUseCase {
    constructor(private statsRepository: IStatsRepository ){}

    async execute(id: string) {
        return await this.statsRepository.getUserChartData(id);
    }
}