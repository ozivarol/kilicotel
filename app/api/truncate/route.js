import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await sql`TRUNCATE TABLE room_history RESTART IDENTITY CASCADE`;
    await sql`TRUNCATE TABLE reservations RESTART IDENTITY CASCADE`;
    await sql`TRUNCATE TABLE finances RESTART IDENTITY CASCADE`;
    
    await sql`
      UPDATE rooms 
      SET status = 'boş', breakfast_count = 0
    `;

    return NextResponse.json({
      success: true,
      message: "Tüm veriler başarıyla temizlendi",
    });
  } catch (error) {
    console.error("Truncate Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

