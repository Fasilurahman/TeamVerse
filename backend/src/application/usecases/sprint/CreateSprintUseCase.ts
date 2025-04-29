import { ISprintRepository } from "../../../domain/repositories/ISprintRepository";
import { Sprint } from "../../../domain/entities/Sprint";
import { v4 as uuidv4 } from 'uuid';

export class CreateSprintUseCase {
  constructor(private sprintRepository: ISprintRepository) {}

  async execute(
    name: string,
    startDate: Date,
    endDate: Date,
    projectId: string
  ): Promise<Sprint> {
    const sprint = new Sprint(
      uuidv4(),
      name,
      startDate,
      endDate,
      'planning',
      projectId,
      new Date(),
      new Date()
    );
    return await this.sprintRepository.create(sprint);
  }
}
