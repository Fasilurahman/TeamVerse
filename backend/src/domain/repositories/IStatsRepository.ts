export interface IStatsRepository {
    getTotalProjects(): Promise<number>;
    getCompletedProjects(): Promise<number>;
    getTotalSprints(): Promise<number>;
    getActiveSprints(): Promise<number>;
    getProjectsLastWeek(): Promise<number>;
    getSprintsLastWeek(): Promise<number>;
  }
  