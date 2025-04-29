export class Team {
    constructor(
        public id: string,
        public name: string,
        public teamLeadId: string,
        public members: string[],
        public createdAt: Date
    ) {}
}
