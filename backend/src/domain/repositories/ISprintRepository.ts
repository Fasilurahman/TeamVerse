import { Sprint } from "../entities/Sprint";
import { Task } from "../entities/Task";
export interface ISprintRepository {
    create(sprint: Sprint): Promise<Sprint>;
    findByProjectId(projectId: string): Promise<Sprint[]>;
    getExpiredSprints(): Promise<Sprint[]>;
    markSprintCompleted(sprintId: string): Promise<void>;
}