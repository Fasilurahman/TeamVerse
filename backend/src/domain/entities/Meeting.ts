import { Types } from "mongoose";

export class Meeting {
    constructor(
        public id: string | Types.ObjectId,
        public title: string,
        public projectId: string | Types.ObjectId,
        public date: string,
        public time: string,
        public duration: string,
        public privacy: 'public' | 'private',
        public createdBy: string | Types.ObjectId,
        public participants: (string | Types.ObjectId)[],
        public description?: string | null | undefined,
        public summary?: string | null | undefined, 
    ){}
}
