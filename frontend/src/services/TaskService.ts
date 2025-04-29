import api from "../api/axiosInstance";


export const createTask = async (taskData: any) => {
  try {
    const response = await api.post("/task/create", taskData);
    return response.data;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error; 
  }
};

export const fetchAllTasks = async (projectId: string) =>{
  try {
    const response = await api.get(`/task/${projectId}`);
    return response.data || []
  } catch (error) {
    console.log('error fetching all tasks',error);
  }
}

export const updateTask = async (taskId: string, updatedTaskData: any) => {
  try {
    const response = await api.put(`/task/${taskId}`, updatedTaskData, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error; 
  }
};


export const deleteTask = async (taskId: string) => {
  try {
    await api.delete(`/task/${taskId}`, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

export const fetchAllEmployeesTasks = async (userId: string) =>{
  try {
    const response = await api.get(`/task/tasks/${userId}`);
    return response.data || []
  } catch (error) {
    console.log('error fetching all tasks',error);
  }
}


export const createSubtask = async (taskId: string, subtaskData: any) => {
  try {
    const response = await api.post("/task/subtasks", {
      taskId,
      ...subtaskData,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating subtask:", error);
    throw error;
  }
};


export const updateSubtaskService = async ( taskId: string, subtaskId: string, updatedData: any ) => {
  try {
    const response = await api.put(
      `/task/${taskId}/subtasks/${subtaskId}`,
      updatedData
    );
    return response.data; 
  } catch (error) {
    console.error("Error updating subtask:", error);
    throw error; 
  }
};



export const fetchSubtasks = async (taskId: string) => {
  try {
    const response = await api.get(`/task/${taskId}/subtasks`);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching subtasks:", error);
    throw error; 
  }
};

export const deleteSubtaskService = async (subtaskId: string) => {
  try {
    await api.delete(`/task/subtask/${subtaskId}`);
    return true; 
  } catch (error) {
    console.error("Error deleting subtask:", error);
    throw error;
  }
};


export const updateSubtaskStatusService = async ( taskId: string, subtaskId: string, status: "todo" | "in-progress" | "completed" ) => {
  try {
    const response = await api.put(`/task/${taskId}/subtasks/${subtaskId}`, {
      status,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating subtask status:", error);
    throw error;
  }
};

export const fetchUserChatsService = async (userId: string) => {
  try {
    const response = await api.get(`/chats/user/${userId}`);
    return response.data; 
  } catch (error) {
    console.error("Error fetching chats:", error);
    throw error; 
  }
};

export const fetchProjectChatService = async (projectId: string) => {
  try {
    const response = await api.get(`/chats/project/${projectId}`);
    return response.data; 
  } catch (error) {
    console.error("Error fetching chat:", error);
    throw error; 
  }
};

export const fetchChatMessagesService = async (chatId: string) => {
  try {
    const response = await api.get(`/chats/${chatId}/messages`);
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error; 
  }
};


export const sendMessageService = async (chatId: string, formData: FormData) => {
  try {
    const response = await api.post(`/chats/${chatId}/messages`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data; 
  } catch (error) {
    console.error("Error sending message:", error);
    throw error; 
  }
};






