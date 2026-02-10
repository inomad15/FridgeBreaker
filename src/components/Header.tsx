import React from 'react';
import { ChefHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => navigate('/')}
                >
                    <div className="bg-orange-600 p-2 rounded-lg">
                        <ChefHat className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                        <span className="text-orange-600">냉</span>장고 <span className="text-orange-600">털</span>기
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    {/* Notification or other actions can go here */}
                    <button className="p-2 hover:bg-slate-100 rounded-full transition-colors relative">
                        <div className="w-2 h-2 bg-red-500 rounded-full absolute top-2 right-2 ring-2 ring-white"></div>
                        <span className="sr-only">알림</span>
                        <div className="w-6 h-6 rounded-full bg-slate-200" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
