import api from '../api/axiosInstance';


export const fetchAllTeamMembers = async (userId: string) => {
    try {
      const response = await api.get(`/team/members/team?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  };