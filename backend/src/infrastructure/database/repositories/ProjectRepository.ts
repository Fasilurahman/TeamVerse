import { ProjectModel } from "../models/projectModel";
import { Project } from "../../../domain/entities/Project";
import { ChatModel } from "../models/ChatModel";
import mongoose from "mongoose";

export class ProjectRepository {
  async create(project: Project): Promise<Project> {
    console.log(project, "project");
    console.log("saving the project repository");

    const createdProject = await ProjectModel.create(project);
    return new Project(
      createdProject.id,
      createdProject.name,
      createdProject.description,
      createdProject.startDate,
      createdProject.endDate,
      createdProject.status,
      createdProject.priority,
      createdProject.category,
      createdProject.teamId.toString(),
      createdProject.teamLeadId.toString(),
      createdProject.image ?? undefined,
      createdProject.documents ?? undefined
    );
  }

  async findById(id: string): Promise<Project | null> {
    const project = await ProjectModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) },
      },
      {
        $lookup: {
          from: "teams",
          localField: "teamId",
          foreignField: "_id",
          as: "teamDetails",
        },
      },
      {
        $unwind: { path: "$teamDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "users",
          localField: "teamLeadId",
          foreignField: "_id",
          as: "teamLeadDetails",
        },
      },
      {
        $unwind: { path: "$teamLeadDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "users",
          localField: "teamDetails.members",
          foreignField: "_id",
          as: "teamMembersDetails",
        },
      },
    ]);

    if (!project || project.length === 0) return null;

    const p = project[0];

    return new Project(
      p._id.toString(),
      p.name,
      p.description,
      p.startDate,
      p.endDate,
      p.status,
      p.priority,
      p.category,
      p.teamDetails,
      p.teamLeadDetails,
      p.image ?? undefined,
      p.documents ?? undefined,
      p.createdAt,
      p.updatedAt,
      p.teamMembersDetails
    );
  }

  async update(
    id: string,
    updateData: Partial<Project>
  ): Promise<Project | null> {

    const updatedProject = await ProjectModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedProject) return null;
    return new Project(
      updatedProject.id,
      updatedProject.name,
      updatedProject.description,
      updatedProject.startDate,
      updatedProject.endDate,
      updatedProject.status,
      updatedProject.priority,
      updatedProject.category,
      updatedProject.teamId.toString(),
      updatedProject.teamLeadId.toString(),
      updatedProject.image ?? undefined,
      updatedProject.documents
    );
  }

  async findAll(userId: string): Promise<Project[]> {
    const projects = await ProjectModel.aggregate([
      {
        $lookup: {
          from: "teams",
          localField: "teamId",
          foreignField: "_id",
          as: "teamDetails",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "teamLeadId",
          foreignField: "_id",
          as: "teamLeadDetails",
        },
      },
      {
        $unwind: { path: "$teamDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$teamLeadDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "users",
          localField: "teamDetails.members",
          foreignField: "_id",
          as: "teamMembersDetails",
        },
      },
      {
        $match: {
          $or: [
            { teamLeadId: new mongoose.Types.ObjectId(userId) }, // User is team lead
            { "teamDetails.members": new mongoose.Types.ObjectId(userId) }, // User is a team member
          ],
        },
      },
    ]);

    return projects.map(
      (project) =>
        new Project(
          project._id.toString(),
          project.name,
          project.description,
          project.startDate,
          project.endDate,
          project.status,
          project.priority,
          project.category,
          project.teamDetails,
          project.teamLeadDetails,
          project.image ?? undefined,
          project.documents ?? undefined,
          project.createdAt,
          project.updatedAt,
          project.teamMembersDetails
        )
    );
  }

  async delete(projectId: string): Promise<void> {
    await ProjectModel.findByIdAndDelete(projectId);
    await ChatModel.deleteOne({ projectId });
  }

  async getProjectsByTeamLead(teamLeadId: string): Promise<Project[]>{
    const projects = await ProjectModel.aggregate([
      {
        $match: {
          teamLeadId: new mongoose.Types.ObjectId(teamLeadId)
        }
      },
      {
        $lookup: {
          from: "teams",
          localField: "teamId",
          foreignField: "_id",
          as: "team"
        }
      },
      {
        $unwind: "$team"
      },
      {
        $lookup: {
          from: "users",
          localField: "team.members",
          foreignField: "_id",
          as: "teamMembers"
        }
      },
      {
        $project: {
          name: 1,
          description: 1,
          startDate: 1,
          endDate: 1,
          status: 1,
          priority: 1,
          category: 1,
          image: 1,
          documents: 1,
          createdAt: 1,
          updatedAt: 1,
          teamLeadId: 1,
          team: {
            _id: "$team._id",
            name: "$team.name",
            teamLeadId: "$team.teamLeadId",
            createdAt: "$team.createdAt"
          },
          teamMembers: {
            _id: 1,
            name: 1,
            email: 1,
            role: 1,
            location: 1,
            phone: 1,
            company: 1,
            profilePic: 1,
            isBlocked: 1,
          }
        }
      }
    ]);

    return projects;
  }
  
}

