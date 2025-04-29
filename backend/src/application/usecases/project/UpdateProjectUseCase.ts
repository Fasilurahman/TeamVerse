import { Project } from "../../../domain/entities/Project";
import { ProjectRepository } from "../../../infrastructure/database/repositories/ProjectRepository";
import { MESSAGES } from "../../../shared/constants/ResponseMessages";
import { TeamRepository } from "../../../infrastructure/database/repositories/TeamRepository"
export class UpdateProjectUseCase {
  constructor(
    private projectRepository: ProjectRepository,
    private teamRepository: TeamRepository
  ) {}

  async execute(
    id: string,
    updateData: Partial<{
      name: string;
      description: string;
      startDate: Date;
      endDate: Date;
      status: "pending" | "in-progress" | "completed" | "on-hold";
      priority?: "low" | "medium" | "high" | "critical"; 
      category?: string;  
      teamMembers?: string[];
      image?: string;
      documents?: string[];
    }>
  ) {
    const existingProject = await this.projectRepository.findById(id);
    
    if (!existingProject) {
      throw new Error(MESSAGES.PROJECT.PROJECT_NOT_FOUND);
    }
    
    if (
      updateData.startDate &&
      updateData.endDate &&
      updateData.endDate <= updateData.startDate
    ) {
      throw new Error(MESSAGES.DATE.END_DATE_BEFORE_START_DATE);
    }
    
    // Only include fields that have been changed in the update
    const changedFields: Partial<Project> = {};
    
    // Check each field and only include it if it's different from the existing value
    if (updateData.name !== undefined && updateData.name !== existingProject.name) {
      changedFields.name = updateData.name;
    }
    
    if (updateData.description !== undefined && updateData.description !== existingProject.description) {
      changedFields.description = updateData.description;
    }
    
    if (updateData.startDate !== undefined && 
        updateData.startDate.getTime() !== existingProject.startDate.getTime()) {
      changedFields.startDate = updateData.startDate;
    }
    
    if (updateData.endDate !== undefined && 
        updateData.endDate.getTime() !== existingProject.endDate.getTime()) {
      changedFields.endDate = updateData.endDate;
    }
    
    if (updateData.status !== undefined && updateData.status !== existingProject.status) {
      changedFields.status = updateData.status;
    }
    
    if (updateData.priority !== undefined && updateData.priority !== existingProject.priority) {
      changedFields.priority = updateData.priority;
    }
    
    if (updateData.category !== undefined && updateData.category !== existingProject.category) {
      changedFields.category = updateData.category;
    }
    
    if (updateData.image !== undefined && updateData.image !== existingProject.image) {
      changedFields.image = updateData.image;
    }
    
    // For documents, check if it's actually changed
    if (updateData.documents !== undefined) {
      const existingDocs = existingProject.documents || [];
      // Check if arrays are different (size or content)
      if (updateData.documents.length !== existingDocs.length || 
          !updateData.documents.every(doc => existingDocs.includes(doc))) {
        changedFields.documents = updateData.documents;
      }
    }
    
    let updatedProject = existingProject;
if (Object.keys(changedFields).length > 0) {
  const result = await this.projectRepository.update(id, changedFields);
  if (result) {
    updatedProject = result;
  }
}
    
    if (updateData.teamMembers && existingProject.teamId) {

      const currentTeam = await this.teamRepository.findById(existingProject.teamId);
      const currentMembers = currentTeam ? currentTeam.members : [];
      
      // Check if team members have changed
      const membersChanged = !currentMembers || 
                            currentMembers.length !== updateData.teamMembers.length ||
                            !updateData.teamMembers.every(member => 
                              currentMembers.includes(member));
      
      if (membersChanged) {
        await this.teamRepository.updateTeamMembers(existingProject.teamId, updateData.teamMembers);
      }
    }
  
    return updatedProject;
  }
}

  