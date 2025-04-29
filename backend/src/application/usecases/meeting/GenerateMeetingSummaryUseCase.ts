import { MeetingRepository } from "../../../infrastructure/database/repositories/MeetingRepository";
import { GeminiService } from "../../../infrastructure/services/GeminiService";

interface Input {
    roomID: string;
    messages: { fromUser: { userName: string }, message: string }[];
}
  

export class GenerateMeetingSummaryUseCase {
    constructor(
        private meetingRepository: MeetingRepository,
        private geminiService: GeminiService
    ){}

    async execute({ roomID, messages }: Input): Promise<string> {
        const meeting = await this.meetingRepository.findById(roomID);
        console.log("Meeting found:", meeting);
        if (!meeting) throw new Error("Meeting not found");
    
        const formattedMessages = messages
          .map((msg) => `${msg.fromUser.userName}: ${msg.message}`)
          .join("\n");
    
        const prompt = `You are a helpful assistant. Summarize the following meeting chat:\n\n${formattedMessages}`;
    
        const summary = await this.geminiService.generateSummary(prompt);
        console.log("Generated summary:", summary);
        await this.meetingRepository.updateSummary(roomID, summary);
        return summary;
    }
}