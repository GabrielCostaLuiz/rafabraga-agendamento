export interface Lead {
  id: string | number;
  name: string;
  location: string;
  cep?: string;
  houseNumber?: string;
  showDate?: string;
  musicians?: string;
  date: string;
  status: 'Novo' | 'Visto' | string;
  phone: string;
  email?: string;
  style: string[];
  acoustics: string;
  infra?: string[];
  notes?: string;
  createdAt?: string | Date;
}

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL || "") as string; 
const API_URL = `${BASE_URL}/api/budgets`;
const API_KEY = (process.env.EXPO_PUBLIC_API_SECRET_KEY || "") as string;

const HEADERS = {
  "Content-Type": "application/json",
  "x-api-key": API_KEY, 
};

export const budgetsService = {
  async getLeads(): Promise<Lead[]> {
    try {
      const resp = await fetch(`${API_URL}?t=${Date.now()}`, {
        headers: { "x-api-key": API_KEY }
      });
      if (!resp.ok) throw new Error("Failed to fetch leads");
      return await resp.json();
    } catch (error) {
      console.error("Error fetching leads:", error);
      return [];
    }
  },

  async markAsRead(id: string) {
    return this.updateStatus(id, 'Visto');
  },

  async updateStatus(id: string, status: string) {
    try {
      const resp = await fetch(`${API_URL}?id=${id}`, {
        method: "PATCH",
        headers: HEADERS,
        body: JSON.stringify({ status }),
      });
      return await resp.json();
    } catch (error) {
      console.error("Error updating lead status:", error);
      return { success: false, error };
    }
  },

  async deleteLead(id: string) {
    try {
      const resp = await fetch(`${API_URL}?id=${id}`, {
        method: "DELETE",
        headers: { "x-api-key": API_KEY }
      });
      return await resp.json();
    } catch (error) {
      console.error("Error deleting lead:", error);
      return { success: false, error };
    }
  },

  async createLead(lead: Partial<Lead>) {
    try {
      const resp = await fetch(API_URL, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify(lead),
      });
      return await resp.json();
    } catch (error) {
      console.error("Error creating lead:", error);
      return { success: false, error };
    }
  }
};
