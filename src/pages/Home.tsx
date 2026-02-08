import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChefHat, Filter, Info, Check, X, ArrowRight, ShoppingCart, Carrot, Fish, Wheat, Milk, Utensils, Beef, Sparkles, Loader2 } from 'lucide-react';
import { generateRecipe } from '../services/aiChef';
import { useNavigate } from 'react-router-dom';
import { INGREDIENTS, RECIPES, CATEGORY_LABELS } from '../constants';
import { Ingredient, Recipe, MatchResult, IngredientCategory } from '../types';

// --- Helper Components ---

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    veggie: <Carrot className="w-5 h-5" />,
    meat: <Beef className="w-5 h-5" />,
    seafood: <Fish className="w-5 h-5" />,
    grain: <Wheat className="w-5 h-5" />,
    dairy: <Milk className="w-5 h-5" />,
    seasoning: <Utensils className="w-5 h-5" />,
};

interface CategoryTabsProps {
    categories: string[];
    activeCategory: string;
    onSelect: (category: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ categories, activeCategory, onSelect }) => {
    return (
        <div className="flex overflow-x-auto pb-4 mb-4 gap-2 no-scrollbar">
            <button
                onClick={() => onSelect('all')}
                className={`
          flex items-center px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all
          ${activeCategory === 'all'
                        ? 'bg-orange-600 text-white shadow-md shadow-orange-200'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}
        `}
            >
                전체 보기
            </button>
            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => onSelect(cat)}
                    className={`
            flex items-center px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all gap-2
            ${activeCategory === cat
                            ? 'bg-orange-600 text-white shadow-md shadow-orange-200'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}
          `}
                >
                    {CATEGORY_ICONS[cat]}
                    {CATEGORY_LABELS[cat].split(' ')[1]}
                </button>
            ))}
        </div>
    );
};

interface IngredientGridProps {
    ingredients: Ingredient[];
    selectedIds: Set<string>;
    onToggle: (id: string) => void;
    onAddCustom?: (name: string) => void;
}

const IngredientGrid: React.FC<IngredientGridProps> = ({ ingredients, selectedIds, onToggle, onAddCustom }) => {
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false); // NEW: Track focus state
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            // Prevent duplicate submission during IME composition (Korean)
            if (e.nativeEvent.isComposing) return;

            onAddCustom?.(inputValue.trim());
            setInputValue('');
        }
    };

    const handleCardClick = () => {
        inputRef.current?.focus();
    };

    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {ingredients.map((ing) => {
                const isSelected = selectedIds.has(ing.id);
                return (
                    <button
                        key={ing.id}
                        onClick={() => onToggle(ing.id)}
                        className={`
              relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 text-center h-24
              ${isSelected
                                ? 'bg-orange-50 border-orange-500 shadow-sm ring-1 ring-orange-200'
                                : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50'}
            `}
                    >
                        {isSelected && (
                            <div className="absolute top-2 right-2 bg-orange-500 rounded-full p-0.5">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </div>
                        )}
                        <span className="text-2xl mb-1 flex items-center justify-center h-8 w-8">
                            {ing.imageUrl ? (
                                <img src={ing.imageUrl} alt={ing.name} className="w-full h-full object-contain" />
                            ) : (
                                ing.emoji || (ing.category === 'veggie' ? '🥬' :
                                    ing.category === 'meat' ? '🥩' :
                                        ing.category === 'seafood' ? '🐟' :
                                            ing.category === 'grain' ? '🍚' :
                                                ing.category === 'seasoning' ? '🧂' : '🧀')
                            )}
                        </span>
                        <span className={`text-xs font-bold ${isSelected ? 'text-orange-900' : 'text-slate-600'}`}>
                            {ing.name}
                        </span>
                    </button>
                );
            })}

            {/* Custom Input Card */}
            {onAddCustom && (
                <div
                    onClick={handleCardClick}
                    className={`
                        relative flex flex-col items-center justify-center p-3 rounded-xl border border-dashed transition-all duration-200 h-24 group cursor-text
                        ${isFocused || inputValue
                            ? 'bg-white border-orange-400 ring-2 ring-orange-100'
                            : 'bg-slate-50 border-slate-300 hover:bg-white hover:border-orange-300'}
                    `}
                >
                    {/* Placeholder / Icon (Hidden when focused or has value) */}
                    {!(isFocused || inputValue) && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <div className="mb-2 w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-orange-400 group-hover:text-orange-500 transition-colors">
                                <span className="text-xl font-bold text-slate-400 group-hover:text-orange-500">+</span>
                            </div>
                            <span className="text-xs font-bold text-slate-400 group-hover:text-orange-500">직접 입력</span>
                        </div>
                    )}

                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className={`
                            w-full text-center font-bold bg-transparent border-none focus:ring-0 p-0 outline-none
                            ${isFocused || inputValue ? 'text-sm text-slate-800 placeholder:text-transparent' : 'opacity-0'}
                        `}
                    />
                </div>
            )}
        </div>
    );
};

interface RecipeCardProps {
    result: MatchResult;
    allIngredients: Map<string, Ingredient>;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ result, allIngredients }) => {
    const { recipe, matchPercentage, missingIngredients } = result;
    const navigate = useNavigate();

    // Color coding based on match percentage
    const matchColor =
        matchPercentage === 100 ? 'text-green-600 bg-green-50 border-green-200' :
            matchPercentage >= 70 ? 'text-blue-600 bg-blue-50 border-blue-200' :
                'text-orange-600 bg-orange-50 border-orange-200';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
            <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => navigate(`/recipe/${recipe.id}`)}>
                <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold border shadow-sm ${matchColor}`}>
                        {Math.round(matchPercentage)}% 일치
                    </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <div className="text-white text-xs font-medium flex items-center gap-2">
                        <span>⏱️ {recipe.cookingTimeMinutes}분</span>
                        <span>•</span>
                        <span>{recipe.difficulty === 'Easy' ? '쉬움' : recipe.difficulty === 'Medium' ? '보통' : '어려움'}</span>
                    </div>
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 mb-1 cursor-pointer hover:text-orange-600 transition-colors" onClick={() => navigate(`/recipe/${recipe.id}`)}>{recipe.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">{recipe.description}</p>

                <div className="mt-auto">
                    {missingIngredients.length > 0 ? (
                        <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase flex items-center">
                                <ShoppingCart className="w-3 h-3 mr-1" />
                                부족한 재료 ({missingIngredients.length})
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {missingIngredients.map(id => {
                                    const name = allIngredients.get(id)?.name || id;
                                    return (
                                        <span key={id} onClick={() => window.open(`https://www.coupang.com/np/search?q=${name}`, '_blank')} className="cursor-pointer hover:bg-red-50 transition-colors text-xs px-2 py-1 bg-white border border-slate-200 rounded text-red-500 font-medium flex items-center gap-1 group/ing">
                                            {name}
                                            <ShoppingCart className="w-2.5 h-2.5 opacity-0 group-hover/ing:opacity-100 transition-opacity" />
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-green-50 rounded-lg p-3 flex items-center text-green-700 text-sm font-medium">
                            <Check className="w-4 h-4 mr-2" />
                            모든 재료가 준비되었습니다!
                        </div>
                    )}

                    <button
                        onClick={() => navigate(`/recipe/${recipe.id}`)}
                        className="w-full mt-4 bg-slate-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center group"
                    >
                        레시피 보기
                        <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Application ---

