import { sql } from "@vercel/postgres";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId");

    let query;
    if (roomId) {
      query = sql`
        SELECT * FROM reservations 
        WHERE room_id = ${roomId}
        ORDER BY reservation_date ASC
      `;
    } else {
      query = sql`
        SELECT * FROM reservations 
        ORDER BY reservation_date ASC
      `;
    }

    const result = await query;

    return Response.json({
      success: true,
      reservations: result.rows,
    });
  } catch (error) {
    console.error("Reservations GET Error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { roomId, roomNumber, reservationDate, notes } = await request.json();

    await sql`
      INSERT INTO reservations (room_id, room_number, reservation_date, notes)
      VALUES (${roomId}, ${roomNumber}, ${reservationDate}, ${notes || ""})
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Reservations POST Error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    await sql`DELETE FROM reservations WHERE id = ${id}`;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Reservations DELETE Error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

