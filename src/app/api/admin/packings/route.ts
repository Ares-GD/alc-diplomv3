// app/api/packings/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { pool } from "@/lib/db";
import { RowDataPacket } from 'mysql2';

// Типы данных
interface PackagingRow extends RowDataPacket {
  id: number;
  name: string;
  material_name: string | null;
  material_id: number | null;
  volume: number;
  unit_name: string | null;
  unit_id: number | null;
  form_type_name: string | null;
  form_type_id: number | null;
  image: string | null;
}

interface CountResult extends RowDataPacket {
  count: number;
}

interface ProductCheckResult extends RowDataPacket {
  count: number;
}

// Получение всех упаковок с привязкой к внешним сущностям
export async function GET(request: NextRequest) {
  try {
    const [rows] = await pool.query<PackagingRow[]>(
      `SELECT 
         pt.id, 
         pt.name, 
         m.name AS material_name, 
         pt.material AS material_id,
         pt.volume, 
         u.name AS unit_name, 
         pt.unit AS unit_id,
         ft.name AS form_type_name,
         pt.form_type AS form_type_id,
         pt.image
       FROM packaging_types pt
       LEFT JOIN materials m ON pt.material = m.id
       LEFT JOIN units u ON pt.unit = u.id
       LEFT JOIN form_types ft ON pt.form_type = ft.id`
    );
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error('Ошибка загрузки упаковок:', error);
    return NextResponse.json({ error: 'Ошибка загрузки упаковок' }, { status: 500 });
  }
}

