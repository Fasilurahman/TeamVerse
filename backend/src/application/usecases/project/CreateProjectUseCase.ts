import { Project } from "../../../domain/entities/Project";
import { ProjectRepository } from "../../../infrastructure/database/repositories/ProjectRepository";
import { UserRepository } from "../../../infrastructure/database/repositories/UserRepository";
import { ChatRepository } from "../../../infrastructure/database/repositories/ChatRepository";
import { NotificationRepository } from "../../../infrastructure/database/repositories/NotificationRepository";
import { SocketService } from "../../../infrastructure/services/socketService";
import { SendNotificationUseCase } from "../../../application/usecases/Notification/SendNotificationUseCase";
import { Chat } from "../../../domain/entities/Chat";
import { Types } from "mongoose";
interface CreateProjectResult {
    project: Project;
    chat: any;
}

export class CreateProjectUseCase {
  constructor(
    private projectRepository: ProjectRepository,
    private userRepository: UserRepository,
    private chatRepository: ChatRepository,
    private notificationRepository: NotificationRepository,
    private socketService: SocketService,
    
) {}
    
  async execute(
      name: string,
      description: string,
      startDate: Date,
      endDate: Date,
      status: "pending" | "in-progress" | "completed" | "on-hold",
      priority: "low" | "medium" | "high" | "critical",
      category: string,
      teamId: string,
      teamLeadId: string,
      image?: string,
      documents?: string[]
  ): Promise<CreateProjectResult> {
      const project = new Project(
          "", name, description, startDate, endDate, status, priority, category, teamId, teamLeadId, image, documents
      );

      if (!Types.ObjectId.isValid(teamId)) {
        throw new Error('Invalid team ID');
     }

      const createdProject = await this.projectRepository.create(project);

      const teamMembers = await this.userRepository.getTeamMembers(teamId);
      const userIds = [teamLeadId, ...teamMembers.map((member: any) => member._id.toString())];
      
      const sendNotificationUseCase = new SendNotificationUseCase(this.notificationRepository, this.socketService);
      const projectNotificationMessage = `A new project "${createdProject.name}" has been created and assigned to your team.`;

      await sendNotificationUseCase.execute(userIds, projectNotificationMessage, 'project');

      const chatName = `Project-${createdProject.name}`;
      const chat = await this.chatRepository.createChat(createdProject.id, chatName, userIds);

      const chatNotificationMessage = `A new chat "${chatName}" has been created for the project "${createdProject.name}".`;
      await sendNotificationUseCase.execute(userIds, chatNotificationMessage, 'chat');
      return { project: createdProject, chat}
  }
}

