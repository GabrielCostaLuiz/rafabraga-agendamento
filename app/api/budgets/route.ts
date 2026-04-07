import { getCollection } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { isValidApiKey, unauthorizedResponse } from "@/lib/auth-util";
import { z } from "zod";
import { ObjectId } from "mongodb";

const budgetSchema = z.object({
  name: z.string().min(3),
  phone: z.string().min(10),
  location: z.string(),
  cep: z.string().optional(),
  houseNumber: z.string().optional(),
  showDate: z.string().optional(),
  musicians: z.string().optional(),
  style: z.array(z.string()).optional(),
  acoustics: z.string().optional(),
  infra: z.array(z.string()).optional(),
  notes: z.string().optional(),
  status: z.enum(["Novo", "Visto", "Respondido", "Arquivado"]).optional(),
});

export async function GET(request: Request) {
  if (!isValidApiKey(request)) return unauthorizedResponse();

  try {
    const collection = await getCollection("budgets");
    const leads = await collection.find({}).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json(leads.map(l => ({
      id: l._id.toString(),
      name: l.name || "",
      location: l.location || l.city || "",
      cep: l.cep || "",
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
    console.error("Erro na API da Budgets (GET):", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!isValidApiKey(request)) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });

    const body = await request.json().catch(() => ({}));
    const parsed = budgetSchema.partial().safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.format() }, { status: 400 });
    }

    const collection = await getCollection("budgets");
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...parsed.data, updatedAt: new Date() } }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro na API da Budgets (PATCH):", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isValidApiKey(request)) return unauthorizedResponse();

  try {
    const body = await request.json();
    const parsed = budgetSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Payload inválido", details: parsed.error.format() }, { status: 400 });
    }

    const collection = await getCollection("budgets");
    const newLead = {
      ...parsed.data,
      status: parsed.data.status || "Novo",
      createdAt: new Date(),
      date: new Date().toLocaleDateString("pt-BR")
    };
    
    const result = await collection.insertOne(newLead);
    
    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error("Erro na API da Budgets (POST):", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isValidApiKey(request)) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });

    const collection = await getCollection("budgets");
    await collection.deleteOne({ _id: new ObjectId(id) });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro na API da Budgets (DELETE):", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
