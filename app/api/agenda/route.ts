import { getCollection } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { isValidApiKey, unauthorizedResponse } from "@/lib/auth-util";
import { z } from "zod";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const showSchema = z.object({
  date: z.string(),
  month: z.string().optional(),
  weekday: z.string().optional(),
  event: z.string().optional(),
  title: z.string().optional(),
  venue: z.string().optional(),
  city: z.string().optional(),
  time: z.string().optional(),
  showOnSite: z.boolean().optional(),
  active: z.boolean().optional(),
});

export async function GET(request: Request) {
  if (!isValidApiKey(request)) return unauthorizedResponse();

  try {
    const collection = await getCollection("agenda");
    const shows = await collection.find({ active: { $ne: false } }).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json(shows.map(s => {
      const dateParts = (s.date || "").split(" ");
      const cityParts = (s.city || "").split(" - ");

      return {
        id: s._id.toString(),
        _id: s._id.toString(),
        date: dateParts[0] || "",
        month: dateParts[1] || "",
        weekday: s.weekday || "QUA",
        event: s.event || s.title || "",
        title: s.event || s.title || "",
        venue: cityParts[0] || "",
        city: cityParts[1] || cityParts[0] || "",
        time: s.time || "",
        showOnSite: s.showOnSite !== false
      };
    }));
  } catch (error) {
    console.error("Erro na API da Agenda (GET):", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isValidApiKey(request)) return unauthorizedResponse();

  try {
    const body = await request.json();
    const parsed = showSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.format() }, { status: 400 });
    }

    const collection = await getCollection("agenda");
    const result = await collection.insertOne({
      ...parsed.data,
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
  if (!isValidApiKey(request)) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });

    const body = await request.json();
    const parsed = showSchema.partial().safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.format() }, { status: 400 });
    }

    const collection = await getCollection("agenda");
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...parsed.data, updatedAt: new Date() } }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro na API da Agenda (PUT):", error);
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

    const collection = await getCollection("agenda");
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
