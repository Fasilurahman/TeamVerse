import api from '../api/axiosInstance'

export const registerService = async (name: string, email: string, password: string)=>{
    console.log('passing the data into backend');
    
    const response = await api.post('/auth/sign-up', { name, email, password })
    console.log(response.data,'data respoonse')
    return response.data;
}

export const loginService = async (email: string, password: string)=>{
    const response = await api.post('/auth/login',{email,password},{withCredentials:true})
    console.log('Login response',response.data);
    
    return response.data;
}

export const forgotPasswordService = async (email: string)=>{
    const response = await api.post('/auth/forgot-password',{email})
    return response.data;
}

export const verifyOTPService = async(email: string, otp: string)=>{
    try {
        const response = await api.post('/auth/verify-otp', { email, otp });
        console.log(response,'reponse service sercoe');
        
        return response.data;
      } catch (error) {
        console.error('Error in verifyOTPService:', error);
        throw error;
      }
}

export const resetPasswordService = async (token: string, newPassword: string)=>{
    console.log(token,'token')
    const response = await api.post('/auth/reset-password',{token,newPassword})
    return response.data;
}

export const resendOTPService = async (email: string) => {
    try {
        const response = await api.post('/auth/resend-otp', { email });
        return response.data;
    } catch (error: any) {
        console.error('Error in resendOTPService:', error);
        throw error.response?.data || { message: 'Failed to resend OTP. Please try again.' };
    }
}

export const resetPasswordRequestService = async (email: string) => {
    try {
        const response = await api.post('/auth/request-password-reset', { email });
        return response;
    } catch (error: any) {
        console.error('Error in resetPasswordRequestService:', error);
        // throw new Error(
        //     error || 'Failed to request password reset. Please try again.'
        //   );
        return error
        
    }
}

export const  googleAuthService = async (idToken: string): Promise<any>=>{
    console.log("Sending ID Token to server:", idToken);
    try {
        const response = await api.post('/auth/google-auth', { accessToken: idToken }, { withCredentials: true });
        console.log('google auth response',response.data);
        return response.data;
    } catch (error: any) {
        console.error('Error in googleService',error);
        throw error.response?.data || { message: 'Failed to authenticate with Google. Please try again.' }
        
    }
}

export const logout = async () => {
    try {
      const response = await api.post('/auth/logout', {}, { withCredentials: true }); // Ensure cookies are sent
      return response.data;
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };


