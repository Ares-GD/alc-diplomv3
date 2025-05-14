// app/admin/packings/components/UnitTable.tsx
'use client';
import { Unit } from '@/app/admin/packings/types';
import React from 'react';

interface Props {
  units: Unit[];
  setEditingUnit: React.Dispatch<React.SetStateAction<Unit | null>>;
  handleDeleteUnit: (id: number) => void;
}

export default function UnitTable({ units, setEditingUnit, handleDeleteUnit }: Props) {
  return (
    <div className="mb-12 mt-12 overflow-x-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center">Единицы измерения</h2>
        <button
          onClick={() => setEditingUnit({ id: 0, name: '' })}
          className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-dark)] rounded-lg hover:opacity-90 transition-opacity"
        >
          Добавить единицу
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
            {units.map((unit) => (
              <tr key={unit.id} className="hover:bg-[var(--color-gray)] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">{unit.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{unit.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                  <button
                    onClick={() => setEditingUnit(unit)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => handleDeleteUnit(unit.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
            {units.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-[var(--color-gray)]">
                  <p className="text-lg mb-2">Единицы измерения не найдены</p>
                  <p className="text-sm">Добавьте первую единицу, чтобы начать работу</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}