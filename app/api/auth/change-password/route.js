import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

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

    const { rows } = await sql`
      SELECT id, password
      FROM users
      WHERE id = ${userId}
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    if (rows[0].password !== currentPassword) {
      return NextResponse.json(
        { success: false, message: "Mevcut şifre hatalı" },
        { status: 401 }
      );
    }

    await sql`
      UPDATE users
      SET password = ${newPassword}
      WHERE id = ${userId}
    `;

    return NextResponse.json({
      success: true,
      message: "Şifre başarıyla değiştirildi",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { success: false, message: "Bir hata oluştu: " + error.message },
      { status: 500 }
    );
  }
}
