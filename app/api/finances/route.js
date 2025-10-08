import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { rows } = await sql`
      SELECT 
        id,
        type,
        description,
        amount,
        payment_type as "paymentType",
        date
      FROM finances
      ORDER BY date DESC
    `;

    const incomes = rows
      .filter((r) => r.type === "income")
      .map((r) => ({
        id: r.id,
        description: r.description,
        amount: parseFloat(r.amount),
        paymentType: r.paymentType,
        date: r.date,
      }));

    const expenses = rows
      .filter((r) => r.type === "expense")
      .map((r) => ({
        id: r.id,
        description: r.description,
        amount: parseFloat(r.amount),
        date: r.date,
      }));

    return NextResponse.json({ incomes, expenses });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "Veriler okunamadı: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (body.type === "income") {
      await sql`
        INSERT INTO finances (type, description, amount, payment_type, date)
        VALUES (
          'income',
          ${body.description},
          ${body.amount},
          ${body.paymentType},
          ${body.date}
        )
      `;
    } else if (body.type === "expense") {
      await sql`
        INSERT INTO finances (type, description, amount, date)
        VALUES (
          'expense',
          ${body.description},
          ${body.amount},
          ${body.date}
        )
      `;
    }

    const { rows } = await sql`
      SELECT 
        id,
        type,
        description,
        amount,
        payment_type as "paymentType",
        date
      FROM finances
      ORDER BY date DESC
    `;

    const incomes = rows
      .filter((r) => r.type === "income")
      .map((r) => ({
        id: r.id,
        description: r.description,
        amount: parseFloat(r.amount),
        paymentType: r.paymentType,
        date: r.date,
      }));

    const expenses = rows
      .filter((r) => r.type === "expense")
      .map((r) => ({
        id: r.id,
        description: r.description,
        amount: parseFloat(r.amount),
        date: r.date,
      }));

    return NextResponse.json({ incomes, expenses });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json(
      { error: "Kayıt eklenemedi: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));
    const type = searchParams.get("type");

    await sql`
      DELETE FROM finances
      WHERE id = ${id} AND type = ${type}
    `;

    const { rows } = await sql`
      SELECT 
        id,
        type,
        description,
        amount,
        payment_type as "paymentType",
        date
      FROM finances
      ORDER BY date DESC
    `;

    const incomes = rows
      .filter((r) => r.type === "income")
      .map((r) => ({
        id: r.id,
        description: r.description,
        amount: parseFloat(r.amount),
        paymentType: r.paymentType,
        date: r.date,
      }));

    const expenses = rows
      .filter((r) => r.type === "expense")
      .map((r) => ({
        id: r.id,
        description: r.description,
        amount: parseFloat(r.amount),
        date: r.date,
      }));

    return NextResponse.json({ incomes, expenses });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { error: "Kayıt silinemedi: " + error.message },
      { status: 500 }
    );
  }
}
