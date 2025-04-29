export class Project {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public startDate: Date,
    public endDate: Date,
    public status: "pending" | "in-progress" | "completed" | "on-hold",
    public priority: "low" | "medium" | "high" | "critical",
    public category: string,
    public teamId: string,
    public teamLeadId: string,
    public image?: string,
    public documents?: string[],
    public createdAt?: Date,
    public updatedAt?: Date,
    public teamMembersDetails?: any[]
  ) {
    if (!name || !description || !category) {
      throw new Error("Name, description, and category are required.");
    }

    if (endDate <= startDate) {
      throw new Error("End date must be after start date.");
    }
  }
}
