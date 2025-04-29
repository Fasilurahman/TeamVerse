export class Sprint {
  constructor(
    public id: string,
    public name: string,
    public startDate: Date,
    public endDate: Date,
    public status: 'planning' | 'active' | 'completed',
    public projectId: string,
    public createdAt: Date,
    public updatedAt: Date,
    public tasks: string[] = []
  ) {}
}
