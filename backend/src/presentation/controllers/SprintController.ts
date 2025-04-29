import { Request, Response, NextFunction } from 'express';
import { STATUS_CODES } from '../../shared/constants/statusCodes';
import { SprintRepository } from '../../infrastructure/database/repositories/SprintRepository';
import { CreateSprintUseCase } from '../../application/usecases/sprint/CreateSprintUseCase';
import { GetSprintsByProjectIdUseCase } from '../../application/usecases/sprint/GetSprintsByProjectIdUseCase';


export class SprintController {
    private readonly sprintRepository: SprintRepository;
    private readonly createSprintUseCase: CreateSprintUseCase;
    private readonly getSprintsByProjectIdUseCase: GetSprintsByProjectIdUseCase;
    constructor() {
        this.sprintRepository = new SprintRepository();
        this.createSprintUseCase = new CreateSprintUseCase(this.sprintRepository);
        this.getSprintsByProjectIdUseCase = new GetSprintsByProjectIdUseCase(this.sprintRepository);
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { projectId, name, startDate, endDate } = req.body;
            const sprint = await this.createSprintUseCase.execute(name,startDate, endDate,projectId);
            return res.status(STATUS_CODES.CREATED).json(sprint);
        } catch (error) {
            next(error);
        }
    }

    async getAllSprints(req: Request, res: Response, next: NextFunction) {
        try {
            const { projectId } = req.query as { projectId: string };
            console.log(projectId, "projectId in controller");
            
            const sprints = await this.getSprintsByProjectIdUseCase.execute(projectId);
            console.log(sprints, "sprints in controller")
            return res.status(STATUS_CODES.OK).json(sprints);
        } catch (error) {
            next(error);
        }
    }


}