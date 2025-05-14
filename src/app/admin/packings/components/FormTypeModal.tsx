// app/admin/packings/components/FormTypeModal.tsx
'use client';
import { FormType } from '@/app/admin/packings/types';
import React from 'react';

interface Props {
  editingFormType: FormType | null;
  setEditingFormType: React.Dispatch<React.SetStateAction<FormType | null>>;
  handleSaveFormType: () => void;
}

export default function FormTypeModal({ 
  editingFormType, 
  setEditingFormType, 
  handleSaveFormType 
}: Props) {
  if (!editingFormType) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingFormType({ ...editingFormType, name: e.target.value.trim() });
  };

  const handleSave = () => {
    if (!editingFormType.name.trim()) {
      alert('Введите название типа формы');
      return;
    }
    handleSaveFormType();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-[var(--color-dark)] p-6 rounded-lg w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 border-b border-[var(--color-gray)] pb-3">
          {editingFormType.id ? 'Редактировать' : 'Добавить'} тип формы
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Название</label>
            <input
              value={editingFormType.name}
              onChange={handleNameChange}
              className="w-full px-4 py-2 border rounded-lg bg-[var(--color-dark)] text-white border-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              placeholder="Введите название типа формы"
              maxLength={255}
            />
            <p className="mt-1 text-xs text-[var(--color-gray)]">Максимум 255 символов</p>
          </div>
        </div>
        <div className="mt-8 flex justify-end space-x-4 pt-4 border-t border-[var(--color-gray)]">
          <button
            onClick={() => setEditingFormType(null)}
            className="px-5 py-2 bg-[var(--color-gray)] text-[var(--color-dark)] rounded-lg hover:opacity-90 transition-opacity"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-[var(--color-accent)] text-[var(--color-dark)] rounded-lg hover:opacity-90 transition-opacity"
          >
            {editingFormType.id ? 'Сохранить изменения' : 'Добавить тип формы'}
          </button>
        </div>
      </div>
    </div>
  );
}