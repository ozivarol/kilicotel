import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    const { rows } = await sql`
      SELECT id, username
      FROM users
      WHERE username = ${username} AND password = ${password}
    `;

    if (rows.length > 0) {
      const user = rows[0];
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
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Bir hata oluştu: " + error.message },
      { status: 500 }
    );
  }
}
