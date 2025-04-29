export class Message {
    constructor(
        public id: string,
        public chatId: string,
        public senderId: string,
        public content: string,
        public fileUrl: string | null,
        public createdAt: Date
    ) {}
}
