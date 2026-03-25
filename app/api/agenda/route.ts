import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "rafabraga_db");
    const collection = db.collection("agenda");
    
    const shows = await collection.find({ active: { $ne: false } }).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json(shows.map(s => {
      // O Mobile salva data como "19 MAR" e cidade como "Rua X, 10 - São Paulo/SP"
      // Tentamos quebrar esses valores para o Web que espera campos separados
      const dateParts = (s.date || "").split(" ");
      const cityParts = (s.city || "").split(" - ");

      return {
        id: s._id.toString(),
        _id: s._id.toString(),
        date: dateParts[0] || "",
        month: dateParts[1] || "",
        weekday: s.weekday || "QUA", // Idealmente o mobile enviaria isso, mas deixamos fallback
        event: s.event || s.title || "",
        title: s.event || s.title || "", // Web espera title
        venue: cityParts[0] || "", // O primeiro pedaço antes do '-'
        city: cityParts[1] || cityParts[0] || "", // O segundo pedaço ou fallback
        time: s.time || "",
        showOnSite: s.showOnSite !== false
      };
    }));
  } catch (error) {
    console.error("Erro na API da Agenda:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "rafabraga_db");
    const collection = db.collection("agenda");
    
    const result = await collection.insertOne({
      ...body,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return NextResponse.json({ success: true, id: result.insertedId.toString() });
  } catch (error) {
    console.error("Erro na API da Agenda (POST):", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const body = await request.json();
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "rafabraga_db");
    const collection = db.collection("agenda");
    
    const { id: _, ...updateData } = body;
    
    // Simplificando o filtro de ID para Next.js (importar ObjectId se necessário)
    const { ObjectId } = require("mongodb");
    
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro na API da Agenda (PUT):", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "rafabraga_db");
    const collection = db.collection("agenda");
    
    const { ObjectId } = require("mongodb");
    
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { active: false, updatedAt: new Date() } }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro na API da Agenda (DELETE):", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
