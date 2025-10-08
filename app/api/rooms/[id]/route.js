import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { rows } = await sql`
      SELECT 
        id,
        room_number as "roomNumber",
        status,
        breakfast,
        reservation_date as "reservationDate",
        notes
      FROM rooms
      WHERE id = ${params.id}
    `;

    if (rows.length > 0) {
      return NextResponse.json(rows[0]);
    } else {
      return NextResponse.json({ error: "Oda bulunamadı" }, { status: 404 });
    }
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "Oda okunamadı: " + error.message },
      { status: 500 }
    );
  }
}
