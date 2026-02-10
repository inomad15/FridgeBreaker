import React from 'react';

const Guide: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8 text-slate-800">냉장고 관리 꿀팁 (Guide)</h1>

            <div className="space-y-8">
                {/* Tip 1 */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">🥦 채소를 오랫동안 신선하게 보관하는 법</h2>
                    <p className="text-slate-600 mb-4">
                        채소는 수분을 유지하는 것이 핵심입니다. 하지만 너무 과한 수분은 부패의 원인이 되기도 하죠.
                        잎채소는 씻지 않은 상태로 키친타월에 감싸 밀폐 용기에 보관하면 신선도가 오래 유지됩니다.
                        반면, 감자와 양파는 서늘하고 어두운 곳에 보관하되, 서로 붙여두지 않는 것이 좋습니다.
                    </p>
                </div>

                {/* Tip 2 */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">🥩 고기와 생선, 올바른 냉동 보관법</h2>
                    <p className="text-slate-600 mb-4">
                        고기와 생선은 공기와의 접촉을 최소화하는 것이 중요합니다.
                        랩으로 꼼꼼히 감싼 후 지퍼백에 넣어 보관하세요.
                        한 번에 먹을 만큼 소분해서 얼려두면, 요리할 때 해동 시간도 줄이고 위생적입니다.
                        냉동실 문 쪽보다는 안쪽에 보관하는 것이 온도 변화가 적어 좋습니다.
                    </p>
                </div>

                {/* Tip 3 */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">🥚 달걀 신선도 확인하기</h2>
                    <p className="text-slate-600 mb-4">
                        달걀이 상했는지 헷갈린다면 소금물에 띄워보세요.
                        신선한 달걀은 가라앉고, 오래된 달걀은 둥둥 뜹니다.
                        보관할 때는 둥근 부분이 위로 오게 두는 것이 신선함을 유지하는 비결입니다.
                    </p>
                </div>

                {/* Tip 4 */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">🧊 냉동실 성에 제거와 관리</h2>
                    <p className="text-slate-600 mb-4">
                        냉동실에 성에가 끼면 냉각 효율이 떨어지고 전기세가 많이 나올 수 있습니다.
                        주기적으로 성에를 제거해주고, 음식물로 꽉 채우기보다는 70% 정도만 채워 냉기 순환을 돕는 것이 좋습니다.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Guide;
