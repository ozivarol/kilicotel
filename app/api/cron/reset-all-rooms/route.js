import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET(request) {
  // Vercel Cron Jobs otomatik olarak bu header'ı ekler
  // Local testlerde engel olmaması için production kontrolü eklenebilir
  // veya sadece header varsa kontrol edilir.
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Önce dolu olan odaları bulalım (History için)
    const activeRooms = await sql`
      SELECT id, room_number, status 
      FROM rooms 
      WHERE status != 'boş'
    `;

    // Tüm odaları güncelle
    const result = await sql`
      UPDATE rooms 
      SET status = 'boş', breakfast_count = 0
      WHERE status != 'boş' OR breakfast_count > 0
    `;

    // History'ye kayıt at (Toplu güncelleme olduğu için her oda için ayrı kayıt atmak
    // veritabanını yorabilir ama izlenebilirlik için iyidir)
    if (activeRooms.rows.length > 0) {
      const timestamp = new Date().toISOString();
      // Basit bir döngü ile history ekleyelim
      // Performans için toplu insert daha iyi olurdu ama SQL injection riski olmadan
      // template literal ile döngü kurmak en güvenlisi şimdilik.
      for (const room of activeRooms.rows) {
        await sql`
          INSERT INTO room_history (room_id, room_number, old_status, new_status, created_at)
          VALUES (${room.id}, ${room.room_number}, ${room.status}, 'boş', ${timestamp})
        `;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Tüm odalar başarıyla boşaltıldı.",
      updatedCount: result.rowCount,
      processedRooms: activeRooms.rows.length
    });
  } catch (error) {
    console.error("Cron Job Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

