import React from 'react';

const TermsOfService: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8 text-slate-800">이용약관 (Terms of Service)</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6 text-slate-600">
                <section>
                    <h2 className="text-xl font-semibold text-slate-800 mb-3">1. 목적</h2>
                    <p>
                        본 약관은 '냉장고 털기' (이하 '서비스')가 제공하는 모든 서비스의 이용 조건 및 절차,
                        사용자와 서비스 제공자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-800 mb-3">2. 서비스의 제공 및 변경</h2>
                    <p>
                        본 서비스는 사용자가 입력한 재료를 기반으로 메뉴를 추천해주는 기능을 제공합니다.
                        서비스의 내용은 운영상의 필요에 따라 변경되거나 중단될 수 있으며, 이에 대해 별도의 통지가 없을 수 있습니다.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-800 mb-3">3. 책임의 한계</h2>
                    <p>
                        본 서비스가 제공하는 레시피 및 정보는 참고용이며, 서비스 제공자는 해당 정보의 정확성, 완전성, 유용성에 대해 보증하지 않습니다.
                        따라서 서비스 이용으로 인해 발생한 어떠한 손해에 대해서도 서비스 제공자는 책임을 지지 않습니다.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-800 mb-3">4. 저작권</h2>
                    <p>
                        서비스에서 제공되는 콘텐츠의 저작권은 서비스 제공자 또는 해당 콘텐츠의 원저작자에게 있습니다.
                        사용자는 서비스를 이용함으로써 얻은 정보를 무단으로 복제, 배포, 상업적으로 이용할 수 없습니다.
                    </p>
                </section>

                <p className="text-sm text-slate-400 mt-8 pt-4 border-t border-slate-100">
                    본 약관은 2026년 2월 10일부터 시행됩니다.
                </p>
            </div>
        </div>
    );
};

export default TermsOfService;
