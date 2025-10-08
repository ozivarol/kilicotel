import { sql } from "@vercel/postgres";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const roomsResult = await sql`SELECT * FROM rooms`;
    const rooms = roomsResult.rows;

    let historyQuery;
    let financesQuery;

    if (startDate && endDate) {
      historyQuery = sql`
        SELECT * FROM room_history 
        WHERE created_at >= ${startDate} AND created_at <= ${endDate}
      `;
      financesQuery = sql`
        SELECT * FROM finances 
        WHERE date >= ${startDate} AND date <= ${endDate}
      `;
    } else {
      historyQuery = sql`SELECT * FROM room_history`;
      financesQuery = sql`SELECT * FROM finances`;
    }

    const historyResult = await historyQuery;
    const financesResult = await financesQuery;
    
    const history = historyResult.rows;
    const finances = financesResult.rows;

    const kahvaltiSayisi = finances.filter(
      (f) => f.type === "income" && f.description.toLowerCase().includes("kahvaltı")
    ).length;

    const doluOlmaSayisi = history.filter(
      (h) => h.new_status === "dolu"
    ).length;

    const totalBreakfastCount = rooms.reduce((sum, r) => sum + (r.breakfast_count || 0), 0);
    
    const currentStats = {
      bosOdalar: rooms.filter((r) => r.status === "boş").length,
      doluOdalar: rooms.filter((r) => r.status === "dolu").length,
      kahvaltiVerilen: totalBreakfastCount,
    };

    return Response.json({
      success: true,
      stats: {
        ...currentStats,
        kahvaltiSayisi,
        satilanOdaSayisi: doluOlmaSayisi,
      },
    });
  } catch (error) {
    console.error("Stats Error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

