import { Request, Response, NextFunction } from "express";
import { TeamRepository } from "../../infrastructure/database/repositories/TeamRepository";
import { FetchTeamMembersUsecase } from "../../application/usecases/team/FetchTeamMembersUsecase";
import { CreateTeamUseCase } from "../../application/usecases/team/CreateTeamUseCase";
import { GetTeamByIdUseCase } from "../../application/usecases/team/GetTeamByIdUseCase";
import { UpdateTeamUseCase } from "../../application/usecases/team/UpdateTeamUseCase";
import { DeleteTeamUseCase } from "../../application/usecases/team/DeleteTeamUseCase";
import { STATUS_CODES } from "../../shared/constants/statusCodes";
import { MESSAGES } from "../../shared/constants/ResponseMessages";

export class TeamController {
    private readonly teamRepository: TeamRepository;
    private readonly createTeamUseCase: CreateTeamUseCase;
    private readonly getTeamByIdUseCase: GetTeamByIdUseCase;
    private readonly updateTeamUseCase: UpdateTeamUseCase;
    private readonly deleteTeamUseCase: DeleteTeamUseCase;
    private readonly fetchTeamMembersUsecase: FetchTeamMembersUsecase;

    constructor() {
        this.teamRepository = new TeamRepository();
        this.createTeamUseCase = new CreateTeamUseCase(this.teamRepository);
        this.getTeamByIdUseCase = new GetTeamByIdUseCase(this.teamRepository);
        this.updateTeamUseCase = new UpdateTeamUseCase(this.teamRepository);
        this.deleteTeamUseCase = new DeleteTeamUseCase(this.teamRepository);
        this.fetchTeamMembersUsecase = new FetchTeamMembersUsecase(this.teamRepository);
        
    }

    async createTeam(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, teamLeadId, members } = req.body;
            const team = await this.createTeamUseCase.execute(name, teamLeadId, members);
            res.status(STATUS_CODES.CREATED).json({ team });
        } catch (error) {
            next(error);
        }
    }

    async getTeamById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const team = await this.getTeamByIdUseCase.execute(id);
            if (!team) {
                return res.status(STATUS_CODES.NOT_FOUND).json({ 
                    message: MESSAGES.TEAM.TEAM_NOT_FOUND 
                });
            }
            res.status(STATUS_CODES.OK).json({ team });
        } catch (error) {
            next(error);
        }
    }

    async updateTeam(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const updatedData = req.body;
            const updatedTeam = await this.updateTeamUseCase.execute(id, updatedData);
            if (!updatedTeam) {
                return res.status(STATUS_CODES.NOT_FOUND).json({ 
                    message: MESSAGES.TEAM.TEAM_NOT_FOUND 
                });
            }
            res.status(STATUS_CODES.OK).json({ updatedTeam });
        } catch (error) {
            next(error);
        }
    }

    async deleteTeam(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const deletedTeam = await this.deleteTeamUseCase.execute(id);
            if (!deletedTeam) {
                return res.status(STATUS_CODES.NOT_FOUND).json({ 
                    message: MESSAGES.TEAM.TEAM_NOT_FOUND 
                });
            }
            res.status(STATUS_CODES.OK).json({ 
                message: MESSAGES.TEAM.TEAM_DELETED 
            });
        } catch (error) {
            next(error);
        }
    }

    async fetchTeamMembers(req: Request, res: Response, next: NextFunction ) {
        try {
            const userId = req.query.userId as string;
            const users = await this.fetchTeamMembersUsecase.execute(userId);
            console.log(users, 'users')
            res.status(200).json(users);
          } catch (error) {
            console.error('Error in fetchTeamMembersController:', error);
            res.status(500).json({ message: 'Internal server error' });
          }
    }
}

