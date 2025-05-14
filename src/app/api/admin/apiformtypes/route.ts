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
    const [rows] = await pool.query('SELECT * FROM form_types ORDER BY name ASC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Ошибка загрузки типов форм:', error);
    return NextResponse.json({ error: 'Не удалось загрузить типы форм' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    const [existing] = await pool.query('SELECT id FROM form_types WHERE name = ?', [name]);
    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json({ error: 'Тип формы с таким названием уже существует' }, { status: 400 });
    }
    await pool.query('INSERT INTO form_types (name) VALUES (?)', [name]);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Ошибка создания типа формы:', error);
    return NextResponse.json({ error: 'Не удалось создать тип формы' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get('id') || '0');
    const { name } = await request.json();
    if (!id || Number.isNaN(id) || id <= 0) {
      return NextResponse.json({ error: 'Некорректный ID типа формы' }, { status: 400 });
    }
    const [existing] = await pool.query<RowDataPacket[]>('SELECT id FROM form_types WHERE id = ?', [id]);
    if (!Array.isArray(existing) || existing.length === 0) {
      return NextResponse.json({ error: 'Тип формы не найден' }, { status: 404 });
    }
    const [duplicateCheck] = await pool.query<RowDataPacket[]>('SELECT id FROM form_types WHERE name = ? AND id != ?', [name, id]);
    if (Array.isArray(duplicateCheck) && duplicateCheck.length > 0) {
      return NextResponse.json({ error: 'Тип формы с таким названием уже существует' }, { status: 400 });
    }
    const [usedInProducts] = await pool.query<CountResult[]>('SELECT COUNT(*) AS count FROM products WHERE form_type = ?', [id]);
    if (isCountResultArray(usedInProducts) && usedInProducts[0].count > 0) {
      return NextResponse.json({ error: 'Нельзя редактировать тип формы, который используется в продуктах' }, { status: 400 });
    }
    await pool.query('UPDATE form_types SET name = ? WHERE id = ?', [name, id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка обновления типа формы:', error);
    return NextResponse.json({ error: 'Ошибка обновления типа формы' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get('id') || '0');
    if (!id || Number.isNaN(id) || id <= 0) {
      return NextResponse.json({ error: 'Некорректный ID типа формы' }, { status: 400 });
    }
    const [usedInProducts] = await pool.query<CountResult[]>('SELECT COUNT(*) AS count FROM products WHERE form_type = ?', [id]);
    if (isCountResultArray(usedInProducts) && usedInProducts[0].count > 0) {
      return NextResponse.json({ error: 'Нельзя удалить тип формы, который используется в продуктах' }, { status: 400 });
    }
    await pool.query('DELETE FROM form_types WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка удаления типа формы:', error);
    return NextResponse.json({ error: 'Не удалось удалить тип формы' }, { status: 500 });
  }
}