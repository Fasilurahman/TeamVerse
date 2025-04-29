import api from '../api/axiosInstance'


export const addComment = async (taskId: string, content: string, authorId: string) => {
    try {
        const response = await api.post(`/comment`, { taskId, content, authorId });
        return response.data;
    } catch (error) {
        console.error('Error in addComment:', error);
        throw error;
    }
}

export const fetchComment = async (taskId: string)=>{
    try {
        const response = await api.get(`/comment/${taskId}`);
        return response.data
    } catch (error) {
        console.log("Failed to fetch comments",error)
    }
}