import React from 'react';

const About: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8 text-slate-800">소개 (About Us)</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6 text-slate-600">
                <section>
                    <h2 className="text-xl font-semibold text-slate-800 mb-3">👋 냉장고 털기(FridgeBreaker)는?</h2>
                    <p>
                        '냉장고 털기'는 냉장고 속에 잠들어 있는 재료들을 활용하여 맛있는 요리를 만들 수 있도록 도와주는 스마트한 레시피 추천 서비스입니다.
                        우리는 "냉장고 파먹기"를 넘어, 식재료 낭비를 줄이고(Zero Waste), 건강한 식습관을 만드는 것을 목표로 합니다.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-800 mb-3">🌱 우리의 미션</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>식재료 낭비 감소:</strong> 유통기한이 임박한 재료를 활용해 버려지는 음식을 줄입니다.</li>
                        <li><strong>지속 가능한 라이프스타일:</strong> 환경 보호와 경제적인 식생활을 동시에 실천합니다.</li>
                        <li><strong>요리의 즐거움 발견:</strong> 누구나 쉽게 따라 할 수 있는 레시피로 요리의 재미를 전합니다.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-800 mb-3">💡 주요 기능</h2>
                    <p>
                        보유한 재료를 입력하기만 하면, AI가 분석하여 최적의 메뉴를 추천해줍니다.
                        복잡한 과정 없이, 지금 당장 만들 수 있는 요리를 만나보세요.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default About;
