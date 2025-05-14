// app/api/categories/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface Category extends RowDataPacket {
  id: number;
  name: string;
  description: string | null;
}

interface CountResult extends RowDataPacket {
  count: number;
}

interface APIResponse {
  success: boolean;
  data?: Category | Category[];
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
    const results = await executeQuery<Category[]>('SELECT * FROM categories ORDER BY name ASC');
    const response: APIResponse = { success: true, data: results };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Ошибка загрузки категорий:', error);
    const response: APIResponse = { success: false, error: 'Не удалось загрузить категории' };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json();
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      const response: APIResponse = { 
        success: false, 
        error: 'Название категории обязательно и должно быть строкой' 
      };
      return NextResponse.json(response, { status: 400 });
    }

    const sanitized = name.trim();
    const existing = await executeQuery<Category[]>('SELECT id FROM categories WHERE name = ?', [sanitized]);
    
    if (existing.length > 0) {
      const response: APIResponse = { 
        success: false, 
        error: 'Категория с таким названием уже существует' 
      };
      return NextResponse.json(response, { status: 400 });
    }

    await executeQuery(
      'INSERT INTO categories (name, description) VALUES (?, ?)', 
      [sanitized, description ?? null]
    );
    
    const response: APIResponse = { 
      success: true, 
      message: 'Категория успешно создана' 
    };
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Ошибка создания категории:', error);
    const response: APIResponse = { success: false, error: 'Не удалось создать категорию' };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get('id') || '0');
    const { name, description } = await request.json();
    
    if (!id || Number.isNaN(id) || id <= 0) {
      const response: APIResponse = { success: false, error: 'Некорректный ID категории' };
      return NextResponse.json(response, { status: 400 });
    }
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      const response: APIResponse = { 
        success: false, 
        error: 'Название категории обязательно и должно быть строкой' 
      };
      return NextResponse.json(response, { status: 400 });
    }

    const sanitized = name.trim();
    const existing = await executeQuery<Category[]>('SELECT id FROM categories WHERE id = ?', [id]);
    
    if (existing.length === 0) {
      const response: APIResponse = { success: false, error: 'Категория не найдена' };
      return NextResponse.json(response, { status: 404 });
    }

    const duplicateCheck = await executeQuery<Category[]>(
      'SELECT id FROM categories WHERE name = ? AND id != ?', 
      [sanitized, id]
    );
    
    if (duplicateCheck.length > 0) {
      const response: APIResponse = { 
        success: false, 
        error: 'Категория с таким названием уже существует' 
      };
      return NextResponse.json(response, { status: 400 });
    }

    const usedInProducts = await executeQuery<CountResult[]>(
      'SELECT COUNT(*) AS count FROM products WHERE category = ?', 
      [id]
    );
    
    if (isCountResultArray(usedInProducts) && usedInProducts[0].count > 0) {
      const response: APIResponse = { 
        success: false, 
        error: 'Нельзя редактировать категорию, которая используется в продуктах' 
      };
      return NextResponse.json(response, { status: 400 });
    }

    const [result] = await pool.query(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?', 
      [sanitized, description ?? null, id]
    );
    
    if (typeof result === 'object' && 'affectedRows' in result && result.affectedRows === 0) {
      const response: APIResponse = { 
        success: false, 
        error: 'Не удалось обновить категорию — данные не изменились или запись не найдена' 
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    const response: APIResponse = { success: true, message: 'Категория успешно обновлена' };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Ошибка обновления категории:', error);
    const response: APIResponse = { success: false, error: 'Ошибка обновления категории' };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get('id') || '0');
    
    if (!id || Number.isNaN(id) || id <= 0) {
      const response: APIResponse = { success: false, error: 'Некорректный ID категории' };
      return NextResponse.json(response, { status: 400 });
    }

    const usedInProducts = await executeQuery<CountResult[]>(
      'SELECT COUNT(*) AS count FROM products WHERE category = ?', 
      [id]
    );
    
    if (isCountResultArray(usedInProducts) && usedInProducts[0].count > 0) {
      const response: APIResponse = { 
        success: false, 
        error: 'Нельзя удалить категорию, которая используется в продуктах' 
      };
      return NextResponse.json(response, { status: 400 });
    }

    await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    
    const response: APIResponse = { success: true, message: 'Категория успешно удалена' };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Ошибка удаления категории:', error);
    const response: APIResponse = { success: false, error: 'Ошибка удаления категории' };
    return NextResponse.json(response, { status: 500 });
  }
}