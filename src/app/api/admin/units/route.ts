// app/api/units/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface Unit extends RowDataPacket {
  id: number;
  name: string;
}

interface CountResult extends RowDataPacket {
  count: number;
}

interface APIResponse {
  success: boolean;
  data?: Unit | Unit[];
  error?: string;
  message?: string;
}

function isCountResultArray(result: any): result is CountResult[] {
  return Array.isArray(result) && result.every(item => typeof item === 'object' && item !== null && 'count' in item);
}

async function executeQuery<T extends RowDataPacket[]>(query: string, values?: any[]): Promise<T> {
  try {
    const [results] = await pool.query<T>(query, values);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error('Ошибка выполнения запроса к базе данных');
  }
}

export async function GET() {
  try {
    const results = await executeQuery<Unit[]>('SELECT * FROM units ORDER BY name ASC');
    const response: APIResponse = { success: true, data: results };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Ошибка загрузки единиц измерения:', error);
    const response: APIResponse = { success: false, error: 'Не удалось загрузить единицы измерения' };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      const response: APIResponse = { success: false, error: 'Название единицы измерения не указано или некорректно' };
      return NextResponse.json(response, { status: 400 });
    }
    const sanitized = name.trim();
    const existing = await executeQuery<Unit[]>('SELECT id FROM units WHERE name = ?', [sanitized]);
    if (existing.length > 0) {
      const response: APIResponse = { success: false, error: 'Единица измерения с таким названием уже существует' };
      return NextResponse.json(response, { status: 400 });
    }
    await executeQuery('INSERT INTO units (name) VALUES (?)', [sanitized]);
    const response: APIResponse = { success: true, message: 'Единица измерения успешно создана' };
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Ошибка создания единицы:', error);
    const response: APIResponse = { success: false, error: 'Не удалось создать единицу' };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get('id') || '0');
    const { name } = await request.json();
    if (!id || Number.isNaN(id) || id <= 0) {
      const response: APIResponse = { success: false, error: 'Некорректный ID единицы' };
      return NextResponse.json(response, { status: 400 });
    }
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      const response: APIResponse = { success: false, error: 'Название единицы измерения не указано или некорректно' };
      return NextResponse.json(response, { status: 400 });
    }
    const sanitized = name.trim();
    const existing = await executeQuery<Unit[]>('SELECT id FROM units WHERE id = ?', [id]);
    if (existing.length === 0) {
      const response: APIResponse = { success: false, error: 'Единица измерения не найдена' };
      return NextResponse.json(response, { status: 404 });
    }
    const duplicateCheck = await executeQuery<Unit[]>('SELECT id FROM units WHERE name = ? AND id != ?', [sanitized, id]);
    if (duplicateCheck.length > 0) {
      const response: APIResponse = { success: false, error: 'Единица с таким названием уже существует' };
      return NextResponse.json(response, { status: 400 });
    }
    const usedInPackaging = await executeQuery<CountResult[]>('SELECT COUNT(*) AS count FROM packaging_types WHERE unit = ?', [id]);
    if (isCountResultArray(usedInPackaging) && usedInPackaging[0].count > 0) {
      const response: APIResponse = { success: false, error: 'Нельзя редактировать единицу, которая используется в упаковках' };
      return NextResponse.json(response, { status: 400 });
    }
    const [result] = await pool.query('UPDATE units SET name = ? WHERE id = ?', [sanitized, id]);
    if (typeof result === 'object' && 'affectedRows' in result && result.affectedRows === 0) {
      const response: APIResponse = { success: false, error: 'Не удалось обновить единицу — данные не изменились или запись не найдена' };
      return NextResponse.json(response, { status: 400 });
    }
    const response: APIResponse = { success: true, message: 'Единица измерения успешно обновлена' };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Ошибка обновления единицы:', error);
    const response: APIResponse = { success: false, error: 'Ошибка обновления единицы' };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get('id') || '0');
    if (!id || Number.isNaN(id) || id <= 0) {
      const response: APIResponse = { success: false, error: 'Некорректный ID единицы' };
      return NextResponse.json(response, { status: 400 });
    }
    const usedInPackaging = await executeQuery<CountResult[]>('SELECT COUNT(*) AS count FROM packaging_types WHERE unit = ?', [id]);
    if (isCountResultArray(usedInPackaging) && usedInPackaging[0].count > 0) {
      const response: APIResponse = { success: false, error: 'Нельзя удалить единицу, которая используется в упаковках' };
      return NextResponse.json(response, { status: 400 });
    }
    await pool.query('DELETE FROM units WHERE id = ?', [id]);
    const response: APIResponse = { success: true, message: 'Единица измерения успешно удалена' };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Ошибка удаления единицы:', error);
    const response: APIResponse = { success: false, error: 'Ошибка удаления единицы' };
    return NextResponse.json(response, { status: 500 });
  }
}