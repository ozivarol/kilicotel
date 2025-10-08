import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { rows } = await sql`
      SELECT 
        id,
        room_number as "roomNumber",
        status,
        breakfast
      FROM rooms
      WHERE id = ${params.id}
    `;

    if (rows.length > 0) {
      const reservationsResult = await sql`
        SELECT * FROM reservations 
        WHERE room_id = ${params.id}
        ORDER BY reservation_date ASC
      `;

      return NextResponse.json({
        ...rows[0],
        reservations: reservationsResult.rows,
      });
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
