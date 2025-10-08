import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "rooms.json");

function readRooms() {
  const fileData = fs.readFileSync(dataFilePath, "utf8");
  return JSON.parse(fileData);
}

export async function GET(request, { params }) {
  try {
    const rooms = readRooms();
    const room = rooms.find((r) => r.id === parseInt(params.id));

    if (room) {
      return NextResponse.json(room);
    } else {
      return NextResponse.json({ error: "Oda bulunamadı" }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Oda okunamadı" }, { status: 500 });
  }
}
