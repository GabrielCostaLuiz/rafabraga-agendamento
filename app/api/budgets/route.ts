import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "rafabraga_db");
    const collection = db.collection("budgets");
    
    // Pegando leads recentes
    const leads = await collection.find({}).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json(leads.map(l => ({
      id: l._id.toString(),
      name: l.name || "",
      location: l.location || l.city || "",
      houseNumber: l.houseNumber || "",
      showDate: l.showDate || "",
      musicians: l.musicians || "",
      date: l.date || (l.createdAt ? new Date(l.createdAt).toLocaleDateString() : ""),
      status: l.status || "Novo",
      phone: l.phone || "",
      email: l.email || "",
      style: l.style || [],
      acoustics: l.acoustics || "",
      infra: l.infra || [],
      notes: l.notes || ""
    })));
  } catch (error) {
    console.error("Erro na API da Budgets:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const body = await request.json().catch(() => ({}));
    const newStatus = body.status || "Visto";

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "rafabraga_db");
    const collection = db.collection("budgets");
    
    const { ObjectId } = require("mongodb");
    
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: newStatus, updatedAt: new Date() } }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro na API da Budgets (PATCH):", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "rafabraga_db");
    const collection = db.collection("budgets");
    
    const newLead = {
      ...body,
      status: body.status || "Novo",
      createdAt: new Date(),
      date: body.date || new Date().toLocaleDateString("pt-BR")
    };
    
    const result = await collection.insertOne(newLead);
    
    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error("Erro na API da Budgets (POST):", error);
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
    const collection = db.collection("budgets");
    
    const { ObjectId } = require("mongodb");
    
    await collection.deleteOne({ _id: new ObjectId(id) });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro na API da Budgets (DELETE):", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
