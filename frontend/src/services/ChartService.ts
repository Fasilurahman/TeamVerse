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
        return response.data;
    } catch (error) {
        console.error('Error fetching user dashboard stats:', error);
    }
}