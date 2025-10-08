import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "users.json");

function readUsers() {
  const fileData = fs.readFileSync(dataFilePath, "utf8");
  return JSON.parse(fileData);
}

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    const data = readUsers();

    const user = data.users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      const response = NextResponse.json({
        success: true,
        user: { id: user.id, username: user.username },
      });
      response.cookies.set("auth", "true", {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      response.cookies.set("userId", user.id.toString(), {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return response;
    } else {
      return NextResponse.json(
        { success: false, message: "Kullanıcı adı veya şifre hatalı" },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
