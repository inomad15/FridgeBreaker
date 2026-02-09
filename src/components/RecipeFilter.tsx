
import React from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';
import { CATEGORY_LABELS } from '../constants';

interface RecipeFilterProps {
    searchTerm: string;
    onSearchChange: (val: string) => void;
    selectedCategory: string; // The selected category e.g. "Main Dish (Meat)" or "All"
    onCategoryChange: (val: string) => void;
    onReset: () => void;
}

const RecipeFilter: React.FC<RecipeFilterProps> = ({
    searchTerm,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    onReset
}) => {
    // Hardcoded category options based on external_recipes.json structure
    const categories = [
        { value: 'All', label: '전체 보기' },
        { value: 'Main Dish (Meat)', label: '🥩 메인요리 (고기)' },
        { value: 'Main Dish', label: '🍳 메인요리 (기타)' },
        { value: 'Soup/Stew', label: '🍲 국/찌개/전골' },
        { value: 'Rice/Porridge', label: '🍚 밥/죽' },
        { value: 'Side Dish', label: '🥗 밑반찬 (나물/볶음)' },
        { value: 'Side Dish (Pickled)', label: '🥬 장아찌/젓갈' },
        { value: 'Kimchi', label: '🌶️ 김치/깍두기' },
        { value: 'Dessert', label: '🍰 디저트/간식' },
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6 sticky top-16 z-20 md:static">
            <div className="flex flex-col md:flex-row gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Search className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="레시피 이름으로 검색... (예: 김치찌개)"
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                {/* Category Dropdown */}
                <div className="flex items-center gap-2">
                    <div className="relative min-w-[160px] flex-1 md:flex-none">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <Filter className="w-4 h-4 text-slate-400" />
                        </div>
                        <select
                            className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm appearance-none focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                            value={selectedCategory}
                            onChange={(e) => onCategoryChange(e.target.value)}
                        >
                            {categories.map((cat) => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>

                    {(searchTerm || selectedCategory !== 'All') && (
                        <button
                            onClick={onReset}
                            className="p-2.5 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-slate-200 bg-white"
                            title="필터 초기화"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecipeFilter;
