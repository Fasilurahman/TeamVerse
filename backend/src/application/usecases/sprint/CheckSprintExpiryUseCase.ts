import { ISprintRepository } from "../../../domain/repositories/ISprintRepository";
import { ITaskRepository } from "../../../domain/repositories/ITaskRepository";

export class CheckSprintExpiryUseCase {
    constructor(
        private sprintRepository: ISprintRepository,
        private taskRepository: ITaskRepository
    ){}

    async execute(): Promise<void> {
        const expiredSprints = await this.sprintRepository.getExpiredSprints();
        for (const sprint of expiredSprints){
            await this.sprintRepository.markSprintCompleted(sprint.id);
            await this.taskRepository.moveTasksToBacklog(sprint.id);
        }
    }
}