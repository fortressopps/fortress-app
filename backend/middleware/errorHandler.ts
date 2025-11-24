import { NextResponse } from "next/server";

export function errorHandler(error: unknown) {
  // Logar erro para Sentry ou outro serviço aqui
  console.error(error);

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}