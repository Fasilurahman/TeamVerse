import { IStatsRepository } from "../../../domain/repositories/IStatsRepository";

export class GetDashboardStatsUseCase {
  constructor(private statsRepository: IStatsRepository) {}

  async execute() {
    const totalProjects = await this.statsRepository.getTotalProjects();
    const completedProjects = await this.statsRepository.getCompletedProjects();
    const totalSprints = await this.statsRepository.getTotalSprints();
    const activeSprints = await this.statsRepository.getActiveSprints();
    const lastWeekProjects = await this.statsRepository.getProjectsLastWeek();
    const lastWeekSprints = await this.statsRepository.getSprintsLastWeek();
    
    const calculateChange = (current: number, previous: number) => {
      const diff = current - previous;
      const percent = previous === 0 ? 100 : Math.abs((diff / previous) * 100);
      return {
        change: `${diff >= 0 ? "+" : "-"}${percent.toFixed(1)}%`,
        trend: diff >= 0 ? "up" : "down",
      };
    };

    const projectStats = calculateChange(totalProjects, totalProjects - lastWeekProjects);
    const sprintStats = calculateChange(totalSprints, totalSprints - lastWeekSprints);

    const stats = [
      {
        title: "Total Projects",
        value: totalProjects,
        icon: "FolderKanban",
        change: projectStats.change,
        trend: projectStats.trend,
        color: "from-indigo-400 to-purple-500",
      },
      {
        title: "Completed Projects",
        value: completedProjects,
        icon: "CheckCircle",
        change: "+0%",
        trend: "up",
        color: "from-green-400 to-emerald-500",
      },
      {
        title: "Total Sprints",
        value: totalSprints,
        icon: "Flag",
        change: sprintStats.change,
        trend: sprintStats.trend,
        color: "from-yellow-400 to-orange-500",
      },
      {
        title: "Active Sprints",
        value: activeSprints,
        icon: "Zap",
        change: "+0%",
        trend: "neutral",
        color: "from-rose-400 to-red-500",
      },
    ];

    return stats;
  }
}
