export interface Show {
  id: string | number;
  date: string;
  month?: string;
  weekday?: string;
  event: string;
  city: string;
  time: string;
  showOnSite?: boolean;
}

// URL do seu site Next.js (ajuste para localhost ou produção se necessário)
const BASE_URL = "https://rafabraga.vercel.app"; 
const API_URL = `${BASE_URL}/api/agenda`;

export const agendaService = {
  async getShows(): Promise<Show[]> {
    try {
      const resp = await fetch(API_URL);
      if (!resp.ok) throw new Error("Failed to fetch shows");
      return await resp.json();
    } catch (error) {
      console.error("Error fetching agenda:", error);
      return [];
    }
  },

  async addShow(show: Omit<Show, "id">) {
    try {
      const resp = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(show),
      });
      return await resp.json();
    } catch (error) {
      console.error("Error adding show:", error);
      return { success: false, error };
    }
  },

  async updateShow(id: string, show: Partial<Show>) {
    try {
      const resp = await fetch(`${API_URL}?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(show),
      });
      return await resp.json();
    } catch (error) {
      console.error("Error updating show:", error);
      return { success: false, error };
    }
  },

  async deleteShow(id: string) {
    try {
      const resp = await fetch(`${API_URL}?id=${id}`, {
        method: "DELETE",
      });
      return await resp.json();
    } catch (error) {
      console.error("Error deleting show:", error);
      return { success: false, error };
    }
  },
};
