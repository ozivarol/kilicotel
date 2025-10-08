import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY,
        room_number VARCHAR(10) NOT NULL,
        status VARCHAR(20) DEFAULT 'boş',
        breakfast BOOLEAN DEFAULT false,
        reservation_date VARCHAR(50) DEFAULT '',
        notes TEXT DEFAULT ''
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS finances (
        id SERIAL PRIMARY KEY,
        type VARCHAR(20) NOT NULL,
        description TEXT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_type VARCHAR(20),
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const roomsCount = await sql`SELECT COUNT(*) FROM rooms`;
    if (roomsCount.rows[0].count === "0") {
      for (let i = 1; i <= 22; i++) {
        await sql`
          INSERT INTO rooms (id, room_number, status, breakfast, reservation_date, notes)
          VALUES (${i}, ${i.toString()}, 'boş', false, '', '')
        `;
      }
    }

    const usersCount = await sql`SELECT COUNT(*) FROM users`;
    if (usersCount.rows[0].count === "0") {
      await sql`
        INSERT INTO users (username, password)
        VALUES ('admin', 'bugra123*')
      `;
    }

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
      tables: ["rooms", "users", "finances"],
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
