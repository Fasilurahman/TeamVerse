export class Chat {
    constructor(
        public id: string,
        public projectId: string,
        public name: string,
        public members: string[],
        public isGroupChat: boolean,
        public messages: string[]
    ) {}
}
