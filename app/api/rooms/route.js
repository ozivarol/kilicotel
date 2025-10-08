import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { rows } = await sql`
      SELECT 
        id,
        room_number as "roomNumber",
        status,
        breakfast_count as "breakfastCount"
      FROM rooms
      ORDER BY id ASC
    `;

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "Odalar okunamadı: " + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const updatedRoom = await request.json();
    console.log("Updating room:", updatedRoom);

    const { rows: oldRoomData } = await sql`
      SELECT status FROM rooms WHERE id = ${updatedRoom.id}
    `;

    await sql`
      UPDATE rooms
      SET 
        status = ${updatedRoom.status},
        breakfast_count = ${updatedRoom.breakfastCount || 0}
      WHERE id = ${updatedRoom.id}
    `;

    if (
      oldRoomData.length > 0 &&
      oldRoomData[0].status !== updatedRoom.status
    ) {
      await sql`
        INSERT INTO room_history (room_id, room_number, old_status, new_status, created_at)
        VALUES (${updatedRoom.id}, ${updatedRoom.roomNumber}, ${oldRoomData[0].status}, ${updatedRoom.status}, NOW())
      `;
    }

    const { rows } = await sql`
      SELECT 
        id,
        room_number as "roomNumber",
        status,
        breakfast_count as "breakfastCount"
      FROM rooms
      WHERE id = ${updatedRoom.id}
    `;

    if (rows.length > 0) {
      console.log("Room updated successfully:", rows[0]);
      return NextResponse.json(rows[0]);
    } else {
      return NextResponse.json({ error: "Oda bulunamadı" }, { status: 404 });
    }
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { error: "Oda güncellenemedi: " + error.message },
      { status: 500 }
    );
  }
}
