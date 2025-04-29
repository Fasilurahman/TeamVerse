import { IStatsRepository } from "../../../domain/repositories/IStatsRepository";
import { ProjectModel } from "../models/projectModel";
import { SprintModel } from "../models/SprintModel";

export class StatsRepository implements IStatsRepository {
  async getTotalProjects(): Promise<number> {
    return await ProjectModel.countDocuments();
  }

  async getCompletedProjects(): Promise<number> {
    const now = new Date();
    return await ProjectModel.countDocuments({
      endDate: { $lt: now }
    });
  }

  async getTotalSprints(): Promise<number> {
    return await SprintModel.countDocuments();
  }

  async getActiveSprints(): Promise<number> {
    const now = new Date();
    return await SprintModel.countDocuments({
      endDate: { $gt: now }
    });
  }

  async getProjectsLastWeek(): Promise<number> {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    return await ProjectModel.countDocuments({ createdAt: { $gte: lastWeek } });
  }

  async getSprintsLastWeek(): Promise<number> {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    return await SprintModel.countDocuments({ createdAt: { $gte: lastWeek } });
  }
}
