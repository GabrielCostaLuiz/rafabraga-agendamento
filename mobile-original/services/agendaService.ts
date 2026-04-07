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

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL || "") as string; 
const API_URL = `${BASE_URL}/api/agenda`;
const API_KEY = (process.env.EXPO_PUBLIC_API_SECRET_KEY || "") as string;

const HEADERS = {
  "Content-Type": "application/json",
  "x-api-key": API_KEY, 
};

export const agendaService = {
  async getShows(): Promise<Show[]> {
    try {
      const resp = await fetch(`${API_URL}?t=${Date.now()}`, {
        headers: { "x-api-key": API_KEY }
      });
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
        headers: HEADERS,
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
        headers: HEADERS,
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
        headers: { "x-api-key": API_KEY }
      });
      return await resp.json();
    } catch (error) {
      console.error("Error deleting show:", error);
      return { success: false, error };
    }
  },
};
