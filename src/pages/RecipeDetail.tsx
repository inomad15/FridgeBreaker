import React, { useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Clock, ChefHat, ShoppingCart, Check } from 'lucide-react';
import { RECIPES, INGREDIENTS } from '../constants';
import { Ingredient, Recipe } from '../types';

export default function RecipeDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const location = useLocation();

    // Check if recipe was passed via navigation state (for AI recipes)
    const recipeFromState = location.state?.recipe as Recipe | undefined;
    const recipe = recipeFromState || RECIPES.find(r => r.id === id);

    const ingredientMap = useMemo(() => {
        const map = new Map<string, Ingredient>();
        INGREDIENTS.forEach(ing => map.set(ing.id, ing));
        return map;
    }, []);

    if (!recipe) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-800">레시피를 찾을 수 없습니다.</h2>
                    <button onClick={() => navigate('/')} className="mt-4 text-orange-600 font-bold hover:underline">
                        홈으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header Image */}
            <div className="relative h-72 md:h-96 w-full">
                <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-white p-2 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md transition-all"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <div className="max-w-3xl mx-auto">
                        <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold mb-2 inline-block">
                            {recipe.difficulty === 'Easy' ? '쉬움' : recipe.difficulty === 'Medium' ? '보통' : '어려움'}
                        </span>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{recipe.title}</h1>
                        <p className="text-slate-200 text-sm md:text-base line-clamp-2">{recipe.description}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 -mt-6 relative z-10">
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 md:p-8 mb-6">

                    {/* Nutrition & Meta Info Grid */}
                    <div className="border-2 border-orange-500 rounded-xl overflow-hidden mb-8">
                        {/* Row 1: Orange Background */}
                        <div className="grid grid-cols-3 bg-orange-500 text-white divide-x divide-orange-400 text-center">
                            <div className="p-3 flex flex-col items-center justify-center">
                                <p className="text-xs font-medium opacity-90">조리 시간</p>
                                <p className="text-base md:text-lg font-bold">{recipe.cookingTimeMinutes}분</p>
                            </div>
                            <div className="p-3 flex flex-col items-center justify-center">
                                <p className="text-xs font-medium opacity-90">칼로리</p>
                                <p className="text-base md:text-lg font-bold">{recipe.calories || '-'}kcal</p>
                            </div>
                            <div className="p-3 flex flex-col items-center justify-center">
                                <p className="text-xs font-medium opacity-90">인분</p>
                                <p className="text-base md:text-lg font-bold">{recipe.servingSize || 1}인분</p>
                            </div>
                        </div>
                        {/* Row 2: White Background */}
                        <div className="grid grid-cols-3 bg-white divide-x divide-orange-100 text-center">
                            <div className="p-3 flex flex-col items-center justify-center">
                                <p className="text-xs font-semibold text-orange-600">탄수화물</p>
                                <p className="text-base md:text-lg font-bold text-slate-800">{recipe.carbohydrates || '-'}g</p>
                            </div>
                            <div className="p-3 flex flex-col items-center justify-center">
                                <p className="text-xs font-semibold text-orange-600">지방</p>
                                <p className="text-base md:text-lg font-bold text-slate-800">{recipe.fat || '-'}g</p>
                            </div>
                            <div className="p-3 flex flex-col items-center justify-center">
                                <p className="text-xs font-semibold text-orange-600">단백질</p>
                                <p className="text-base md:text-lg font-bold text-slate-800">{recipe.protein || '-'}g</p>
                            </div>
                        </div>
                    </div>

                    {/* Ingredients */}
                    <div className="mb-10">
                        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                            <span className="bg-orange-100 text-orange-600 p-1.5 rounded-lg mr-2 text-sm">🥗</span>
                            준비 재료
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                            {recipe.ingredients.map((ring) => {
                                const ing = ingredientMap.get(ring.id);
                                return (
                                    <div key={ring.id} className="flex items-center justify-between py-2 border-b border-dashed border-slate-100 last:border-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl flex items-center justify-center w-6 h-6">
                                                {ing?.imageUrl ? (
                                                    <img src={ing.imageUrl} alt={ing.name} className="w-full h-full object-contain" />
                                                ) : (
                                                    ing?.emoji || '🍽️'
                                                )}
                                            </span>
                                            <span className={`font-medium ${ring.required ? 'text-slate-900' : 'text-slate-500'}`}>
                                                {ing?.name || ring.id}
                                                {!ring.required && <span className="text-xs text-slate-400 font-normal ml-1">(선택)</span>}
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded">
                                            {ring.amount}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Instructions */}
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                            <span className="bg-orange-100 text-orange-600 p-1.5 rounded-lg mr-2 text-sm">🍳</span>
                            조리 순서
                        </h3>

                        {recipe.instructions ? (
                            <div className="space-y-6">
                                {recipe.instructions.map((step, index) => (
                                    <div key={index} className="flex gap-4 group">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center mt-0.5 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-slate-700 leading-relaxed text-lg">{step}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-slate-50 p-6 rounded-xl text-center text-slate-500">
                                <p>상세 조리법이 제공되지 않는 레시피입니다.</p>
                            </div>
                        )}
                    </div>

                </div>

                {/* Missing Ingredients CTA - Simplified from Home.tsx */}
                <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <p className="font-bold text-slate-800">재료가 부족하신가요?</p>
                        <p className="text-sm text-slate-500">마켓컬리에서 신선한 재료를 바로 주문해보세요.</p>
                    </div>
                    <button
                        onClick={() => window.open('https://www.kurly.com/main', '_blank')}
                        className="mobile-full-width md:w-auto px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        재료 구매하기
                    </button>
                </div>

            </div>
        </div>
    );
}
