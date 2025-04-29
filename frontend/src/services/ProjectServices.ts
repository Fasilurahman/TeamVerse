import api from '../api/axiosInstance';

export const fetchEmployees = async () => {
  try {
      const response = await api.get("/project/employees",{ withCredentials: true });
      return response.data;
  } catch (error) {
      console.error("Error fetching employees:", error);
      return [];
  }
};


export const fetchProjects = async (userId: string) => {
  try {
    const response = await api.get(`/project/projects?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching projects", error);
    return [];
  }
};

export const fetchProjectById = async (projectId: string)=>{
  console.log('projectId',projectId)
  try {
    const response = await api.get(`/project/${projectId}`);
    return response.data;
  } catch (error) {
    console.log('error fetching project by id',error);
    return null
  }
}


export const createProject = async (newProject: any, userId: string, selectedEmployees: any[]) => {
  if (!userId) throw new Error("User not logged in!");
  if (!selectedEmployees.length) throw new Error("No employees selected!");

  try {
    // Step 1: Create Team
    const teamResponse = await api.post("/team/create", {
      name: `Team for ${newProject.name}`,
      members: selectedEmployees.map((emp) => emp.id),
      teamLeadId: userId,
    });

    const teamId = teamResponse.data.team.id;

    // Step 2: Fetch Team Details
    const teamDetailsResponse = await api.get(`/team/${teamId}`);
    const teamDetails = teamDetailsResponse.data;

    // Step 3: Create Project
    const formData = new FormData();
    formData.append("name", newProject.name);
    formData.append("description", newProject.description);
    formData.append("startDate", newProject.startDate);
    formData.append("endDate", newProject.endDate);
    formData.append("category", newProject.category);
    formData.append("priority", newProject.priority.toLowerCase());
    formData.append("teamId", teamId);
    formData.append("teamLeadId", userId);

    selectedEmployees.forEach((emp) => {
      formData.append("members[]", emp.id.toString());
    });

    if (newProject.image) {
      formData.append("image", newProject.image);
    }

    newProject.documents.forEach((doc:any) => {
      formData.append("documents", doc);
    });
    console.log('today is coming to project creation')

    const response = await api.post("/project/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return { project: response.data, team: teamDetails };
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};


// ✅ Update a project
export const updateProject = async ( newProject: any) => {
  if (!newProject) throw new Error("No project selected for updating!");
  console.log(newProject,'new ')
  try {
    const formData = new FormData();
    formData.append("name", newProject.name);
    formData.append("description", newProject.description);
    formData.append("category", newProject.category)
    formData.append("status", newProject.status);
    formData.append("priority", newProject.priority);
    formData.append("startDate", newProject.startDate);
    formData.append("endDate", newProject.endDate);

    if (newProject.image) {
      formData.append("image", newProject.image);
    }

    if( newProject.documents){
      newProject.documents.forEach((doc:any) => {
        formData.append("documents", doc);
      });
    }
    

   
      const teamMemberIds = newProject.teamMembers.map((member: any) => member.id);
      formData.append("teamMembers", JSON.stringify(teamMemberIds));


    console.log(formData,' form data')

    const response = await api.put(`/project/update/${newProject.id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
};

export const deleteProject = async (projectId: string) => {
  try {
   
      const response = await api.delete(`/project/${projectId}`);
      return response.data
  } catch (error) {
    
  }
}

export const fetchProjectByTeamLead = async(userId: string)=>{
  try {
    const response = await api.get(`/project/projects/team-lead?teamLeadId=${userId}`)
    return response.data
  } catch (error) {
    console.error(error,'error in fetching projects')
  }
}

