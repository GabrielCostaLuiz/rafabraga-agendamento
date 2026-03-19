"use server";

import clientPromise from "@/lib/mongodb";

export async function getShows() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection("agenda");

    // Buscando apenas shows ativos, assumindo ordem de inserção cronológica,
    // ou seja, mais recentes (ou que vão acontecer) na ordem natural se inseridos sequencialmente.
    // Pode ser adaptado se houver um campo timestamp / timestampMs no futuro.
    const showsData = await collection.find({ active: { $ne: false } }).toArray();

    return showsData.map((show) => ({
      _id: show._id?.toString(),
      date: show.date || "",
      weekday: show.weekday || "",
      month: show.month || "",
      title: show.title || "",
      venue: show.venue || "",
      city: show.city || "",
      time: show.time || "",
    }));
  } catch (error) {
    console.error("Erro ao buscar agenda:", error);
    return [];
  }
}
