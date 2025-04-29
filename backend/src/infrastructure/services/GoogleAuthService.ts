import axios from 'axios';

export class GoogleAuthService {
  async getGoogleUserData(token: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`
      );
      return response.data;
    } catch (error) {
      console.error('Error retrieving Google user data:', error);
      throw new Error('Failed to retrieve Google user data');
    }
  }
}
