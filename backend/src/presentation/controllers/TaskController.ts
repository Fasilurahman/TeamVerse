import { Request, Response, NextFunction } from "express";
import { CreateTaskUseCase } from "../../application/usecases/task/CreateTaskUseCase";
import { TaskRepository } from "../../infrastructure/database/repositories/TaskRepository";
import { CreateSubtaskUseCase } from "../../application/usecases/task/CreateSubtaskUseCase";
import { STATUS_CODES } from "../../shared/constants/statusCodes";
import { GetTasksByProjectIdUseCase } from "../../application/usecases/task/GetTasksByProjectIdUseCase";
import { UpdateTaskUseCase } from "../../application/usecases/task/UpdateTaskUseCase";
import { DeleteTaskUseCase } from "../../application/usecases/task/DeleteTaskUseCase";
import { GetTasksByUserIdUseCase } from '../../application/usecases/task/GetTasksByUserIdUseCase';
import { GetSubtasksByUserIdUseCase } from '../../application/usecases/task/GetSubtasksByUserIdUseCase';
import { DeleteSubtaskUseCase } from "../../application/usecases/task/DeleteSubtaskUseCase";
import { GetSubtasksByTaskIdUseCase } from '../../application/usecases/task/GetSubtasksByTaskIdUseCase';
import { UpdateSubtaskUseCase } from '../../application/usecases/task/UpdateSubtaskUseCase';
import { GetAllTaskUseCase } from "../../application/usecases/task/GetAllTaskUseCase";
import { SocketService } from "../../infrastructure/services/socketService";
import { GetBacklogsByProjectIdUseCase } from "../../application/usecases/task/GetBacklogsByProjectIdUseCase"
import { NotificationRepository } from "../../infrastructure/database/repositories/NotificationRepository";
import { UpdateTaskStatusUseCase } from "../../application/usecases/task/UpdateTaskStatusUseCase";
import { UpdateTaskStatusByTaskIdUseCase } from "../../application/usecases/task/UpdateTaskStatusByTaskIdUseCase";
import { MESSAGES } from "../../shared/constants/ResponseMessages";

export class TaskController {
    private readonly taskRepository: TaskRepository;
    private readonly createSubtaskUseCase: CreateSubtaskUseCase;
    private readonly getTasksByProjectIdUseCase: GetTasksByProjectIdUseCase;
    private readonly deleteTaskUseCase: DeleteTaskUseCase;
    private readonly getTasksByUserIdUseCase: GetTasksByUserIdUseCase;
    private readonly getSubtasksByUserIdUseCase: GetSubtasksByUserIdUseCase;
    private readonly deleteSubtaskUseCase: DeleteSubtaskUseCase;
    private readonly getSubtasksByTaskIdUseCase: GetSubtasksByTaskIdUseCase;
    private readonly updateSubtaskUseCase: UpdateSubtaskUseCase;
    private readonly getAllTaskUseCase: GetAllTaskUseCase;
    private readonly getBacklogsByProjectIdUseCase: GetBacklogsByProjectIdUseCase;
    private readonly updateTaskStatusUseCase: UpdateTaskStatusUseCase;
    private readonly updateTaskStatusByTaskIdUseCase: UpdateTaskStatusByTaskIdUseCase;

    constructor() {
        this.taskRepository = new TaskRepository();
        this.createSubtaskUseCase = new CreateSubtaskUseCase(this.taskRepository);
        this.getTasksByProjectIdUseCase = new GetTasksByProjectIdUseCase(this.taskRepository);
        this.deleteTaskUseCase = new DeleteTaskUseCase(this.taskRepository);
        this.getTasksByUserIdUseCase = new GetTasksByUserIdUseCase(this.taskRepository);
        this.getSubtasksByUserIdUseCase = new GetSubtasksByUserIdUseCase(this.taskRepository);
        this.deleteSubtaskUseCase = new DeleteSubtaskUseCase(this.taskRepository);
        this.getSubtasksByTaskIdUseCase = new GetSubtasksByTaskIdUseCase(this.taskRepository);
        this.updateSubtaskUseCase = new UpdateSubtaskUseCase(this.taskRepository);
        this.getAllTaskUseCase = new GetAllTaskUseCase(this.taskRepository);
        this.getBacklogsByProjectIdUseCase = new GetBacklogsByProjectIdUseCase(this.taskRepository);
        this.updateTaskStatusUseCase = new UpdateTaskStatusUseCase(this.taskRepository);
        this.updateTaskStatusByTaskIdUseCase = new UpdateTaskStatusByTaskIdUseCase(this.taskRepository);
    }

    async createTask(req: Request, res: Response, next: NextFunction) {
        try {
            const io = req.app.get('io');
            const notificationRepository = new NotificationRepository();
            const socketService = SocketService.getInstance(io);
            const createTaskUseCase = new CreateTaskUseCase(
                this.taskRepository,
                notificationRepository,
                socketService
            );
            const task = await createTaskUseCase.execute(req.body);
            return res.status(STATUS_CODES.CREATED).json(task);
        } catch (error) {
            next(error);
        }
    }

