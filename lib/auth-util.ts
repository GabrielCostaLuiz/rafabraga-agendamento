import { NextRequest, NextResponse } from "next/server";

const API_SECRET_KEY = process.env.API_SECRET_KEY;

export function isValidApiKey(request: Request | NextRequest): boolean {
  const apiKey = request.headers.get("x-api-key");
  return apiKey === API_SECRET_KEY;
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: "Não autorizado: API Key inválida ou ausente." },
    { status: 401 }
  );
}
