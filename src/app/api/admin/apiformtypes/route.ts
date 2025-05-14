// app/api/formtypes/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface FormType extends RowDataPacket {
  id: number;
  name: string;
}

interface CountResult extends RowDataPacket {
  count: number;
}

interface APIResponse {
  success: boolean;
  data?: FormType | FormType[];
  error?: string;
  message?: string;
}

function isCountResultArray(result: any): result is CountResult[] {
  return Array.isArray(result) && 
         result.every(item => typeof item === 'object' && 
         item !== null && 'count' in item);
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
    const results = await executeQuery<FormType[]>('SELECT * FROM form_types ORDER BY name ASC');
    const response: APIResponse = { success: true, data: results };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Ошибка загрузки типов форм:', error);
    const response: APIResponse = { success: false, error: 'Не удалось загрузить типы форм' };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      const response: APIResponse = { success: false, error: 'Название типа формы не указано или некорректно' };
      return NextResponse.json(response, { status: 400 });
    }
    const sanitized = name.trim();
    const existing = await executeQuery<FormType[]>('SELECT id FROM form_types WHERE name = ?', [sanitized]);
    if (existing.length > 0) {
      const response: APIResponse = { success: false, error: 'Тип формы с таким названием уже существует' };
      return NextResponse.json(response, { status: 400 });
    }
    await executeQuery('INSERT INTO form_types (name) VALUES (?)', [sanitized]);
    const response: APIResponse = { success: true, message: 'Тип формы успешно создан' };
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Ошибка создания типа формы:', error);
    const response: APIResponse = { success: false, error: 'Не удалось создать тип формы' };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get('id') || '0');
    const { name } = await request.json();
    if (!id || Number.isNaN(id) || id <= 0) {
      const response: APIResponse = { success: false, error: 'Некорректный ID типа формы' };
      return NextResponse.json(response, { status: 400 });
    }
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      const response: APIResponse = { success: false, error: 'Название типа формы не указано или некорректно' };
      return NextResponse.json(response, { status: 400 });
    }
    const sanitized = name.trim();
    const existing = await executeQuery<FormType[]>('SELECT id FROM form_types WHERE id = ?', [id]);
    if (existing.length === 0) {
      const response: APIResponse = { success: false, error: 'Тип формы не найден' };
      return NextResponse.json(response, { status: 404 });
    }
    const duplicateCheck = await executeQuery<FormType[]>('SELECT id FROM form_types WHERE name = ? AND id != ?', [sanitized, id]);
    if (duplicateCheck.length > 0) {
      const response: APIResponse = { success: false, error: 'Тип формы с таким названием уже существует' };
      return NextResponse.json(response, { status: 400 });
    }
    const usedInProducts = await executeQuery<CountResult[]>('SELECT COUNT(*) AS count FROM products WHERE form_type = ?', [id]);
    if (isCountResultArray(usedInProducts) && usedInProducts[0].count > 0) {
      const response: APIResponse = { success: false, error: 'Нельзя редактировать тип формы, который используется в продуктах' };
      return NextResponse.json(response, { status: 400 });
    }
    const [result] = await pool.query('UPDATE form_types SET name = ? WHERE id = ?', [sanitized, id]);
    if (typeof result === 'object' && 'affectedRows' in result && result.affectedRows === 0) {
      const response: APIResponse = { success: false, error: 'Не удалось обновить тип формы — данные не изменились или запись не найдена' };
      return NextResponse.json(response, { status: 400 });
    }
    const response: APIResponse = { success: true, message: 'Тип формы успешно обновлен' };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Ошибка обновления типа формы:', error);
    const response: APIResponse = { success: false, error: 'Ошибка обновления типа формы' };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get('id') || '0');
    if (!id || Number.isNaN(id) || id <= 0) {
      const response: APIResponse = { success: false, error: 'Некорректный ID типа формы' };
      return NextResponse.json(response, { status: 400 });
    }
    const usedInProducts = await executeQuery<CountResult[]>('SELECT COUNT(*) AS count FROM products WHERE form_type = ?', [id]);
    if (isCountResultArray(usedInProducts) && usedInProducts[0].count > 0) {
      const response: APIResponse = { success: false, error: 'Нельзя удалить тип формы, который используется в продуктах' };
      return NextResponse.json(response, { status: 400 });
    }
    await pool.query('DELETE FROM form_types WHERE id = ?', [id]);
    const response: APIResponse = { success: true, message: 'Тип формы успешно удален' };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Ошибка удаления типа формы:', error);
    const response: APIResponse = { success: false, error: 'Ошибка удаления типа формы' };
    return NextResponse.json(response, { status: 500 });
  }
} 