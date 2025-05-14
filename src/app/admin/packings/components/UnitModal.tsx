// app/admin/packings/components/UnitModal.tsx
'use client';
import { Unit } from '@/app/admin/packings/types';
import React from 'react';

interface Props {
  editingUnit: Unit | null;
  setEditingUnit: React.Dispatch<React.SetStateAction<Unit | null>>;
  handleSaveUnit: () => void;
}

export default function UnitModal({ editingUnit, setEditingUnit, handleSaveUnit }: Props) {
  if (!editingUnit) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingUnit({ ...editingUnit, name: e.target.value.trim() });
  };

  const handleSave = () => {
    if (!editingUnit.name.trim()) {
      alert('Введите название единицы измерения');
      return;
    }
    handleSaveUnit();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-[var(--color-dark)] p-6 rounded-lg w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 border-b border-[var(--color-gray)] pb-3">
          {editingUnit.id ? 'Редактировать' : 'Добавить'} единицу измерения
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Название</label>
            <input
              value={editingUnit.name}
              onChange={handleNameChange}
              className="w-full px-4 py-2 border rounded-lg bg-[var(--color-dark)] text-white border-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              placeholder="Например: Литр"
              maxLength={255}
            />
            <p className="mt-1 text-xs text-[var(--color-gray)]">Максимум 255 символов</p>
          </div>
        </div>
        <div className="mt-8 flex justify-end space-x-4 pt-4 border-t border-[var(--color-gray)]">
          <button
            onClick={() => setEditingUnit(null)}
            className="px-5 py-2 bg-[var(--color-gray)] text-[var(--color-dark)] rounded-lg hover:opacity-90 transition-opacity"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-[var(--color-accent)] text-[var(--color-dark)] rounded-lg hover:opacity-90 transition-opacity"
          >
            {editingUnit.id ? 'Сохранить изменения' : 'Добавить единицу'}
          </button>
        </div>
      </div>
    </div>
  );
}