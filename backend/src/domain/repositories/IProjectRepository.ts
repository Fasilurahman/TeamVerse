import { Project } from "../../domain/entities/Project";

export interface IProjectRepository {
    create(project: Project): Promise<Project>;
    findById(id: string): Promise<Project | null>;
    update(id: string, updateData: Partial<Project>): Promise<Project | null>;
    findAll(userId: string): Promise<Project[]>;
    delete(projectId: string): Promise<void>;
}
