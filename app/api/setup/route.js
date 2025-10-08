import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY,
        room_number VARCHAR(10) NOT NULL,
        status VARCHAR(20) DEFAULT 'boş',
        breakfast_count INTEGER DEFAULT 0
      )
    `;

    await sql`
      DO $$ 
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'rooms' AND column_name = 'breakfast'
        ) THEN
          ALTER TABLE rooms DROP COLUMN breakfast;
        END IF;
        
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'rooms' AND column_name = 'breakfast_count'
        ) THEN
          ALTER TABLE rooms ADD COLUMN breakfast_count INTEGER DEFAULT 0;
        END IF;
      END $$;
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

    await sql`
      CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        room_id INTEGER NOT NULL,
        room_number VARCHAR(10) NOT NULL,
        reservation_date DATE NOT NULL,
        notes TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS room_history (
        id SERIAL PRIMARY KEY,
        room_id INTEGER NOT NULL,
        room_number VARCHAR(10) NOT NULL,
        old_status VARCHAR(20),
        new_status VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const roomsCount = await sql`SELECT COUNT(*) FROM rooms`;
    if (roomsCount.rows[0].count === "0") {
      for (let i = 1; i <= 22; i++) {
        await sql`
          INSERT INTO rooms (id, room_number, status, breakfast_count)
          VALUES (${i}, ${i.toString()}, 'boş', 0)
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
      tables: ["rooms", "users", "finances", "reservations", "room_history"],
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
