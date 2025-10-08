import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("auth");
  response.cookies.delete("userId");
  return response;
}
