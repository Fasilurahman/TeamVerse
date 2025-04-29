import { Meeting } from "../entities/Meeting";

export interface IMeetingRepository {
  createMeeting(meeting: Meeting): Promise<Meeting>;
  getMeetingsForUser(userId: string): Promise<Meeting[]>;
}
