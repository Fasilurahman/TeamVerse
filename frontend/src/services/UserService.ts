import api from '../api/axiosInstance'

export const fetchUsers = async (page = 1, limit = 5) => {
  try {
    const response = await api.get(`/users?page=${page}&limit=${limit}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.log('Full error details:', error);
    throw error;
  }
};




export const blockUser = async (userId: string)=>{
    try {
    
        const response = await api.post(`/users/${userId}/block`)
        
        return response.data
    } catch (error) {
        console.log("Error blocking/unblocking ",error);
        throw error
    }
}


export const updateUserProfile = async (formData: any) => {
  try {
    const formDataToSend = new FormData();
    formDataToSend.append("email", formData.email);
    formDataToSend.append("name", formData.name);
    formDataToSend.append("location", formData.location);
    formDataToSend.append("phone", formData.phone);

    if (formData.profilePic instanceof File) {
      formDataToSend.append("profilePic", formData.profilePic);
    }

    for (let pair of formDataToSend.entries()) {
      console.log(pair[0], pair[1]);
    }

    const response = await api.post(
      "/users/update",
      formDataToSend,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return response.data; 
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const searchUsers = async (query: string) => {
  try {
    const response = await api.get(`/users/search?query=${query}`);
    return response.data
  } catch (error) {
    console.error('Error fetching all users',error);
    
  }
}

export const fetchDetailsById = async (id: string) => {
  try {
    const response = await api.get(`/users/fetch-details/${id}`, { withCredentials: true });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};


export const fetcUserDetailsById = async (id: string) => {
  try {
    const response = await api.get(`/users/${id}`); 
    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};

