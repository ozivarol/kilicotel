import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "rooms.json");

function readRooms() {
  const fileData = fs.readFileSync(dataFilePath, "utf8");
  return JSON.parse(fileData);
}

function writeRooms(rooms) {
  fs.writeFileSync(dataFilePath, JSON.stringify(rooms, null, 2));
}

export async function GET() {
  try {
    const rooms = readRooms();
    return NextResponse.json(rooms);
  } catch (error) {
    return NextResponse.json({ error: "Odalar okunamadı" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const updatedRoom = await request.json();
    const rooms = readRooms();

    const index = rooms.findIndex((room) => room.id === updatedRoom.id);
    if (index !== -1) {
      rooms[index] = updatedRoom;
      writeRooms(rooms);
      return NextResponse.json(updatedRoom);
    } else {
      return NextResponse.json({ error: "Oda bulunamadı" }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Oda güncellenemedi" }, { status: 500 });
  }
}
