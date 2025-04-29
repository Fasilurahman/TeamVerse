import { Meeting } from "../../../domain/entities/Meeting";
import { MeetingRepository } from "../../../infrastructure/database/repositories/MeetingRepository";

export class CreateMeetingUseCase {
    constructor(private meetingRepository: MeetingRepository){
        this.meetingRepository = meetingRepository
    }

    async execute(meeting: Meeting): Promise<Meeting>{
        console.log('entering to meeting usecase')
        return await this.meetingRepository.createMeeting(meeting)
    }
}