import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="bg-white border-t border-slate-100 py-8 mt-12">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <div className="flex justify-center space-x-6 mb-4 flex-wrap gap-y-2">
                    <Link to="/about" className="text-slate-500 hover:text-slate-800 text-sm">소개</Link>
                    <Link to="/guide" className="text-slate-500 hover:text-slate-800 text-sm">이용가이드</Link>
                    <Link to="/contact" className="text-slate-500 hover:text-slate-800 text-sm">문의하기</Link>
                    <span className="text-slate-300">|</span>
                    <Link to="/privacy-policy" className="text-slate-500 hover:text-slate-800 text-sm">개인정보처리방침</Link>
                    <Link to="/terms-of-service" className="text-slate-500 hover:text-slate-800 text-sm">이용약관</Link>
                </div>
                <p className="text-slate-400 text-xs">
                    &copy; {new Date().getFullYear()} 냉장고 털기. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
