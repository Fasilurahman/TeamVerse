import { Request, Response, NextFunction } from "express";
import { CreateProjectUseCase } from "../../application/usecases/project/CreateProjectUseCase";
import { ProjectRepository } from "../../infrastructure/database/repositories/ProjectRepository";
import { UpdateProjectUseCase } from "../../application/usecases/project/UpdateProjectUseCase";
import { STATUS_CODES } from "../../shared/constants/statusCodes";
import { UserRepository } from "../../infrastructure/database/repositories/UserRepository";
import { GetAllUsersUseCase } from "../../application/usecases/user/GetAllUsersUseCase";
import { GetAllProjectsUseCase } from "../../application/usecases/project/GetAllProjectsUseCase";
import { GetProjectByIdUsecase } from '../../application/usecases/project/GetProjectByIdUsecase'
import { DeleteProjectUseCase } from '../../application/usecases/project/DeleteProjectUseCase'
import { NotificationRepository } from "../../infrastructure/database/repositories/NotificationRepository";
import { SocketService } from "../../infrastructure/services/socketService";
import { ChatRepository } from "../../infrastructure/database/repositories/ChatRepository";
import { MESSAGES } from "../../shared/constants/ResponseMessages";
import { TeamRepository } from "../../infrastructure/database/repositories/TeamRepository"
import { GetAllProjectsByTeamLeadUseCase } from "../../application/usecases/project/GetAllProjectsByTeamLeadUseCase";
import mongoose from 'mongoose'
import { Document } from 'mongoose';

export interface Project extends Document {
    _id: mongoose.Types.ObjectId;  
    name: string;
    teamId: mongoose.Types.ObjectId;
}

export interface User {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  role: "admin" | "team-lead" | "employee";
  password?: string;
  phone?: string;
  location?: string;
  company?: string;
  status: "active" | "inactive";
  profilePic?: string;
  teamId?: mongoose.Types.ObjectId;
  projects?: mongoose.Types.ObjectId[];
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}


export class ProjectController {
    private readonly userRepository: UserRepository;
    private readonly teamRepository: TeamRepository;
    private readonly projectRepository: ProjectRepository;
    private readonly notificationRepository: NotificationRepository;
    private readonly chatRepository: ChatRepository;
    
    private readonly getAllUsersUseCase: GetAllUsersUseCase;
    private readonly updateProjectUseCase: UpdateProjectUseCase;
    private readonly getAllProjectsUseCase: GetAllProjectsUseCase;
    private readonly getProjectByIdUsecase: GetProjectByIdUsecase;
    private readonly deleteProjectUseCase: DeleteProjectUseCase;
    private readonly getAllProjectsByTeamLeadUseCase: GetAllProjectsByTeamLeadUseCase;
    

    constructor() {
        this.userRepository = new UserRepository();
        this.teamRepository = new TeamRepository();
        this.projectRepository = new ProjectRepository();
        this.notificationRepository = new NotificationRepository();
        this.chatRepository = new ChatRepository();

        this.getAllUsersUseCase = new GetAllUsersUseCase(this.userRepository);
        this.updateProjectUseCase = new UpdateProjectUseCase(this.projectRepository, this.teamRepository);
        this.getAllProjectsUseCase = new GetAllProjectsUseCase(this.projectRepository);
        this.getProjectByIdUsecase = new GetProjectByIdUsecase(this.projectRepository);
        this.deleteProjectUseCase = new DeleteProjectUseCase(this.projectRepository);
        this.getAllProjectsByTeamLeadUseCase = new GetAllProjectsByTeamLeadUseCase(this.projectRepository);
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const io = req.app.get('io');
            const socketService = SocketService.getInstance(io);
            
            const createProjectUseCase = new CreateProjectUseCase(
                this.projectRepository,
                this.userRepository,
                this.chatRepository,
                this.notificationRepository,
                socketService
            );

            const { name, description, startDate, endDate, status, priority, category, teamId, teamLeadId } = req.body;
            const files = req.files as { [fieldname: string]: Express.MulterS3.File[] } | undefined;
            
            const image = files?.image?.[0]?.key;
            const documents = files?.documents?.map(file => file.key) || [];

            const result = await createProjectUseCase.execute(
                name,
                description,
                new Date(startDate),
                new Date(endDate),
                status,
                priority,
                category,
                teamId,
                teamLeadId,
                image,
                documents
            );

            res.status(STATUS_CODES.CREATED).json({ result });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { name, description, startDate, endDate, status, priority, category } = req.body;
            
            const teamMembers = req.body.teamMembers 
                ? JSON.parse(req.body.teamMembers)
                : [];

            const files = req.files as { [fieldname: string]: Express.MulterS3.File[] } | undefined;
            const image = files?.image?.[0]?.key;
            const documents = files?.documents?.map(file => file.key) || [];

            const updateData = {
                id,
                name,
                description,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                status,
                priority,
                category,
                teamMembers: Array.isArray(teamMembers) ? teamMembers : [],
                image,
                documents,
            };

            console.log(updateData, 'update data from controller of update')

            const result = await this.updateProjectUseCase.execute(id, updateData);
            res.status(STATUS_CODES.OK).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getAllEmployees(req: Request, res: Response, next: NextFunction) {
        try {
            const employees = await this.getAllUsersUseCase.execute();
            res.status(STATUS_CODES.OK).json(employees);
        } catch (error) {
            next(error);
        }
    }

    async getAllProjects(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.query.userId as string;
            console.log(userId,'userid')
            const projects = await this.getAllProjectsUseCase.execute(userId);
            res.status(STATUS_CODES.OK).json(projects);
        } catch (error) {
            next(error);
        }
    }

    async getProjectById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            console.log(id,'didididididididdi')
            const project = await this.getProjectByIdUsecase.execute(id);
            res.status(STATUS_CODES.OK).json(project);
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await this.deleteProjectUseCase.execute(id);
            res.status(STATUS_CODES.OK).json({
                message: MESSAGES.PROJECT.PROJECT_DELETED
            });
        } catch (error) {
            next(error);
        }
    }

    async getProjectsByTeamLead(req: Request, res: Response, next: NextFunction) {
        try {
            const teamLeadId = req.query.teamLeadId as string;
            const projects = await this.getAllProjectsByTeamLeadUseCase.execute(teamLeadId);
            res.status(STATUS_CODES.OK).json(projects);
        } catch (error) {
            next(error)
        }
    }
}