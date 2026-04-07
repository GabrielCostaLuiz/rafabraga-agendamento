"use server";

import { RAFA_BRAGA_DATA } from "@/lib/constants";
import { getCollection } from "@/lib/mongodb";
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
  houseNumber: z.string().optional(),
  showDate: z.string().optional().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    const year = date.getFullYear();
    const isFourDigits = val.split('-')[0].length === 4;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(val);
    selectedDate.setHours(0, 0, 0, 0);

    return year > 2000 && year < 10000 && isFourDigits && selectedDate >= today;
  }),
  musicians: z.string().optional(),
  style: z.array(z.string()).min(1),
  acoustics: z.string().min(1),
  infra: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export async function submitContactForm(data: z.infer<typeof formSchema>) {
  try {
    // 1. AppSec: Strict payload validation
    const parsed = formSchema.safeParse(data);
    
    if (!parsed.success) {
      console.warn("[AppSec] Tentativa de envio inválida rejeitada.");
      return { success: false, error: "Dados preenchidos inválidos." };
    }

    // 2. AppSec: Rate Limiting Avançado (3 pedidos por hora)
    const sixtyMinutesAgo = new Date(Date.now() - 60 * 60 * 1000);
    const collection = await getCollection("budgets");
    
    const recentRequests = await collection
      .find({
        phone: parsed.data.phone,
        createdAt: { $gte: sixtyMinutesAgo }
      })
      .sort({ createdAt: 1 })
      .toArray();

    if (recentRequests.length >= 3) {
      const oldestRequest = recentRequests[0];
      const nextAllowedTime = new Date(oldestRequest.createdAt.getTime() + 60 * 60 * 1000);
      const minutesRemaining = Math.ceil((nextAllowedTime.getTime() - Date.now()) / 60000);
      
      return { 
        success: false, 
        error: `Você já enviou 3 pedidos recentemente. Tente novamente em ${minutesRemaining} minutos ou entre em contato direto pelo WhatsApp para agilizar o atendimento: ${RAFA_BRAGA_DATA.whatsapp.number}.` 
      };
    }

    // 3. Sanitização e Criação de Tracking
    const securePayload = {
      ...parsed.data,
      status: "Novo",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 4. Ingestão 
    await collection.insertOne(securePayload);

    return { success: true };
  } catch (error) {
    console.error("Erro interno no formulário de contato (MongoDB):", error);
    return { success: false, error: "Erro interno. Tente novamente mais tarde." };
  }
}
