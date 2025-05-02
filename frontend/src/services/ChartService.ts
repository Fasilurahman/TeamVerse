import api from '../api/axiosInstance';


export const fetchAdminChartData = async () => {
    try {
        const response = await api.get('/chart/chart-data');
        return response.data;
    } catch (error) {
        console.error('Error fetching chart data:', error);
    }
}

export const fetchAdminStats = async () => {
    try {
        const response = await api.get('/chart/stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching admin stats:', error);
    }
}

export const fetchUserDashboardStats = async () => {
    try {
        const response = await api.get('/chart/stats-user');
        console.log(response.data,'234567');
        return response.data;
    } catch (error) {
        console.error('Error fetching user dashboard stats:', error);
    }
}

export const fetchUserChartData = async (id: string) => {
    try {
        const response = await api.get(`/chart/chart-data/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user chart data:', error);
    }
}