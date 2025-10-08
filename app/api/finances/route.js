import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "finances.json");

function readFinances() {
  const fileData = fs.readFileSync(dataFilePath, "utf8");
  return JSON.parse(fileData);
}

function writeFinances(finances) {
  fs.writeFileSync(dataFilePath, JSON.stringify(finances, null, 2));
}

export async function GET() {
  try {
    const finances = readFinances();
    return NextResponse.json(finances);
  } catch (error) {
    return NextResponse.json({ error: "Veriler okunamadı" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const finances = readFinances();

    if (body.type === "income") {
      const newIncome = {
        id: Date.now(),
        description: body.description,
        amount: parseFloat(body.amount),
        paymentType: body.paymentType,
        date: body.date || new Date().toISOString(),
      };
      finances.incomes.push(newIncome);
    } else if (body.type === "expense") {
      const newExpense = {
        id: Date.now(),
        description: body.description,
        amount: parseFloat(body.amount),
        date: body.date || new Date().toISOString(),
      };
      finances.expenses.push(newExpense);
    }

    writeFinances(finances);
    return NextResponse.json(finances);
  } catch (error) {
    return NextResponse.json({ error: "Kayıt eklenemedi" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));
    const type = searchParams.get("type");

    const finances = readFinances();

    if (type === "income") {
      finances.incomes = finances.incomes.filter((item) => item.id !== id);
    } else if (type === "expense") {
      finances.expenses = finances.expenses.filter((item) => item.id !== id);
    }

    writeFinances(finances);
    return NextResponse.json(finances);
  } catch (error) {
    return NextResponse.json({ error: "Kayıt silinemedi" }, { status: 500 });
  }
}
