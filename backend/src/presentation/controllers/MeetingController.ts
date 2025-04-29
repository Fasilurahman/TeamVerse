import { Request, Response, NextFunction } from "express";
import { CreateMeetingUseCase } from "../../application/usecases/meeting/CreateMeetingUseCase";
import { STATUS_CODES } from "../../shared/constants/statusCodes";
import { MeetingRepository } from "../../infrastructure/database/repositories/MeetingRepository";
import { GetMeetingsForUserUseCase } from "../../application/usecases/meeting/GetMeetingsForUserUseCase";
import { GenerateMeetingSummaryUseCase } from "../../application/usecases/meeting/GenerateMeetingSummaryUseCase";
import { GeminiService } from "../../infrastructure/services/GeminiService";


export class MeetingController {
    private readonly createMeetingUseCase: CreateMeetingUseCase;
    private readonly meetingRepository: MeetingRepository;
    private readonly getMeetingsForUserUseCase: GetMeetingsForUserUseCase;
    private readonly generateMeetingSummaryUseCase: GenerateMeetingSummaryUseCase;
    private readonly geminiService: GeminiService;
    
    constructor(){
        this.meetingRepository = new MeetingRepository();
        this.geminiService = new GeminiService();
        this.createMeetingUseCase = new CreateMeetingUseCase(this.meetingRepository);
        this.getMeetingsForUserUseCase = new GetMeetingsForUserUseCase(this.meetingRepository);
        this.generateMeetingSummaryUseCase = new GenerateMeetingSummaryUseCase(this.meetingRepository, this.geminiService);
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            console.log(req.body,'req body')
            const body = {
                ...req.body,
                participants: req.body.teamMembers, 
            };
            const meeting = await this.createMeetingUseCase.execute(body);
            res.status(STATUS_CODES.CREATED).json(meeting);
        } catch (error) {
            next(error)
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction){
        try {
            const userId = req.user.id
            const meetings = await this.getMeetingsForUserUseCase.execute(userId)
            res.status(STATUS_CODES.OK).json(meetings)
        } catch (error) {
            console.error("Error in getAll method:", error);
            next(error)  
        }
    }

    async generateMeetingSummary(req: Request, res: Response, next: NextFunction) {
        try {
            const { roomID, messages } = req.body;
            console.log(req.body,'req body')
            console.log("Processing meeting summary for roomID:", roomID, "with", messages.length, "messages");
            const summary = await this.generateMeetingSummaryUseCase.execute({ roomID, messages });
            res.status(STATUS_CODES.OK).json({summary});
        } catch (error) {
            next(error)
        }
    }
}