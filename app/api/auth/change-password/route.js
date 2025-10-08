import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { cookies } from "next/headers";

const dataFilePath = path.join(process.cwd(), "data", "users.json");

function readUsers() {
  const fileData = fs.readFileSync(dataFilePath, "utf8");
  return JSON.parse(fileData);
}

function writeUsers(data) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const auth = cookieStore.get("auth");
    const userIdCookie = cookieStore.get("userId");

    if (!auth || auth.value !== "true" || !userIdCookie) {
      return NextResponse.json(
        { success: false, message: "Yetkisiz erişim" },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();
    const userId = parseInt(userIdCookie.value);
    const data = readUsers();

    const userIndex = data.users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    if (data.users[userIndex].password !== currentPassword) {
      return NextResponse.json(
        { success: false, message: "Mevcut şifre hatalı" },
        { status: 401 }
      );
    }

    data.users[userIndex].password = newPassword;
    writeUsers(data);

    return NextResponse.json({
      success: true,
      message: "Şifre başarıyla değiştirildi",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