export default function Home() {
    const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
    const [customIngredients, setCustomIngredients] = useState<Ingredient[]>([]); // NEW: Custom ingredients
    const [activeCategory, setActiveCategory] = useState<string>('all'); // NEW: Tab state
    const [hasEssentials, setHasEssentials] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showMobileResults, setShowMobileResults] = useState(false);

    // AI Chef State
    const [aiRecipe, setAiRecipe] = useState<Recipe | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const handleAiGeneration = async () => {
        if (selectedIngredients.size === 0) {
            alert("재료를 적어도 하나 선택해주세요!");
            return;
        }
        setIsAiLoading(true);
        setAiRecipe(null); // Clear previous

        // Convert IDs to names for better AI context
        const ingredientsList = Array.from(selectedIngredients).map(id => {
            const ing = INGREDIENTS.find(i => i.id === id);
            return ing ? ing.name : id;
        }) as string[];

        const recipe = await generateRecipe(ingredientsList);
        if (recipe) {
            setAiRecipe(recipe);
        }
        setIsAiLoading(false);
    };

    // Helper: Add Custom Ingredient
    const handleAddCustomIngredient = (name: string, category: string) => {
        const newId = `custom-${Date.now()}`;
        const newIngredient: Ingredient = {
            id: newId,
            name: name,
            category: category as IngredientCategory,
            emoji: '✨', // Default emoji for custom items
            isCustom: true
        };

        setCustomIngredients(prev => [...prev, newIngredient]);
        setSelectedIngredients(prev => new Set([...prev, newId]));
    };

    // Derived state: Combine static and custom ingredients
    const allIngredientsList = useMemo(() => {
        return [...INGREDIENTS, ...customIngredients];
    }, [customIngredients]);

    // Derived state: Map for easy lookup
    const ingredientMap = useMemo(() => {
        const map = new Map<string, Ingredient>();
        allIngredientsList.forEach(ing => map.set(ing.id, ing));
        return map;
    }, [allIngredientsList]);

    // Filter Logic: Search ingredients
    const filteredIngredients = useMemo(() => {
        return allIngredientsList.filter(ing =>
            ing.name.includes(searchTerm) ||
            (CATEGORY_LABELS[ing.category] && CATEGORY_LABELS[ing.category].includes(searchTerm))
        );
    }, [searchTerm, allIngredientsList]);

    // Group ingredients by category
    const ingredientsByCategory = useMemo(() => {
        const groups: Record<string, Ingredient[]> = {};
        const categories: IngredientCategory[] = ['veggie', 'meat', 'seafood', 'grain', 'seasoning', 'dairy'];

        // Initialize order
        categories.forEach(c => groups[c] = []);

        filteredIngredients.forEach(ing => {
            // If Essentials are auto-selected, hide them from the manual list to reduce clutter, 
            // UNLESS user searches for them specifically.
            if (hasEssentials && ing.isEssential && searchTerm === '') return;

            if (!groups[ing.category]) groups[ing.category] = [];
            groups[ing.category].push(ing);
        });

        return groups;
    }, [filteredIngredients, hasEssentials, searchTerm]);

    // Logic: Match Recipes
    const matchedRecipes = useMemo(() => {
        const results: MatchResult[] = [];

        // Effective owned ingredients = selected + (optional) essentials
        const effectiveOwned = new Set(selectedIngredients);
        if (hasEssentials) {
            INGREDIENTS.filter(i => i.isEssential).forEach(i => effectiveOwned.add(i.id));
        }

        RECIPES.forEach(recipe => {
            let matchCount = 0;
            let totalRequired = 0;
            // logic improvement variables
            let nonEssentialMatchCount = 0;
            let nonEssentialTotalCount = 0;
            const owned: string[] = [];
            const missing: string[] = [];

            recipe.ingredients.forEach(ri => {
                const ingDef = ingredientMap.get(ri.id);
                // Check if this ingredient is essential (like sugar, salt)
                const isEssential = ingDef?.isEssential || false;

                if (effectiveOwned.has(ri.id)) {
                    matchCount++;
                    owned.push(ri.id);
                    // Count match for non-essential ingredients (e.g. Meat, Veggie)
                    if (!isEssential) {
                        nonEssentialMatchCount++;
                    }
                } else {
                    missing.push(ri.id);
                }

                if (!isEssential) {
                    nonEssentialTotalCount++;
                }
                totalRequired++;
            });

            // LOGIC IMPROVEMENT:
            // If a recipe requires non-essential ingredients (which most do),
            // but the user matches NONE of them (only has salt/sugar/etc.),
            // then this recipe is likely irrelevant.
            // Exception: If the recipe ONLY has essential ingredients (rare), then it's fine.
            if (nonEssentialTotalCount > 0 && nonEssentialMatchCount === 0) {
                return; // Skip this recipe
            }

            // REFINED LOGIC (User Request): 
            // Exclude basic seasonings (essentials) from the match percentage calculation.
            // Only non-essential ingredients determine the "match score".
            let percentage = 0;
            if (nonEssentialTotalCount > 0) {
                percentage = (nonEssentialMatchCount / nonEssentialTotalCount) * 100;
            } else if (totalRequired > 0) {
                // Fallback for recipes that might somehow ONLY have essentials (unlikely but safe)
                percentage = (matchCount / totalRequired) * 100;
            }

            // Filter out recipes where we have 0 matches (unless searching specifically)
            if (percentage > 0) {
                results.push({
                    recipe,
                    matchPercentage: percentage,
                    missingCount: missing.length,
                    ownedIngredients: owned,
                    missingIngredients: missing
                });
            }
        });

        // Sort: 
        // 1. Most matches (Match %) Descending
        // 2. Least missing ingredients Ascending
        return results.sort((a, b) => {
            if (a.matchPercentage !== b.matchPercentage) return b.matchPercentage - a.matchPercentage;
            return a.missingCount - b.missingCount;
        }).slice(0, 8); // Limit to top 8 results
    }, [selectedIngredients, hasEssentials, ingredientMap]);

    const toggleIngredient = (id: string) => {
        const newSet = new Set(selectedIngredients);
        if (newSet.has(id)) {
            newSet.delete(id);
            // If it's a custom ingredient, remove it from the list entirely when deselected
            if (id.startsWith('custom-')) {
                setCustomIngredients(prev => prev.filter(ing => ing.id !== id));
            }
        } else {
            newSet.add(id);
        }
        setSelectedIngredients(newSet);
    };

    const resetSelection = () => {
        setSelectedIngredients(new Set());
        setSearchTerm('');
    };

    const handleMobileViewResults = () => {
        setShowMobileResults(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen flex flex-col pb-20 md:pb-0">

            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
                        <div className="bg-orange-500 p-1.5 rounded-lg">
                            <ChefHat className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                            <span className="text-orange-600">냉</span>장고 <span className="text-orange-600">털</span>기
                        </h1>
                    </div>

                    {/* Desktop Search */}
                    <div className="hidden md:flex items-center gap-4 flex-1 justify-end max-w-md">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="재료 검색 (예: 돼지고기, 김치)"
                                className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="md:hidden">
                        {/* Mobile Filter Toggle? Maybe later */}
                    </div>
                </div>

                {/* Mobile Search Bar (Below Header) */}
                <div className="md:hidden px-4 py-2 bg-white border-b border-slate-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="재료 검색..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-lg text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8 flex flex-col md:flex-row gap-8">

                {/* Left Column: Ingredient Selection */}
                <section className={`
          flex-1 md:max-w-md lg:max-w-lg flex flex-col 
          ${showMobileResults ? 'hidden md:flex' : 'flex'}
        `}>

                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6 flex items-start sm:items-center gap-4 shadow-sm">
                        <div className="flex-1">
                            <h3 className="font-bold text-orange-900 text-base mb-1">🏡 기본 양념은 있어요!</h3>
                            <p className="text-xs text-orange-700 leading-relaxed">
                                <span className="font-semibold">간장, 고추장, 설탕, 소금, 다진마늘</span> 등 기본적인 양념은 집에 있다고 가정하고 레시피를 찾습니다.
                            </p>
                        </div>
                        <div
                            className={`relative w-12 h-6 rounded-full cursor-pointer transition-colors duration-300 ${hasEssentials ? 'bg-orange-500' : 'bg-slate-300'}`}
                            onClick={() => setHasEssentials(!hasEssentials)}
                        >
                            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${hasEssentials ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            재료 선택하기
                        </h2>
                        {selectedIngredients.size > 0 && (
                            <button
                                onClick={resetSelection}
                                className="text-xs font-semibold text-slate-500 hover:text-red-500 flex items-center transition-colors"
                            >
                                <X className="w-3 h-3 mr-1" /> 선택 초기화 ({selectedIngredients.size})
                            </button>
                        )}
                    </div>

                    {/* New Category Tabs */}
                    <CategoryTabs
                        categories={Object.keys(ingredientsByCategory)}
                        activeCategory={activeCategory}
                        onSelect={setActiveCategory}
                    />

                    <div className="space-y-6">
                        {/* Popular Ingredients Section (Only on 'All' tab and no search) */}
                        {activeCategory === 'all' && searchTerm === '' && (
                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-2 px-1 flex items-center gap-1">
                                    <span className="text-lg">🏆</span> 자주 찾는 인기 재료
                                </h3>
                                <IngredientGrid
                                    ingredients={INGREDIENTS.filter(i => i.isPopular && !selectedIngredients.has(i.id))}
                                    selectedIds={selectedIngredients}
                                    onToggle={toggleIngredient}
                                />
                            </div>
                        )}

                        {activeCategory === 'all' ? (
                            Object.entries(ingredientsByCategory).map(([category, items]) => (
                                <div key={category}>
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
                                        {CATEGORY_LABELS[category]}
                                    </h3>
                                    <IngredientGrid
                                        ingredients={items}
                                        selectedIds={selectedIngredients}
                                        onToggle={toggleIngredient}
                                        onAddCustom={(name) => handleAddCustomIngredient(name, category)}
                                    />
                                </div>
                            ))
                        ) : (
                            <IngredientGrid
                                ingredients={ingredientsByCategory[activeCategory] || []}
                                selectedIds={selectedIngredients}
                                onToggle={toggleIngredient}
                                onAddCustom={(name) => handleAddCustomIngredient(name, activeCategory)}
                            />
                        )}

                        {/* Empty State for Search */}
                        {filteredIngredients.length === 0 && (
                            <div className="text-center py-10 text-slate-400">
                                <p>검색된 재료가 없습니다.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Right Column: Recipe Results */}
                <section className={`
          flex-1 flex flex-col
          ${(!showMobileResults) ? 'hidden md:flex' : 'flex'}
        `}>
                    <div className="flex items-center justify-between mb-6 sticky top-16 md:top-0 bg-[#f8fafc] z-10 py-2">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">추천 레시피</h2>
                            <p className="text-sm text-slate-500">
                                {matchedRecipes.length > 0
                                    ? `${matchedRecipes.length}개의 맛있는 요리를 발견했어요!`
                                    : '재료를 선택하면 레시피가 나타납니다.'}
                            </p>
                        </div>
                        {showMobileResults && (
                            <button
                                onClick={() => setShowMobileResults(false)}
                                className="md:hidden text-sm font-medium text-slate-600 bg-white border px-3 py-1.5 rounded-lg shadow-sm"
                            >
                                재료 다시 선택
                            </button>
                        )}
                    </div>

                    {/* AI Chef Banner */}
                    <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl p-4 mb-6 text-white shadow-lg flex items-center justify-between relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 bg-white/10 w-24 h-24 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg flex items-center gap-2 mb-1">
                                <Sparkles className="w-5 h-5 text-yellow-300" />
                                AI 셰프의 특별한 제안
                            </h3>
                            <p className="text-indigo-100 text-xs md:text-sm opacity-90 font-medium">
                                선택한 재료로 새로운 레시피를 창조해드려요!
                            </p>
                        </div>
                        <button
                            onClick={handleAiGeneration}
                            disabled={isAiLoading || selectedIngredients.size === 0}
                            className={`
                                relative z-10 px-4 py-2.5 bg-white text-indigo-700 rounded-lg font-bold text-sm transition-all shadow-md flex items-center gap-2
                                ${isAiLoading ? 'opacity-90 cursor-not-allowed' : 'hover:bg-indigo-50 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'}
                                ${selectedIngredients.size === 0 ? 'opacity-50 bg-slate-200 text-slate-500' : ''}
                            `}
                        >
                            {isAiLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>요리 중...</span>
                                </>
                            ) : (
                                <>
                                    <span>생성하기</span>
                                    <Sparkles className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>

                    {/* AI Recipe Result */}
                    {aiRecipe && (
                        <div className="mb-8 animate-fade-in-up">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <div className="flex items-center gap-2">
                                    <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-sm flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> AI Generated
                                    </span>
                                    <span className="text-slate-400 text-xs">방금 생성된 따끈한 레시피</span>
                                </div>
                                <button onClick={() => setAiRecipe(null)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <RecipeCard
                                result={{
                                    recipe: aiRecipe,
                                    matchPercentage: 100,
                                    missingCount: 0,
                                    ownedIngredients: Array.from(selectedIngredients),
                                    missingIngredients: []
                                }}
                                allIngredients={ingredientMap}
                            />
                            <div className="my-6 border-b border-slate-100"></div>
                        </div>
                    )}

                    {matchedRecipes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                            {matchedRecipes.map((result) => (
                                <RecipeCard key={result.recipe.id} result={result} allIngredients={ingredientMap} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                            <div className="bg-slate-50 p-4 rounded-full mb-4">
                                <ChefHat className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-700 mb-2">가능한 요리가 없어요</h3>
                            <p className="text-slate-500 max-w-xs text-sm">
                                왼쪽에서 재료를 더 선택해보세요. <br />
                                김치, 계란, 참치 같은 기본 재료를 추가하면 찾기 쉬워요!
                            </p>
                        </div>
                    )}
                </section>
            </main>

            {/* Mobile Sticky Footer: Call to Action */}
            {!showMobileResults && selectedIngredients.size > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:hidden z-50">
                    <button
                        onClick={handleMobileViewResults}
                        className="w-full bg-orange-600 text-white font-bold text-lg py-3.5 rounded-xl shadow-orange-200 shadow-lg flex items-center justify-center animate-pulse-slight"
                    >
                        {matchedRecipes.length}개 레시피 보기
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                </div>
            )}
        </div>
    );
}
