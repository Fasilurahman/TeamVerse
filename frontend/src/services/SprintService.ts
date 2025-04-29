import api from "../api/axiosInstance";

export const createSprint = async (sprintData: {name: string, startDate: Date, endDate: Date, status: string, projectId: string}) => {
    const response = await api.post("/sprints/create", sprintData, { withCredentials: true });
    return response.data;
}

export const getAllSprints = async (projectId: string) => {
    const response = await api.get(`/sprints?projectId=${projectId}`, {
      withCredentials: true,
    });
    console.log(response.data, "response data in service")
    return response.data;
};

export const getAllBacklogs = async (projectId: string) => {
    const response = await api.get(`task/backlogs/${projectId}`, {
      withCredentials: true,
    });
    return response.data;
  };

  export const changeStatus = async (taskId: string, status: string, sprintId: string) => {
    console.log(taskId, status, "taskId and status in service")
    const response = await api.put(`task/sprint/${taskId}`,  { status,sprintId } , { withCredentials: true });
    return response.data;
  }

  export const Update = async (task: {id: string, status: string})=>{
    console.log(task,'task in update status')
    const response = await api.put(`task/sprint/status/${task.id}`, {status: task.status}, { withCredentials: true });
    return response.data;

  }