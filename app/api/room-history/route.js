import { sql } from "@vercel/postgres";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let query;
    
    if (startDate && endDate) {
      query = sql`
        SELECT * FROM room_history 
        WHERE created_at >= ${startDate} AND created_at <= ${endDate}
        ORDER BY created_at DESC
      `;
    } else {
      query = sql`
        SELECT * FROM room_history 
        ORDER BY created_at DESC 
        LIMIT 100
      `;
    }

    const result = await query;

    return Response.json({
      success: true,
      history: result.rows,
    });
  } catch (error) {
    console.error("Room history Error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { roomId, roomNumber, oldStatus, newStatus } = await request.json();

    await sql`
      INSERT INTO room_history (room_id, room_number, old_status, new_status, created_at)
      VALUES (${roomId}, ${roomNumber}, ${oldStatus}, ${newStatus}, NOW())
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Room history POST Error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

