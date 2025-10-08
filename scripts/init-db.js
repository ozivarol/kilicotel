import { sql } from "@vercel/postgres";

async function initDatabase() {
  try {
    console.log("Creating tables...");

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

    console.log("Checking if data exists...");

    const roomsCount = await sql`SELECT COUNT(*) FROM rooms`;
    if (roomsCount.rows[0].count === "0") {
      console.log("Inserting initial room data...");
      const roomsData = [];
      for (let i = 1; i <= 22; i++) {
        roomsData.push(sql`
          INSERT INTO rooms (id, room_number, status, breakfast, reservation_date, notes)
          VALUES (${i}, ${i.toString()}, 'boş', false, '', '')
        `);
      }
      await Promise.all(roomsData);
      console.log("22 rooms inserted");
    }

    const usersCount = await sql`SELECT COUNT(*) FROM users`;
    if (usersCount.rows[0].count === "0") {
      console.log("Inserting default user...");
      await sql`
        INSERT INTO users (username, password)
        VALUES ('admin', 'bugra123*')
      `;
      console.log("Admin user created");
    }

    console.log("✅ Database initialized successfully!");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
}

initDatabase();
