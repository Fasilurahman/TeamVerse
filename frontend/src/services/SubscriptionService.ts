import api from "../api/axiosInstance";

export const createCheckoutSession = async (priceId: string)=>{
    const response = await api.post('/subscriptions/create-checkout-session', {priceId}, {withCredentials: true});
    return response.data.url
}

export const getAllSubscriptionsPlans = async ()=>{
    const response = await api.get('/subscriptions', {withCredentials: true});
    return response.data
}


export const deleteSubscriptionPlan = async (id: string)=>{
    const response = await api.delete(`/subscriptions/${id}`, {withCredentials: true});
    return response.data
}

export const fetchUserReceipt = async (sessionId: string)=>{
    const response = await api.get(`/subscriptions/receipt?sessionId=${sessionId}`,{
        withCredentials: true
    })
    return response.data
}
