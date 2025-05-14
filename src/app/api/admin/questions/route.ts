import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const search = searchParams.get("search") || "";

    const offset = (page - 1) * pageSize;

    const [rows]: any = await pool.query(
      `SELECT * FROM questions 
       WHERE name LIKE ? OR question LIKE ? OR phone LIKE ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [`%${search}%`, `%${search}%`, `%${search}%`, pageSize, offset]
    );

    const [countRows]: any = await pool.query(
      `SELECT COUNT(*) as total FROM questions 
       WHERE name LIKE ? OR question LIKE ? OR phone LIKE ?`,
      [`%${search}%`, `%${search}%`, `%${search}%`]
    );

    return NextResponse.json({
      data: rows,
      pagination: {
        total: countRows[0].total,
        page,
        pageSize,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
    }

    const id = parseInt(params.id);
    if (isNaN(id) || id < 1) {
      return NextResponse.json({ error: "Некорректный ID" }, { status: 400 });
    }

    // Проверяем, существует ли запись
    const [existingRows]: any = await pool.query(
      "SELECT id FROM questions WHERE id = ?",
      [id]
    );

    if (existingRows.length === 0) {
      return NextResponse.json({ error: "Запись не найдена" }, { status: 404 });
    }

    // Удаляем запись
    await pool.query("DELETE FROM questions WHERE id = ?", [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка удаления:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}