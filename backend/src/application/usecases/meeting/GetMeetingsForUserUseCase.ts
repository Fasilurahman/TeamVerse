import { Meeting } from "../../../domain/entities/Meeting"
import { MeetingRepository } from "../../../infrastructure/database/repositories/MeetingRepository"


export class GetMeetingsForUserUseCase {
    constructor(private meetingRepository: MeetingRepository){
            this.meetingRepository = meetingRepository
    }

    async execute(userId: string):Promise<Meeting[]>{
        return await this.meetingRepository.getMeetingsForUser(userId)
    }
    
}