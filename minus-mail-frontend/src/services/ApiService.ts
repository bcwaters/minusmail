import axios from 'axios';
import { config } from '../config/environment';

const API_BASE_URL = `${config.apiBaseUrl}/email`;

export interface EmailData {
  id: string;
  from: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  received: string;
}

export interface EmailCountResponse {
  status: string;
  username: string;
  count: number;
}

export interface EmailsResponse {
  status: string;
  username: string;
  emails: EmailData[];
  count: number;
}

class ApiService {
  async getEmailCount(username: string): Promise<number> {
    try {
      const response = await axios.get<EmailCountResponse>(`${API_BASE_URL}/username/${username}/count`);
      return response.data.count;
    } catch (error) {
      console.error('Error fetching email count:', error);
      return 0;
    }
  }

  async getEmailsForUsername(username: string): Promise<EmailData[]> {
    try {
      const response = await axios.get<EmailsResponse>(`${API_BASE_URL}/username/${username}`);
      return response.data.emails || [];
    } catch (error) {
      console.error('Error fetching emails:', error);
      return [];
    }
  }

  async getEmailById(emailId: string): Promise<EmailData | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/id/${emailId}`);
      return response.data.email || null;
    } catch (error) {
      console.error('Error fetching email by ID:', error);
      return null;
    }
  }

  async storeEmail(username: string, emailData: EmailData): Promise<string | null> {
    try {
      const response = await axios.post(`${API_BASE_URL}/username/${username}/store`, emailData);
      return response.data.emailId || null;
    } catch (error) {
      console.error('Error storing email:', error);
      return null;
    }
  }
}

// Export a singleton instance
export const apiService = new ApiService();
export default ApiService; 