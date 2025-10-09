import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const historyResult = await sql`
      SELECT room_id, created_at 
      FROM room_history 
      WHERE new_status = 'dolu' 
      ORDER BY created_at DESC
    `;

    const roomsToCheckout = [];

    for (const record of historyResult.rows) {
      const recordDate = new Date(record.created_at);
      
      if (recordDate < oneDayAgo) {
        const roomResult = await sql`
          SELECT * FROM rooms WHERE id = ${record.room_id}
        `;
        
        if (roomResult.rows.length > 0 && roomResult.rows[0].status === 'dolu') {
          await sql`
            UPDATE rooms 
            SET status = 'boş', breakfast_count = 0 
            WHERE id = ${record.room_id}
          `;

          await sql`
            INSERT INTO room_history (room_id, old_status, new_status, created_at)
            VALUES (${record.room_id}, 'dolu', 'boş', ${now.toISOString()})
          `;

          roomsToCheckout.push({
            roomId: record.room_id,
            roomNumber: roomResult.rows[0].room_number,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${roomsToCheckout.length} oda otomatik olarak boşaltıldı`,
      rooms: roomsToCheckout,
    });
  } catch (error) {
    console.error("Auto-checkout Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

