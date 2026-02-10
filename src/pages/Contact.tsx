import React from 'react';

const Contact: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8 text-slate-800">문의하기 (Contact Us)</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6 text-slate-600">
                <p className="text-lg">
                    서비스 이용 중 궁금한 점이나 제안하고 싶은 내용이 있으신가요?
                    언제든지 아래 연락처로 편하게 문의해 주세요. 여러분의 소중한 의견을 기다립니다.
                </p>

                <div className="mt-6 p-6 bg-slate-50 rounded-xl border border-slate-200">
                    <h3 className="font-semibold text-slate-800 mb-2">📧 이메일 문의</h3>
                    <p className="text-slate-600">
                        support@fridgebreaker.com (예시 이메일)
                    </p>
                </div>

                <p className="text-sm text-slate-400 mt-4">
                    * 문의 주신 내용은 담당자가 확인 후 최대한 빠르게 답변 드리겠습니다.
                </p>
            </div>
        </div>
    );
};

export default Contact;
