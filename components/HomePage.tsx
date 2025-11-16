
import React, { useState } from 'react';
import { FruitTree } from '../types';
import { SearchIcon, ChatIcon } from './icons';

interface HomePageProps {
  onSearchComplete: (tree: FruitTree) => void;
  onGoToChat: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const featuredTrees = [
  { name: 'Laranjeira', image: '1084' },
  { name: 'Limoeiro', image: '102' },
  { name: 'Macieira', image: '1079' },
  { name: 'Mangueira', image: '219' },
  { name: 'Abacateiro', image: '429' },
  { name: 'Jabuticabeira', image: '431' },
];

const HomePage: React.FC<HomePageProps> = ({ onSearchComplete, onGoToChat, setLoading, setError }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = async (term: string) => {
    if (!term.trim()) return;
    setLoading(true);
    setError(null);
    try {
      // Lazy import to avoid pulling gemini service into the main bundle unnecessarily
      const { getTreeInfo } = await import('../services/geminiService');
      const treeData = await getTreeInfo(term);
      onSearchComplete(treeData);
    } catch (err: any) {
      setError(err.message || 'Um erro desconhecido ocorreu.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchTerm);
  };

  return (
    <div className="min-h-screen bg-green-50 text-gray-800 p-4 sm:p-6 lg:p-8" style={{backgroundImage: `url('https://www.transparenttextures.com/patterns/subtle-leaves.png')`}}>
      <div className="max-w-4xl mx-auto">
        <header className="text-center my-8 sm:my-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-emerald-800">Pomar Casa Y7</h1>
          <p className="mt-4 text-lg text-emerald-700">Seu guia para um pomar saudável e produtivo.</p>
        </header>

        <form onSubmit={handleFormSubmit} className="relative mb-12">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Procure por uma fruta ou árvore..."
            className="w-full pl-12 pr-4 py-4 text-lg bg-white border-2 border-green-200 rounded-full shadow-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition duration-300"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <SearchIcon className="w-6 h-6 text-gray-400" />
          </div>
        </form>

        <section>
          <h2 className="text-2xl font-bold text-emerald-800 mb-6 text-center">Ou explore algumas populares:</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {featuredTrees.map((tree) => (
              <div
                key={tree.name}
                onClick={() => handleSearch(tree.name)}
                className="group relative rounded-xl overflow-hidden shadow-lg cursor-pointer transform hover:scale-105 transition-transform duration-300"
              >
                <img src={`https://picsum.photos/id/${tree.image}/400/400`} alt={tree.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 transition-colors duration-300"></div>
                <h3 className="absolute bottom-4 left-4 text-white text-xl font-bold">{tree.name}</h3>
              </div>
            ))}
          </div>
        </section>
      </div>

       <button
        onClick={onGoToChat}
        className="fixed bottom-6 right-6 bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transform hover:scale-110 transition-all duration-300 z-50 flex items-center gap-2"
        aria-label="Converse com o Jardineiro Sábio"
      >
        <ChatIcon className="w-7 h-7" />
        <span className="hidden sm:inline">Jardineiro Sábio</span>
      </button>
    </div>
  );
};

export default HomePage;
