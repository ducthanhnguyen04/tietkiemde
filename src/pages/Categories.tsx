import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Plus, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import type { Category } from '../types';

const COLOR_PRESETS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Yellow
  '#10B981', // Emerald
  '#14B8A6', // Teal
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#E11D48', // Rose
  '#06B6D4', // Cyan
  '#64748B', // Slate
];

const EMOJI_PRESETS = [
  '🍔', '🚗', '🛍️', '📚', '🎮', '🏠', '💊', '💵', '📈', '☕',
  '🍕', '🚇', '👕', '✏️', '🍿', '🔌', '🧴', '💰', '💸', '🍷',
  '✈️', '🎭', '🏋️', '🐱', '🐶', '🎁', '💈', '🔨', '💡', '🧹'
];

export const Categories: React.FC = () => {
  const { categories, addCategory, editCategory, deleteCategory, isLoading } = useFinanceStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🍔');
  const [selectedColor, setSelectedColor] = useState('#F97316');
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setSelectedIcon('🍔');
    setSelectedColor('#F97316');
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSelectedIcon(cat.icon);
    setSelectedColor(cat.color);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên danh mục.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (editingCategory) {
        await editCategory(editingCategory.id, {
          name: name.trim(),
          icon: selectedIcon,
          color: selectedColor,
        });
      } else {
        await addCategory({
          name: name.trim(),
          icon: selectedIcon,
          color: selectedColor,
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu danh mục. Có thể tên danh mục bị trùng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    const message = `Bạn có chắc chắn muốn xóa danh mục "${cat.name}" không?\nLưu ý: Tất cả ngân sách liên quan sẽ bị xóa. Các giao dịch thuộc danh mục này sẽ chuyển về trạng thái "Chưa phân loại".`;
    if (window.confirm(message)) {
      try {
        await deleteCategory(cat.id);
      } catch (err: any) {
        console.error('Lỗi khi xóa danh mục:', err);
        alert(err.message || 'Lỗi xảy ra khi xóa danh mục.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white">Danh mục chi tiêu</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Phân loại chi tiêu và nguồn thu để kiểm soát tài chính tối ưu
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm rounded-xl transition-all shadow-sm shadow-indigo-600/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Thêm danh mục
        </button>
      </div>

      {/* CATEGORIES CARD GRID */}
      {isLoading && categories.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm font-semibold text-slate-400 animate-pulse">Đang tải danh mục...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
            >
              {/* Category card background gradient line */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: cat.color }}
              />

              <div className="flex items-start justify-between mt-2">
                <div className="flex items-center gap-3.5">
                  <div
                    className="h-12 w-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                    style={{
                      backgroundColor: `${cat.color}15`,
                      border: `1px solid ${cat.color}30`
                    }}
                  >
                    {cat.icon || '❓'}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[130px]">
                      {cat.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wide font-medium">
                      {cat.color}
                    </p>
                  </div>
                </div>

                {/* Card actions */}
                <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    title="Xóa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==========================================
          ADD/EDIT CATEGORY DIALOG MODAL
      ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-xl relative my-auto">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Title */}
            <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-1.5">
              {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Tạo danh mục mang phong cách cá nhân với biểu tượng và màu sắc tùy chọn
            </p>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-xl text-rose-600 dark:text-rose-400 text-xs mb-4">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Category Name */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Tên danh mục
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Ăn vặt, Xăng dầu..."
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Icon Selector grid */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Biểu tượng ({selectedIcon})
                </label>
                <div className="grid grid-cols-6 gap-2 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-h-36 overflow-y-auto scrollbar-none">
                  {EMOJI_PRESETS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedIcon(emoji)}
                      className={`text-2xl p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer ${
                        selectedIcon === emoji ? 'bg-indigo-100 dark:bg-indigo-950 border border-indigo-500' : ''
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Swatch selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Bảng màu sắc
                </label>
                <div className="flex flex-wrap gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className="w-7 h-7 rounded-lg transition-all cursor-pointer relative flex items-center justify-center text-white"
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === color && (
                        <span className="w-1.5 h-1.5 bg-white rounded-full shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white font-semibold text-xs rounded-xl cursor-pointer"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu danh mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
