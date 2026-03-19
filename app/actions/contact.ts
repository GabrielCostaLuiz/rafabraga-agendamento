"use server";

import clientPromise from "@/lib/mongodb";
import { z } from "zod";

// Zod Schema Sever Side (Single Source of Truth, no-trust architecture)
const formSchema = z.object({
  name: z.string().min(3),
  phone: z.string()
    .min(10)
    .max(15)
    .regex(/^\d+$/),
  cep: z.string().optional(),
  location: z.string().min(3),
  style: z.array(z.string()).min(1),
  acoustics: z.string().min(1),
  infra: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export async function submitContactForm(data: z.infer<typeof formSchema>) {
  try {
    // 1. AppSec: Strict payload validation - Strip Extra fields to prevent Mass Assignment
    const parsed = formSchema.safeParse(data);
    
    if (!parsed.success) {
      console.warn("[AppSec] Tentativa de envio inválida rejeitada.");
      return { success: false, error: "Dados preenchidos inválidos." };
    }

    // 2. Database Connection
    const client = await clientPromise;
    // Opcionalmente pegando da .env, pro safety, chamamos a collection principal:
    const db = client.db(process.env.MONGODB_DB); 

    // 3. Sanitização e Criação de Tracking
    // O Zod parse default retira campos fantasmas passados por atacantes. (Safe-Payload)
    const securePayload = {
      ...parsed.data,
      status: "Novo",               // Status inicial do pipeline de vendas do App Mobile
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 4. Ingestão 
    const collection = db.collection("budgets");
    await collection.insertOne(securePayload);

    return { success: true };
  } catch (error) {
    console.error("Erro interno no formulário de contato (MongoDB):", error);
    return { success: false, error: "Erro interno. Tente novamente mais tarde." };
  }
}
