// app/admin/packings/components/FormTypeTable.tsx
'use client';
import { FormType } from '@/app/admin/packings/types';
import React from 'react';

interface Props {
  formTypes: FormType[];
  setEditingFormType: React.Dispatch<React.SetStateAction<FormType | null>>;
  handleDeleteFormType: (id: number) => void;
}

export default function FormTypeTable({ 
  formTypes, 
  setEditingFormType, 
  handleDeleteFormType 
}: Props) {
  return (
    <div className="mb-12 mt-12 overflow-x-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Типы форм</h2>
        <button
          onClick={() => setEditingFormType({ id: 0, name: '' })}
          className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-dark)] rounded-lg hover:opacity-90 transition-opacity"
        >
          Добавить тип формы
        </button>
      </div>
      <div className="bg-[var(--color-dark)] rounded-lg overflow-hidden shadow-md">
        <table className="min-w-full divide-y divide-[var(--color-gray)]">
          <thead className="bg-[var(--color-gray)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Название</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-gray)]">
            {formTypes.map((formType) => (
              <tr key={formType.id} className="hover:bg-[var(--color-gray)] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">{formType.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{formType.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                  <button
                    onClick={() => setEditingFormType(formType)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => handleDeleteFormType(formType.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
            {formTypes.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-[var(--color-gray)]">
                  <p className="text-lg mb-2">Типы форм не найдены</p>
                  <p className="text-sm">Добавьте первый тип формы, чтобы начать работу</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}