import { IMeetingRepository } from "../../../domain/repositories/IMeetingRepository";
import { Meeting } from "../../../domain/entities/Meeting";
import { MeetingModel } from "../models/MeetingModel";

export class MeetingRepository implements IMeetingRepository {
  async createMeeting(meeting: Meeting): Promise<Meeting> {
    console.log("entering to meeting repository");

    const created = await MeetingModel.create(meeting);
    console.log(created, "created");

    return new Meeting(
      created._id.toString(),
      created.title,
      created.projectId.toString(),
      created.date,
      created.time,
      created.duration,
      created.privacy,
      created.createdBy.toString(),
      created.participants.map((p: any) => p.toString()),
      created.description,
      created.summary || null
    );
  }

  async getMeetingsForUser(
    userId: string
  ): Promise<(Meeting & { status: string })[]> {
    const now = new Date();

    const meetings = await MeetingModel.find({
      $or: [{ createdBy: userId }, { participants: userId }],
    });

    const enrichedMeetings = meetings.map((meeting) => {
      const meetingDateTime = new Date(`${meeting.date}T${meeting.time}`);
      const meetingEndTime = new Date(meetingDateTime);
      meetingEndTime.setHours(
        meetingEndTime.getHours() + Number(meeting.duration)
      );

      const status =
        now >= meetingDateTime && now <= meetingEndTime
          ? "live"
          : now < meetingDateTime
          ? "upcoming"
          : "past";

      const meetingEntity = new Meeting(
        meeting._id.toString(),
        meeting.title,
        meeting.projectId.toString(),
        meeting.date,
        meeting.time,
        meeting.duration,
        meeting.privacy,
        meeting.createdBy.toString(),
        meeting.participants.map((p: any) => p.toString()),
        meeting.description,
        meeting.summary 
      );

      return {
        ...meetingEntity,
        status,
      };
    });

    return enrichedMeetings;
  }

  async findById(meetingId: string): Promise<Meeting | null> {
    const meetingDoc = await MeetingModel.findById(meetingId).lean();
    if (!meetingDoc) return null;

    return {
      id: meetingDoc._id.toString(),
      title: meetingDoc.title,
      projectId: meetingDoc.projectId.toString(),
      date: meetingDoc.date,
      time: meetingDoc.time,
      duration: meetingDoc.duration,
      privacy: meetingDoc.privacy,
      description: meetingDoc.description,
      createdBy: meetingDoc.createdBy.toString(),
      participants: meetingDoc.participants.map((p: any) => p.toString()),
      summary: meetingDoc.summary || null,
    };
  }

  async updateSummary(id: string, summary: string): Promise<void> {
    await MeetingModel.findByIdAndUpdate(id, { summary });
  }
}
