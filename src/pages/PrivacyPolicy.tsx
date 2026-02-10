import React from 'react';

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8 text-slate-800">개인정보처리방침 (Privacy Policy)</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6 text-slate-600">
                <section>
                    <h2 className="text-xl font-semibold text-slate-800 mb-3">1. 개인정보의 수집 및 이용 목적</h2>
                    <p>
                        '냉장고 털기' (이하 '서비스')는 사용자의 개인정보를 소중히 여기며, 최소한의 정보만을 수집합니다.
                        본 서비스는 별도의 회원가입 없이 이용 가능하며, 사용자가 냉장고 재료를 입력하는 정보는
                        레시피 추천을 위해서만 사용되고 서버에 영구 저장되지 않습니다.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-800 mb-3">2. 쿠키(Cookie) 및 광고 식별자 수집</h2>
                    <p className="mb-2">
                        본 서비스는 사용자에게 더 나은 서비스를 제공하고, 맞춤형 광고를 표시하기 위해 쿠키(Cookie)를 사용할 수 있습니다.
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>
                            <strong>Google AdSense:</strong> 본 서비스는 광고 수익을 위해 Google AdSense를 사용합니다.
                            Google 및 제3자 벤더는 쿠키를 사용하여 사용자의 이전 웹사이트 방문 기록에 기반한 광고를 게재합니다.
                        </li>
                        <li>
                            Google의 광고 쿠키 사용을 통해 Google 및 파트너는 사용자의 본 사이트 방문 또는 다른 웹사이트 방문 기록에 기반하여 적절한 광고를 사용자에게 표시할 수 있습니다.
                        </li>
                        <li>
                            사용자는 <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">광고 설정</a>을 방문하여 맞춤형 광고를 사용 중지할 수 있습니다.
                            (또는 <a href="http://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.aboutads.info</a>에서 제3자 벤더의 맞춤형 광고 쿠키 사용을 중지할 수 있습니다.)
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-800 mb-3">3. 개인정보의 제3자 제공</h2>
                    <p>
                        본 서비스는 법령에 근거하거나 사용자의 동의가 있는 경우를 제외하고는 개인정보를 제3자에게 제공하지 않습니다.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-800 mb-3">4. 문의처</h2>
                    <p>
                        개인정보 보호와 관련된 문의사항은 아래 연락처로 문의해 주시기 바랍니다.<br />
                        이메일: [대표님 이메일 주소 입력 필요]
                    </p>
                </section>

                <p className="text-sm text-slate-400 mt-8 pt-4 border-t border-slate-100">
                    본 방침은 2026년 2월 10일부터 시행됩니다.
                </p>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
