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

    const breakfastDetails = rooms
      .filter((r) => r.status === "dolu" && r.breakfast_count > 0)
      .map((r) => ({
        roomNumber: r.room_number,
        count: r.breakfast_count,
      }));

    const paymentStats = {
      nakit: 0,
      kart: 0,
      internet: 0,
    };

    finances
      .filter((f) => f.type === "income" && f.payment_type)
      .forEach((f) => {
        if (paymentStats.hasOwnProperty(f.payment_type)) {
          paymentStats[f.payment_type] += parseFloat(f.amount);
        }
      });

    return Response.json({
      success: true,
      stats: {
        ...currentStats,
        kahvaltiSayisi,
        satilanOdaSayisi: doluOlmaSayisi,
        breakfastDetails,
        paymentStats,
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

