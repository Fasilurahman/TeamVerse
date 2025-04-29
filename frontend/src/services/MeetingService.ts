import api from '../api/axiosInstance'
import { NewMeetingFormData } from '../types'
export const createMeeting = async(data: NewMeetingFormData)=>{
    const response = await api.post('/meetings/create', data)
    return response.data
}

export const fetchAllMeetings = async()=>{
    const response = await api.get('/meetings/my-meetings')
    return response.data
}