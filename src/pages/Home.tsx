import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChefHat, Filter, Info, Check, X, ArrowRight, ShoppingCart, Carrot, Fish, Wheat, Milk, Utensils, Beef, Sparkles, Loader2, RotateCcw } from 'lucide-react';
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
            <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => navigate(`/recipe/${recipe.id}`, { state: { recipe } })}>
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
                <h3 className="text-lg font-bold text-slate-800 mb-1 cursor-pointer hover:text-orange-600 transition-colors" onClick={() => navigate(`/recipe/${recipe.id}`, { state: { recipe } })}>{recipe.title}</h3>
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
                        onClick={() => navigate(`/recipe/${recipe.id}`, { state: { recipe } })}
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

import RecipeFilter from '../components/RecipeFilter';

export default function Home() {
    const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
    const [customIngredients, setCustomIngredients] = useState<Ingredient[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('all');

    // New Search/Filter State
    const [recipeSearchTerm, setRecipeSearchTerm] = useState('');
    const [selectedRecipeCategory, setSelectedRecipeCategory] = useState('All');

    const [hasEssentials, setHasEssentials] = useState(true);
    const [searchTerm, setSearchTerm] = useState(''); // Ingredient search term
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
    const matchedRecipes = useMemo(() => {
        const results: MatchResult[] = [];

        // Effective owned ingredients
        const effectiveOwned = new Set(selectedIngredients);
        if (hasEssentials) {
            INGREDIENTS.filter(i => i.isEssential).forEach(i => effectiveOwned.add(i.id));
        }

        RECIPES.forEach(recipe => {
            // --- FILTER LOGIC ---
            // 1. Text Search (Title or Ingredients or Description)
            if (recipeSearchTerm) {
                const term = recipeSearchTerm.toLowerCase();
                const textMatch =
                    recipe.title.toLowerCase().includes(term) ||
                    // recipe.description.toLowerCase().includes(term) || // Description might be too broad?
                    recipe.ingredients.some(i => i.id.toLowerCase().includes(term));

                if (!textMatch) return;
            }

            // 2. Category Filter
            if (selectedRecipeCategory !== 'All') {
                // Approximate matching for categories like "Main Dish (Meat)" vs "Main Dish"
                if (recipe.category !== selectedRecipeCategory) {
                    // Allow lenient matching? E.g. "Main Dish" matches "Main Dish (Meat)"?
                    // For now, strict match or "Main Dish" sub-matching
                    if (!recipe.category?.startsWith(selectedRecipeCategory)) return;
                }
            }

            let matchCount = 0;
            let totalRequired = 0;
            let nonEssentialMatchCount = 0;
            let nonEssentialTotalCount = 0;
            const owned: string[] = [];
            const missing: string[] = [];

            recipe.ingredients.forEach(ri => {
                const ingDef = ingredientMap.get(ri.id);
                const isEssential = ingDef?.isEssential || false;

                if (effectiveOwned.has(ri.id)) {
                    matchCount++;
                    owned.push(ri.id);
                    if (!isEssential) nonEssentialMatchCount++;
                } else {
                    missing.push(ri.id);
                }

                if (!isEssential) nonEssentialTotalCount++;
                totalRequired++;
            });

            if (nonEssentialTotalCount > 0 && nonEssentialMatchCount === 0) {
                // Even if filtered by name, if ingredients don't match at all, should we show it?
                // User might be searching for "Kimchi Stew" specifically even if they don't have ingredients.
                // DECISION: If user searches explicitly, show the recipe even if 0% match, 
                // BUT sort it lower.
                // However, the current logic calculates percentage and filters out 0%.
                // Let's relax the 0% filter IF a search term is present.
                if (!recipeSearchTerm) return;
            }

            let percentage = 0;
            if (nonEssentialTotalCount > 0) {
                percentage = (nonEssentialMatchCount / nonEssentialTotalCount) * 100;
            } else if (totalRequired > 0) {
                percentage = (matchCount / totalRequired) * 100;
            }

            // Filter out 0% matches unless searching
            if (percentage > 0 || recipeSearchTerm) {
                results.push({
                    recipe,
                    matchPercentage: percentage,
                    missingCount: missing.length,
                    ownedIngredients: owned,
                    missingIngredients: missing
                });
            }
        });

        return results.sort((a, b) => {
            // If searching, exact title match gets priority
            if (recipeSearchTerm) {
                const aTitle = a.recipe.title.includes(recipeSearchTerm);
                const bTitle = b.recipe.title.includes(recipeSearchTerm);
                if (aTitle && !bTitle) return -1;
                if (!aTitle && bTitle) return 1;
            }
            if (a.matchPercentage !== b.matchPercentage) return b.matchPercentage - a.matchPercentage;
            return a.missingCount - b.missingCount;
        }).slice(0, 50); // Increased limit for search results
    }, [selectedIngredients, hasEssentials, ingredientMap, recipeSearchTerm, selectedRecipeCategory]);

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
            {/* ... Header ... */}

            <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8 flex flex-col md:flex-row gap-8">
                {/* Left Column: Ingredient Selection */}
                <section className={`
                    w-full md:w-80 lg:w-96 flex-col gap-6
                    ${showMobileResults ? 'hidden md:flex' : 'flex'}
                `}>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <span className="bg-orange-100 text-orange-600 p-1.5 rounded-lg">
                                    <Carrot className="w-5 h-5" />
                                </span>
                                재료 선택
                            </h2>
                            <div className="text-sm font-medium text-slate-500">
                                <span className="text-orange-600 font-bold">{selectedIngredients.size}</span>개 선택됨
                            </div>
                        </div>

                        {/* Search Ingredients */}
                        <div className="relative mb-6">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Search className="w-4 h-4 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="재료 검색 (예: 계란, 김치)"
                                className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Essentials Toggle */}
                        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl mb-6">
                            <div className="flex items-center gap-2">
                                <div className="bg-white p-1.5 rounded-lg shadow-sm text-slate-400">
                                    <Info className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-700">기본 양념 포함</span>
                                    <span className="text-[10px] text-slate-400">소금, 설탕, 간장 등</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setHasEssentials(!hasEssentials)}
                                className={`
                                    relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500
                                    ${hasEssentials ? 'bg-orange-500' : 'bg-slate-200'}
                                `}
                            >
                                <span
                                    className={`
                                        inline-block w-4 h-4 transform bg-white rounded-full shadow transition-transform duration-200 ease-in-out mt-1 ml-1
                                        ${hasEssentials ? 'translate-x-5' : 'translate-x-0'}
                                    `}
                                />
                            </button>
                        </div>

                        {/* Category Tabs */}
                        <CategoryTabs
                            categories={['veggie', 'meat', 'seafood', 'grain', 'dairy', 'seasoning']}
                            activeCategory={activeCategory}
                            onSelect={setActiveCategory}
                        />

                        {/* Ingredient Grid */}
                        <div className="h-[calc(100vh-24rem)] overflow-y-auto pr-2 custom-scrollbar">
                            {activeCategory === 'all' ? (
                                Object.entries(ingredientsByCategory).map(([cat, ingredients]) => {
                                    if (ingredients.length === 0) return null;
                                    return (
                                        <div key={cat} className="mb-6">
                                            <h3 className="text-sm font-bold text-slate-400 mb-3 px-1 uppercase tracking-wider flex items-center gap-2">
                                                {CATEGORY_ICONS[cat]}
                                                {CATEGORY_LABELS[cat]}
                                            </h3>
                                            <IngredientGrid
                                                ingredients={ingredients}
                                                selectedIds={selectedIngredients}
                                                onToggle={toggleIngredient}
                                                onAddCustom={cat === 'veggie' || cat === 'meat' ? (name) => handleAddCustomIngredient(name, cat) : undefined}
                                            />
                                        </div>
                                    );
                                })
                            ) : (
                                <div>
                                    <h3 className="text-sm font-bold text-slate-400 mb-3 px-1 uppercase tracking-wider flex items-center gap-2">
                                        {CATEGORY_ICONS[activeCategory]}
                                        {CATEGORY_LABELS[activeCategory]}
                                    </h3>
                                    <IngredientGrid
                                        ingredients={ingredientsByCategory[activeCategory] || []}
                                        selectedIds={selectedIngredients}
                                        onToggle={toggleIngredient}
                                        onAddCustom={(name) => handleAddCustomIngredient(name, activeCategory)}
                                    />
                                </div>
                            )}

                            {/* Show message if no ingredients match search */}
                            {allIngredientsList.length > 0 &&
                                Object.values(ingredientsByCategory).flat().length === 0 && (
                                    <div className="text-center py-10 text-slate-400">
                                        <p>검색된 재료가 없습니다.</p>
                                    </div>
                                )}
                        </div>

                        {/* Selection Summary (Reset) */}
                        {selectedIngredients.size > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center animate-fade-in">
                                <span className="text-xs font-semibold text-slate-500">
                                    선택 초기화
                                </span>
                                <button
                                    onClick={resetSelection}
                                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* Right Column: Recipe Results */}
                <section className={`
                    flex-1 flex flex-col
                    ${(!showMobileResults) ? 'hidden md:flex' : 'flex'}
                `}>
                    <div className="flex flex-col gap-2 mb-6 sticky top-0 md:static bg-[#f8fafc] z-10 py-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">추천 레시피</h2>
                                <p className="text-sm text-slate-500">
                                    {matchedRecipes.length > 0
                                        ? `${matchedRecipes.length}개의 요리를 찾았습니다.`
                                        : '원하는 조건의 레시피가 없습니다.'}
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

                        {/* New Filter Component */}
                        <RecipeFilter
                            searchTerm={recipeSearchTerm}
                            onSearchChange={setRecipeSearchTerm}
                            selectedCategory={selectedRecipeCategory}
                            onCategoryChange={setSelectedRecipeCategory}
                            onReset={() => {
                                setRecipeSearchTerm('');
                                setSelectedRecipeCategory('All');
                            }}
                        />
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