// Создание новой упаковки
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const material_id = formData.get('material') as string;
    const volume = parseFloat(formData.get('volume') as string);
    const unit_id = formData.get('unit') as string;
    const form_type_id = formData.get('form_type') as string;
    const file = formData.get('image') as File | null;

    // Проверка обязательных полей
    if (!name || !volume || !unit_id) {
      return NextResponse.json(
        { error: 'Не все обязательные поля заполнены' },
        { status: 400 }
      );
    }

    // Обработка изображения
    let imagePath = null;
    if (file && file.size > 0) {
      // Проверка типа файла
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { error: 'Недопустимый тип файла. Пожалуйста, загрузите изображение' },
          { status: 400 }
        );
      }
      const ext = path.extname(file.name).toLowerCase() || 
                 file.type.split('/').pop() || 
                 '.jpg';
      const filename = `${uuidv4()}${ext}`;
      const uploadPath = path.join(process.cwd(), 'public', 'images', 'packings', filename);
      const dir = path.dirname(uploadPath);
      
      // Создание директории, если её нет
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (err) {
        console.error('Ошибка создания директории:', err);
        return NextResponse.json(
          { error: 'Ошибка сохранения файла' },
          { status: 500 }
        );
      }

      // Сохранение файла
      const buffer = await file.arrayBuffer();
      try {
        await fs.writeFile(uploadPath, Buffer.from(buffer));
        imagePath = `/images/packings/${filename}`;
      } catch (err) {
        console.error('Ошибка записи файла:', err);
        return NextResponse.json(
          { error: 'Ошибка сохранения файла' },
          { status: 500 }
        );
      }
    }

    // Вставка записи
    await pool.query(
      `INSERT INTO packaging_types 
       (name, material, volume, unit, form_type, image) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name, 
        Number(material_id || null), 
        volume, 
        Number(unit_id || null), 
        Number(form_type_id || null),
        imagePath
      ]
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Ошибка создания упаковки:', error);
    return NextResponse.json({ error: 'Ошибка создания упаковки' }, { status: 500 });
  }
}

// Обновление упаковки
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get('id') || '0');

    if (!id || Number.isNaN(id) || id <= 0) {
      return NextResponse.json(
        { error: 'Некорректный ID упаковки' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const material_id = formData.get('material') as string;
    const volume = parseFloat(formData.get('volume') as string);
    const unit_id = formData.get('unit') as string;
    const form_type_id = formData.get('form_type') as string;
    const file = formData.get('image') as File | null;

    // Получение текущей записи для обработки изображения
    const [existingRows] = await pool.query<RowDataPacket[]>(
      'SELECT image FROM packaging_types WHERE id = ?', 
      [id]
    );
    const existingImage = existingRows.length > 0 ? (existingRows[0] as { image: string }).image : null;
    let imagePath = existingImage;

    // Обработка изображения
    if (file && file.size > 0) {
      // Проверка типа файла
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { error: 'Недопустимый тип файла. Пожалуйста, загрузите изображение' },
          { status: 400 }
        );
      }
      const ext = path.extname(file.name).toLowerCase() || 
                 file.type.split('/').pop() || 
                 '.jpg';
      const filename = `${uuidv4()}${ext}`;
      const uploadPath = path.join(process.cwd(), 'public', 'images', 'packings', filename);
      const dir = path.dirname(uploadPath);

      // Создание директории, если её нет
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (err) {
        console.error('Ошибка создания директории:', err);
        return NextResponse.json(
          { error: 'Ошибка сохранения файла' },
          { status: 500 }
        );
      }

      // Сохранение файла
      const buffer = await file.arrayBuffer();
      try {
        await fs.writeFile(uploadPath, Buffer.from(buffer));
        imagePath = `/images/packings/${filename}`;

        // Удаление старого файла, если он существует
        if (existingImage) {
          const oldFilePath = path.join(process.cwd(), 'public', existingImage);
          try {
            await fs.unlink(oldFilePath);
          } catch (err) {
            console.warn('Не удалось удалить старый файл:', oldFilePath, err);
          }
        }
      } catch (err) {
        console.error('Ошибка записи файла:', err);
        return NextResponse.json(
          { error: 'Ошибка сохранения файла' },
          { status: 500 }
        );
      }
    }

    // Проверка существования связанных записей
    const checkForeignKey = async (table: string, field: string, value: number | null): Promise<boolean> => {
      if (value === null) return true;
      try {
        const [rows] = await pool.query<RowDataPacket[]>(
          `SELECT id FROM ?? WHERE id = ?`, 
          [table, value]
        );
        return rows.length > 0;
      } catch (err) {
        console.error(`Ошибка проверки связи с ${table}:`, err);
        return false;
      }
    };

    const materialExists = await checkForeignKey('materials', 'id', Number(material_id));
    const unitExists = await checkForeignKey('units', 'id', Number(unit_id));
    const formTypeExists = await checkForeignKey('form_types', 'id', Number(form_type_id));

    if (!materialExists) {
      return NextResponse.json(
        { error: `Материал с ID ${material_id} не найден` },
        { status: 400 }
      );
    }

    if (!unitExists) {
      return NextResponse.json(
        { error: `Единица измерения с ID ${unit_id} не найдена` },
        { status: 400 }
      );
    }

    if (!formTypeExists) {
      return NextResponse.json(
        { error: `Тип формы с ID ${form_type_id} не найден` },
        { status: 400 }
      );
    }

    // Обновление записи
    await pool.query(
      `UPDATE packaging_types SET 
         name = ?, 
         material = ?, 
         volume = ?, 
         unit = ?, 
         form_type = ?,
         image = ?
       WHERE id = ?`,
      [name, Number(material_id), volume, Number(unit_id), Number(form_type_id), imagePath, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка обновления упаковки:', error);
    return NextResponse.json({ error: 'Ошибка обновления упаковки' }, { status: 500 });
  }
}

// Удаление упаковки
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get('id') || '0');

    if (!id || Number.isNaN(id) || id <= 0) {
      return NextResponse.json(
        { error: 'Некорректный ID упаковки' },
        { status: 400 }
      );
    }

    // Проверка связей с продуктами
    const [productCheck] = await pool.query<ProductCheckResult[]>(
      `SELECT COUNT(*) AS count FROM product_packaging WHERE packaging_type_id = ?`,
      [id]
    );

    if (productCheck.length > 0 && productCheck[0].count > 0) {
      return NextResponse.json(
        { error: 'Нельзя удалить упаковку, которая используется в продуктах' },
        { status: 400 }
      );
    }

    // Получение информации о изображении
    const [imageRow] = await pool.query<RowDataPacket[]>(
      'SELECT image FROM packaging_types WHERE id = ?', 
      [id]
    );
    const imagePath = imageRow.length > 0 ? (imageRow[0] as { image: string }).image : null;

    // Удаление записи
    await pool.query(`DELETE FROM packaging_types WHERE id = ?`, [id]);

    // Удаление связанного изображения
    if (imagePath) {
      const filePath = path.join(process.cwd(), 'public', imagePath);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.warn('Не удалось удалить файл:', filePath, err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка удаления упаковки:', error);
    return NextResponse.json({ error: 'Ошибка удаления упаковки' }, { status: 500 });
  }
}