    async getTasksByProjectId(req: Request, res: Response, next: NextFunction) {
        try {
            const { projectId } = req.params;
            const tasks = await this.getTasksByProjectIdUseCase.execute(projectId);
            return res.status(STATUS_CODES.OK).json(tasks);
        } catch (error) {
            next(error);
        }
    }

    async getAllTasks(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;
            const tasks = await this.getAllTaskUseCase.execute(userId);
            return res.status(STATUS_CODES.OK).json(tasks);
        } catch (error) {
            next(error);
        }
    }

    async updateTask(req: Request, res: Response, next: NextFunction) {
        try {
            const io = req.app.get('io');
            const notificationRepository = new NotificationRepository();
            const socketService = SocketService.getInstance(io);
            const updateTaskUseCase = new UpdateTaskUseCase(
                this.taskRepository,
                notificationRepository,
                socketService
            );
            const { taskId } = req.params;
            const updatedTaskData = req.body;
            const result = await updateTaskUseCase.execute(taskId, updatedTaskData);
            return res.status(STATUS_CODES.OK).json(result);
        } catch (error) {
            next(error);
        }
    }

    async deleteTask(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await this.deleteTaskUseCase.execute(id);
            return res.status(STATUS_CODES.OK).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getTasksByUserId(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;
            const tasks = await this.getTasksByUserIdUseCase.execute(userId);
            return res.status(STATUS_CODES.OK).json(tasks);
        } catch (error) {
            next(error);
        }
    }

    async createSubtask(req: Request, res: Response, next: NextFunction) {
        try {
            const { taskId, title, description, status, priority, dueDate } = req.body;
            const newSubtask = { 
                taskId, 
                name: title, 
                description, 
                status, 
                priority, 
                dueDate 
            };
            const subtask = await this.createSubtaskUseCase.execute(newSubtask);
            return res.status(STATUS_CODES.CREATED).json(subtask);
        } catch (error) {
            next(error);
        }
    }

    async getSubtasksByUserId(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;
            const subtasks = await this.getSubtasksByUserIdUseCase.execute(userId);
            return res.status(STATUS_CODES.OK).json(subtasks);
        } catch (error) {
            next(error);
        }
    }

    async deleteSubtask(req: Request, res: Response, next: NextFunction) {
        try {
            const { subtaskId } = req.params;
            const updatedTask = await this.deleteSubtaskUseCase.execute(subtaskId);
            return res.status(STATUS_CODES.OK).json(updatedTask);
        } catch (error) {
            next(error);
        }
    }

    async getSubtasksByTaskId(req: Request, res: Response, next: NextFunction) {
        try {
            const { taskId } = req.params;
            const subtasks = await this.getSubtasksByTaskIdUseCase.execute(taskId);
            return res.status(STATUS_CODES.OK).json(subtasks);
        } catch (error) {
            next(error);
        }
    }

    async updateSubtask(req: Request, res: Response, next: NextFunction) {
        try {
            const { taskId, subtaskId } = req.params;
            const updateData = req.body;
            const updatedSubtask = await this.updateSubtaskUseCase.execute(
                taskId, 
                subtaskId, 
                updateData
            );

            if (!updatedSubtask) {
                return res.status(STATUS_CODES.NOT_FOUND).json({
                    message: MESSAGES.TASK.SUBTASK_NOT_FOUND
                });
            }
            return res.status(STATUS_CODES.OK).json(updatedSubtask);
        } catch (error) {
            next(error);
        }
    }

    async getBacklogsByProjectId(req: Request, res: Response, next: NextFunction) {
        try {
            const { projectId } = req.params
            const backlogs = await this.getBacklogsByProjectIdUseCase.execute(projectId);
            return res.status(STATUS_CODES.OK).json(backlogs);
        } catch (error) {
            next(error);
        }
    }

    async updateTaskStatusController(req: Request, res: Response, next: NextFunction) {
        try {
            const { taskId } = req.params;
            const { status,sprintId } = req.body;
   
            const result = await this.updateTaskStatusUseCase.execute(taskId, status, sprintId);
            return res.status(STATUS_CODES.OK).json(result);
        } catch (error) {
            next(error);
        }
    }

    async updateTaskStatusByTaskId (req: Request, res: Response, next: NextFunction) {
        try {
            const { taskId } = req.params;
            const { status } = req.body;
            console.log(taskId, status, 'taskId and status in controller')
            const updatedTask = await this.updateTaskStatusByTaskIdUseCase.execute(taskId, status);
            console.log(updatedTask,' updated task in controller')
            return res.status(200).json({ message: "Task status updated successfully", task: updatedTask });
        } catch (error) {
            next(error);
        }
    }
}
