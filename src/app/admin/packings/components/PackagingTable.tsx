// app/admin/packings/components/PackagingTable.tsx
'use client';
import { Packaging } from '@/app/admin/packings/types';
import Image from 'next/image';
import React from 'react';

interface Props {
  packagings: Packaging[];
  handleDelete: (id: number) => void;
  setEditingPacking: React.Dispatch<React.SetStateAction<Packaging | null>>;
  setImagePreview: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function PackagingTable({ 
  packagings, 
  handleDelete, 
  setEditingPacking, 
  setImagePreview 
}: Props) {
  return (
    <div className="mb-12 mt-6 overflow-x-auto">      
      <div className="bg-[var(--color-dark)] rounded-lg overflow-hidden shadow-md">
        <table className="min-w-full divide-y divide-[var(--color-gray)]">
          <thead className="bg-[var(--color-gray)]">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Название</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Материал</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Объем</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Единица</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Тип формы</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Изображение</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-gray)]">
            {packagings.map((packing) => (
              <tr 
                key={packing.id} 
                className="hover:bg-[var(--color-gray)] transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">{packing.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{packing.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{packing.material_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{packing.volume}</td>
                <td className="px-6 py-4 whitespace-nowrap">{packing.unit_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{packing.form_type_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {packing.image && (
                    <Image
                      src={`/${packing.image}`}
                      alt={packing.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                  <button
                    onClick={() => {
                      setEditingPacking(packing);
                      if (packing.image) setImagePreview(packing.image);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => handleDelete(packing.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
            {packagings.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-[var(--color-gray)]">
                  <p className="text-lg mb-2">Упаковки не найдены</p>
                  <p className="text-sm">Добавьте первую упаковку, чтобы начать работу</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}