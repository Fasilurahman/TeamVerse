import { Sprint } from "../../../domain/entities/Sprint";
import { ISprintRepository } from "../../../domain/repositories/ISprintRepository";
import { SprintModel } from "../models/SprintModel";


export class SprintRepository implements ISprintRepository {
  async create(sprint: Sprint): Promise<Sprint> {
    const created = await SprintModel.create(sprint);
    return new Sprint(
      created._id.toString(),
      created.name,
      created.startDate,
      created.endDate,
      created.status,
      created.projectId.toString(),
      created.createdAt,
      created.updatedAt,
      created.tasks.map((task) => task.toString())
    );
  }

  async findByProjectId(projectId: string): Promise<Sprint[]> {
    const sprints = await SprintModel.find({ projectId }).sort({ startDate: 1 });
    return sprints.map(sprint => ({
      id: sprint._id.toString(),
      name: sprint.name,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      status: sprint.status,
      projectId: sprint.projectId.toString(),
      createdAt: sprint.createdAt,
      updatedAt: sprint.updatedAt,
      tasks: sprint.tasks.map(task => task.toString()),
    })) 
  }

  async getExpiredSprints(): Promise<Sprint[]> {
      return SprintModel.find({
        endDate: { $lt: new Date()},
        status: { $ne: "completed" }
      })
  }

  async markSprintCompleted(sprintId: string): Promise<void> {
      await SprintModel.findByIdAndUpdate(sprintId, { status: "completed" });
  }
}
