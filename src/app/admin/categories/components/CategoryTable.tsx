// app/admin/categories/components/CategoryTable.tsx
'use client';
import { Category } from '@/app/admin/categories/types';
import React from 'react';

interface Props {
  categories: Category[];
  setEditingCategory: React.Dispatch<React.SetStateAction<Category | null>>;
  handleDelete: (id: number) => void;
}

export default function CategoryTable({ 
  categories, 
  setEditingCategory, 
  handleDelete 
}: Props) {
  return (
    <div className="mb-12 mt-12 overflow-x-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Категории</h2>
        <button
          onClick={() => setEditingCategory({ id: 0, name: '', description: '' })}
          className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-dark)] rounded-lg hover:opacity-90 transition-opacity"
        >
          Добавить категорию
        </button>
      </div>
      
      <div className="bg-[var(--color-dark)] rounded-lg overflow-hidden shadow-md">
        <table className="min-w-full divide-y divide-[var(--color-gray)]">
          <thead className="bg-[var(--color-gray)]">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Название</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Описание</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-gray)]">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-[var(--color-gray)] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">{category.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{category.name}</td>
                <td className="px-6 py-4 whitespace-pre-line">{category.description || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                  <button
                    onClick={() => setEditingCategory(category)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
            
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-[var(--color-gray)]">
                  <p className="text-lg mb-2">Категории не найдены</p>
                  <p className="text-sm">Добавьте первую категорию, чтобы начать работу</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}