"use server";

import { getCollection } from "@/lib/mongodb";

export async function getShows() {
  try {
    const collection = await getCollection("agenda");

    // Buscando apenas shows ativos
    const showsData = await collection.find({ active: { $ne: false } }).toArray();

    return showsData.map((show) => ({
      _id: show._id?.toString(),
      date: (show.date as string) || "",
      weekday: (show.weekday as string) || "",
      month: (show.month as string) || "",
      title: (show.title as string) || "",
      venue: (show.venue as string) || "",
      city: (show.city as string) || "",
      time: (show.time as string) || "",
    }));
  } catch (error) {
    console.error("Erro ao buscar agenda:", error);
    return [];
  }
}
