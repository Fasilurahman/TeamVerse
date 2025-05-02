import { IStatsRepository } from "../../../domain/repositories/IStatsRepository";
import { ProjectModel } from "../models/projectModel";
import { SprintModel } from "../models/SprintModel";
import { TeamModel } from "../models/TeamModel";
import { TaskModel } from "../models/TaskModel";

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

  async getUserChartData(id: string): Promise<{
    performance: { name: string; value: number }[];
    distribution: { name: string; value: number }[];
  }> {
    // Step 1: Find team IDs where user is a lead or member
    const teams = await TeamModel.find({
      $or: [{ teamLeadId: id }, { members: id }],
    }).select("_id");
  
    const teamIds = teams.map((team) => team._id);
  
    // Step 2: Find projects under those teams
    const projects = await ProjectModel.find({
      teamId: { $in: teamIds },
    }).select("_id category");
  
    const projectIds = projects.map((p) => p._id);
  
    // Step 3: Aggregate completed tasks by month
    const tasks = await TaskModel.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      {
        $project: {
          status: 1,
          createdAt: 1,
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          completed: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  
    // Step 4: Fill in missing months with 0s
    const tasksMap = new Map(tasks.map(task => [task._id, task.completed]));
  
    const performance = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      return {
        name: this.getMonthName(month),
        value: tasksMap.get(month) || 0,
      };
    });
  
    // Step 5: Group projects by category
    const categoryAggregation = await ProjectModel.aggregate([
      { $match: { teamId: { $in: teamIds } } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);
  
    const distribution = categoryAggregation.map((item) => ({
      name: item._id,
      value: item.count,
    }));
  
    return { performance, distribution };
  }
  
  private getMonthName(monthNumber: number): string {
    const months = [
      "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    return months[monthNumber];
  }
}
