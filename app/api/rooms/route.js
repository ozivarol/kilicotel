import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "rooms.json");

function readRooms() {
  try {
    const fileData = fs.readFileSync(dataFilePath, "utf8");
    return JSON.parse(fileData);
  } catch (error) {
    console.error("Error reading rooms:", error);
    return [];
  }
}

function writeRooms(rooms) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(rooms, null, 2));
    return true;
  } catch (error) {
    console.error("Error writing rooms:", error);
    return false;
  }
}

export async function GET() {
  try {
    const rooms = readRooms();
    return NextResponse.json(rooms);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Odalar okunamadı" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const updatedRoom = await request.json();
    console.log("Updating room:", updatedRoom);

    const rooms = readRooms();
    const index = rooms.findIndex((room) => room.id === updatedRoom.id);

    if (index !== -1) {
      rooms[index] = {
        ...rooms[index],
        ...updatedRoom,
      };

      const writeSuccess = writeRooms(rooms);

      if (writeSuccess) {
        console.log("Room updated successfully:", rooms[index]);
        return NextResponse.json(rooms[index]);
      } else {
        return NextResponse.json(
          { error: "Oda kaydedilemedi" },
          { status: 500 }
        );
      }
    } else {
      console.error("Room not found:", updatedRoom.id);
      return NextResponse.json({ error: "Oda bulunamadı" }, { status: 404 });
    }
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { error: "Oda güncellenemedi: " + error.message },
      { status: 500 }
    );
  }
}
