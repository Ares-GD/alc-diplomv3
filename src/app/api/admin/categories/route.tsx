import { NextRequest, NextResponse } from 'next/server';
import { pool } from "@/lib/db";
import { RowDataPacket } from 'mysql2';

interface CountResult extends RowDataPacket {
  count: number;
}

function isCountResultArray(result: any): result is CountResult[] {
  return Array.isArray(result) && result.every(item => typeof item === 'object' && item !== null && 'count' in item);
}

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM categorys ORDER BY name ASC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Ошибка загрузки категорий:', error);
    return NextResponse.json({ error: 'Не удалось загрузить категории' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json();
    const [existing] = await pool.query('SELECT id FROM categorys WHERE name = ?', [name]);
    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json({ error: 'Категория с таким названием уже существует' }, { status: 400 });
    }
    await pool.query('INSERT INTO categorys (name, description) VALUES (?, ?)', [name, description || null]);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Ошибка создания категории:', error);
    return NextResponse.json({ error: 'Не удалось создать категорию' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get('id') || '0');
    const { name, description } = await request.json();

    if (!id || Number.isNaN(id) || id <= 0) {
      return NextResponse.json({ error: 'Некорректный ID категории' }, { status: 400 });
    }

    const [existing] = await pool.query<RowDataPacket[]>('SELECT id FROM categorys WHERE id = ?', [id]);
    if (!Array.isArray(existing) || existing.length === 0) {
      return NextResponse.json({ error: 'Категория не найдена' }, { status: 404 });
    }

    const [duplicateCheck] = await pool.query<RowDataPacket[]>('SELECT id FROM categorys WHERE name = ? AND id != ?', [name, id]);
    if (Array.isArray(duplicateCheck) && duplicateCheck.length > 0) {
      return NextResponse.json({ error: 'Категория с таким названием уже существует' }, { status: 400 });
    }

    const [usedInProducts] = await pool.query<CountResult[]>('SELECT COUNT(*) AS count FROM products WHERE category = ?', [id]);
    if (isCountResultArray(usedInProducts) && usedInProducts[0].count > 0) {
      return NextResponse.json({ error: 'Нельзя редактировать категорию, которая используется в продуктах' }, { status: 400 });
    }

    await pool.query('UPDATE categorys SET name = ?, description = ? WHERE id = ?', [name, description || null, id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка обновления категории:', error);
    return NextResponse.json({ error: 'Ошибка обновления категории' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get('id') || '0');

    if (!id || Number.isNaN(id) || id <= 0) {
      return NextResponse.json({ error: 'Некорректный ID категории' }, { status: 400 });
    }

    const [usedInProducts] = await pool.query<CountResult[]>('SELECT COUNT(*) AS count FROM products WHERE category = ?', [id]);
    if (isCountResultArray(usedInProducts) && usedInProducts[0].count > 0) {
      return NextResponse.json({ error: 'Нельзя удалить категорию, которая используется в продуктах' }, { status: 400 });
    }

    await pool.query('DELETE FROM categorys WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка удаления категории:', error);
    return NextResponse.json({ error: 'Не удалось удалить категорию' }, { status: 500 });
  }
}