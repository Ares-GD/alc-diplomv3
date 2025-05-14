// app/admin/packings/components/PackagingModal.tsx
'use client';
import { Packaging, Material, Unit, FormType } from '@/app/admin/packings/types';
import React from 'react';

interface Props {
  editingPacking: Packaging | null;
  materials: Material[];
  units: Unit[];
  formTypes: FormType[];
  imagePreview: string | null;
  handleMaterialChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleUnitChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleFormTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => void;
  handleButtonClick: () => void;
  handleSave: () => void;
  setEditingPacking: React.Dispatch<React.SetStateAction<Packaging | null>>;
  setImagePreview: React.Dispatch<React.SetStateAction<string | null>>;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export default function PackagingModal({
  editingPacking,
  materials,
  units,
  formTypes,
  imagePreview,
  handleMaterialChange,
  handleUnitChange,
  handleFormTypeChange,
  handleImageUpload,
  handleButtonClick,
  handleSave,
  setEditingPacking,
  setImagePreview,
  fileInputRef
}: Props) {
  if (!editingPacking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-[var(--color-dark)] p-8 rounded-lg w-full max-w-2xl mx-auto my-8">
        <h2 className="text-2xl font-bold mb-6 border-b border-[var(--color-gray)] pb-3">
          {editingPacking.id ? 'Редактировать' : 'Добавить'} упаковку
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Левая колонка */}
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Название</label>
              <input 
                value={editingPacking.name} 
                onChange={(e) => setEditingPacking({...editingPacking, name: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg bg-[var(--color-dark)] text-white border-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                placeholder="Введите название упаковки"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Материал</label>
              <select 
                value={editingPacking.material_id || ''}
                onChange={handleMaterialChange}
                className="w-full px-4 py-2 border rounded-lg bg-[var(--color-dark)] text-white border-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              >
                <option value="">Не выбрано</option>
                {materials.map(mat => (
                  <option key={mat.id} value={mat.id}>{mat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Объем</label>
              <input 
                type="number"
                step="0.01"
                min="0"
                value={editingPacking.volume}
                onChange={(e) => setEditingPacking({...editingPacking, volume: parseFloat(e.target.value)})}
                className="w-full px-4 py-2 border rounded-lg bg-[var(--color-dark)] text-white border-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                placeholder="0.00"
              />
            </div>
          </div>
          {/* Правая колонка */}
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Единица измерения</label>
              <select 
                value={editingPacking.unit_id || ''}
                onChange={handleUnitChange}
                className="w-full px-4 py-2 border rounded-lg bg-[var(--color-dark)] text-white border-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              >
                <option value="">Не выбрано</option>
                {units.map(unit => (
                  <option key={unit.id} value={unit.id}>{unit.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Тип формы</label>
              <select 
                value={editingPacking.form_type_id || ''}
                onChange={handleFormTypeChange}
                className="w-full px-4 py-2 border rounded-lg bg-[var(--color-dark)] text-white border-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              >
                <option value="">Не выбрано</option>
                {formTypes.map(formType => (
                  <option key={formType.id} value={formType.id}>{formType.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Изображение</label>
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleImageUpload}
                className="border-2 border-dashed border-[var(--color-gray)] p-4 rounded-lg text-center cursor-pointer hover:bg-[var(--color-dark)] relative transition-colors duration-200"
              >
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Превью" 
                    className="max-w-full h-auto mb-2 mx-auto rounded"
                  />
                ) : (
                  <p className="text-sm text-[var(--color-gray)]">Перетащите изображение или нажмите для выбора</p>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  ref={fileInputRef}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <button
                  onClick={handleButtonClick}
                  className="mt-3 px-4 py-2 bg-[var(--color-accent)] text-[var(--color-dark)] rounded-lg hover:opacity-90 transition-opacity text-sm"
                >
                  Выбрать файл
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-4 pt-4 border-t border-[var(--color-gray)]">
          <button
            onClick={() => {
              setEditingPacking(null);
              setImagePreview(null);
            }}
            className="px-6 py-2 bg-[var(--color-gray)] text-[var(--color-dark)] rounded-lg hover:opacity-90 transition-opacity"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[var(--color-accent)] text-[var(--color-dark)] rounded-lg hover:opacity-90 transition-opacity"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}