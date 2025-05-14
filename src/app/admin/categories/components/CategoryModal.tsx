// app/admin/categories/components/CategoryModal.tsx
'use client';
import { Category } from '@/app/admin/categories/types';
import React from 'react';

interface Props {
  editingCategory: Category | null;
  setEditingCategory: React.Dispatch<React.SetStateAction<Category | null>>;
  handleSave: () => void;
}

export default function CategoryModal({
  editingCategory,
  setEditingCategory,
  handleSave
}: Props) {
  if (!editingCategory) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingCategory({ 
      ...editingCategory, 
      name: e.target.value.trim() 
    });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditingCategory({ 
      ...editingCategory, 
      description: e.target.value 
    });
  };

  const validateAndSave = () => {
    if (!editingCategory.name.trim()) {
      alert('Введите название категории');
      return;
    }
    handleSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-[var(--color-dark)] p-6 rounded-lg w-full max-w-md mx-auto my-8 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 border-b border-[var(--color-gray)] pb-3">
          {editingCategory.id ? 'Редактировать' : 'Добавить'} категорию
        </h2>
        
        <div className="space-y-6 mb-6">
          <div>
            <label className="block mb-2 text-sm font-medium">Название</label>
            <input
              value={editingCategory.name}
              onChange={handleNameChange}
              className="w-full px-4 py-2 border rounded-lg bg-[var(--color-dark)] text-white border-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              placeholder="Например: Аминокислоты"
              maxLength={255}
            />
            <p className="mt-1 text-xs text-[var(--color-gray)]">Максимум 255 символов</p>
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium">Описание</label>
            <textarea
              value={editingCategory.description || ''}
              onChange={handleDescriptionChange}
              className="w-full px-4 py-2 border rounded-lg bg-[var(--color-dark)] text-white border-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              rows={4}
              placeholder="Описание категории (необязательно)"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4 border-t border-[var(--color-gray)]">
          <button
            onClick={() => setEditingCategory(null)}
            type="button"
            className="px-5 py-2 bg-[var(--color-gray)] text-[var(--color-dark)] rounded-lg hover:opacity-90 transition-opacity"
          >
            Отмена
          </button>
          <button
            onClick={validateAndSave}
            type="button"
            className="px-5 py-2 bg-[var(--color-accent)] text-[var(--color-dark)] rounded-lg hover:opacity-90 transition-opacity"
          >
            {editingCategory.id ? 'Сохранить изменения' : 'Добавить категорию'}
          </button>
        </div>
      </div>
    </div>
  );
}