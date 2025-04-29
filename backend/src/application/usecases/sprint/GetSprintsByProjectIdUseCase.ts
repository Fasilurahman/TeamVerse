import { ISprintRepository } from "../../../domain/repositories/ISprintRepository";
import { Sprint } from "../../../domain/entities/Sprint";

export class GetSprintsByProjectIdUseCase {
  constructor(private sprintRepository: ISprintRepository) {}

  async execute(projectId: string): Promise<Sprint[]> {
    return await this.sprintRepository.findByProjectId(projectId);
  }
}