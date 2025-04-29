import { TeamModel } from "../models/TeamModel";
import { Team } from "../../../domain/entities/Team";
import mongoose from "mongoose";


export class TeamRepository  {
    async create(data: Omit<Team, "id" | "createdAt">): Promise<Team>{
        const CreatedTeam = await TeamModel.create(data);
        
        return new Team(
            CreatedTeam.id,
            CreatedTeam.name,
            CreatedTeam.teamLeadId.toString(),
            CreatedTeam.members.map((member: { toString: () => string }) => member.toString()),
            CreatedTeam.createdAt
        )
    }

    async update(id: string, updateData: Partial<Team>): Promise<Team | null>{
        const updatedTeam = await TeamModel.findByIdAndUpdate(id, updateData, { new: true }).populate("members")
        if(!updatedTeam) return null;
        return new Team(
            updatedTeam.id,
            updatedTeam.name,
            updatedTeam.teamLeadId.toString(),
            updatedTeam.members.map((member: { toString: () => string }) => member.toString()),
            updatedTeam.createdAt
        )
    }

    async findById(id: string): Promise<Team | null> {
        console.log("Finding team with ID:", id);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.error("Invalid ObjectId format:", id);
            return null;
        }
        const team = await TeamModel.findById(id).populate('members','name email')
        if(!team){
            return null;
        }
        return new Team(
            team.id,
            team.name,
            team.teamLeadId.toString(),
            team.members.map((member: { toString: () => string }) => member.toString()),
            team.createdAt
        )
    }

    async delete(id: string): Promise<Boolean>{
        const result = await TeamModel.findByIdAndDelete(id)
        return !!result;
    }

    async updateTeamMembers(teamId: string, members: string[]): Promise<Team | null>{
        console.log('5')
        const memberObjectIds = members.map(member => new mongoose.Types.ObjectId(member));
        const updatedTeam = await TeamModel.findByIdAndUpdate(
            teamId,
            {members: memberObjectIds},
            {new : true}
        ).populate('members')
        
        console.log('6')
        console.log(updatedTeam,'updatedTeam');

        if (!updatedTeam) return null;

        return new Team (
            updatedTeam.id,
            updatedTeam.name,
            updatedTeam.teamLeadId.toString(),
            updatedTeam.members.map((member: { toString: () => string }) => member.toString()),
            updatedTeam.createdAt
        )
    }

    async findTeamsByUserId(userId: string): Promise<any[]> {
        return await TeamModel.aggregate([
          // Find teams where the user is either team lead or a member
          {
            $match: {
              $or: [
                { teamLeadId: new mongoose.Types.ObjectId(userId) },
                { members: new mongoose.Types.ObjectId(userId) }
              ]
            }
          },
          // Lookup team lead information
          {
            $lookup: {
              from: 'users',
              localField: 'teamLeadId',
              foreignField: '_id',
              as: 'teamLeadInfo'
            }
          },
          // Unwind the teamLeadInfo array to get a single object
          {
            $unwind: {
              path: '$teamLeadInfo',
              preserveNullAndEmptyArrays: true
            }
          },
          // Lookup projects for team lead
          {
            $lookup: {
              from: 'projects',
              localField: 'teamLeadInfo._id',
              foreignField: 'teamLeadId',
              pipeline: [
                { $project: { name: 1, status: 1, priority: 1, category: 1, startDate: 1, endDate: 1 } }
              ],
              as: 'teamLeadInfo.projects'
            }
          },
          // Lookup tasks for team lead
          {
            $lookup: {
              from: 'tasks',
              localField: 'teamLeadInfo._id',
              foreignField: 'assignedTo',
              pipeline: [
                { $project: { name: 1, status: 1, priority: 1, dueDate: 1 } }
              ],
              as: 'teamLeadInfo.tasks'
            }
          },
          // Lookup members information
          {
            $lookup: {
              from: 'users',
              localField: 'members',
              foreignField: '_id',
              as: 'membersInfo'
            }
          },
          // For each member, lookup their projects and tasks
          {
            $lookup: {
              from: 'projects',
              let: { memberIds: '$membersInfo._id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: ['$teamLeadId', '$$memberIds']
                    }
                  }
                },
                { $project: { name: 1, status: 1, priority: 1, category: 1, startDate: 1, endDate: 1, teamLeadId: 1 } }
              ],
              as: 'allMemberProjects'
            }
          },
          {
            $lookup: {
              from: 'tasks',
              let: { memberIds: '$membersInfo._id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: ['$assignedTo', '$$memberIds']
                    }
                  }
                },
                { $project: { name: 1, status: 1, priority: 1, dueDate: 1, assignedTo: 1 } }
              ],
              as: 'allMemberTasks'
            }
          },
          // Add projects and tasks to each member
          {
            $addFields: {
              'membersInfo': {
                $map: {
                  input: '$membersInfo',
                  as: 'member',
                  in: {
                    $mergeObjects: [
                      '$$member',
                      {
                        projects: {
                          $filter: {
                            input: '$allMemberProjects',
                            as: 'project',
                            cond: { $eq: ['$$project.teamLeadId', '$$member._id'] }
                          }
                        },
                        tasks: {
                          $filter: {
                            input: '$allMemberTasks',
                            as: 'task',
                            cond: { $eq: ['$$task.assignedTo', '$$member._id'] }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            }
          },
          // Project final structure - only include fields we want to keep
          {
            $project: {
              _id: 1,
              name: 1,
              createdAt: 1,
              updatedAt: 1,
              teamLeadId: '$teamLeadInfo',
              members: '$membersInfo'
              // Don't try to exclude fields here
            }
          }
        ]);
      }
      
}