export interface Lead {
  id: string | number;
  name: string;
  location: string;
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

const BASE_URL = "https://rafabraga.vercel.app"; 
const API_URL = `${BASE_URL}/api/budgets`;

export const budgetsService = {
  async getLeads(): Promise<Lead[]> {
    try {
      const resp = await fetch(API_URL);
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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
      return await resp.json();
    } catch (error) {
      console.error("Error creating lead:", error);
      return { success: false, error };
    }
  }
};
