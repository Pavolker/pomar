
import React from 'react';
import { FruitTree } from '../types';
import { BackIcon, SunIcon, WaterIcon, SoilIcon, PruningIcon, PestIcon, ChatIcon } from './icons';

interface DetailPageProps {
  tree: FruitTree;
  onBack: () => void;
  onAskGardener: (treeName: string) => void;
}

const InfoCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-green-100 flex items-start space-x-4">
    <div className="flex-shrink-0 text-emerald-600">{icon}</div>
    <div>
      <h3 className="text-xl font-semibold text-emerald-800 mb-2">{title}</h3>
      <p className="text-gray-700 leading-relaxed">{children}</p>
    </div>
  </div>
);

const DetailPage: React.FC<DetailPageProps> = ({ tree, onBack, onAskGardener }) => {
  return (
    <div className="min-h-screen bg-lime-50" style={{backgroundImage: `url('https://www.transparenttextures.com/patterns/subtle-leaves.png')`}}>
      <div className="relative">
        <img src={`https://picsum.photos/seed/${tree.name.replace(/\s/g, '')}/1200/400`} alt={`Imagem de ${tree.name}`} className="w-full h-64 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-lime-50 to-transparent"></div>
        <button
          onClick={onBack}
          className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm p-3 rounded-full text-gray-700 hover:bg-white transition-all duration-200 shadow-md"
          aria-label="Voltar"
        >
          <BackIcon className="w-6 h-6" />
        </button>
      </div>

      <main className="p-4 sm:p-8 -mt-24 relative z-10 max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-emerald-900">{tree.name}</h1>
          <p className="text-lg text-gray-600 italic mt-2">{tree.scientificName}</p>
        </header>
        
        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg mb-8 border border-green-200">
           <p className="text-center text-gray-700 text-lg leading-relaxed">{tree.description}</p>
        </div>


        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-emerald-800 border-b-2 border-emerald-200 pb-2">Cuidados Essenciais</h2>
            <InfoCard icon={<SunIcon className="w-8 h-8"/>} title="Luz Solar">
              {tree.care.sunlight}
            </InfoCard>
            <InfoCard icon={<WaterIcon className="w-8 h-8"/>} title="Rega">
              {tree.care.watering}
            </InfoCard>
            <InfoCard icon={<SoilIcon className="w-8 h-8"/>} title="Solo">
              {tree.care.soil}
            </InfoCard>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-emerald-800 border-b-2 border-emerald-200 pb-2">Manejo</h2>
            <InfoCard icon={<PruningIcon className="w-8 h-8"/>} title="Poda e Colheita">
              {tree.pruningHarvest}
            </InfoCard>
            <div>
                 <InfoCard icon={<PestIcon className="w-8 h-8"/>} title="Pragas Comuns">
                    <ul className="space-y-3">
                    {tree.pests.map((pest, index) => (
                        <li key={index}>
                            <strong className="font-semibold text-emerald-700">{pest.name}:</strong> {pest.description}
                        </li>
                    ))}
                    </ul>
                </InfoCard>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
            <button
              onClick={() => onAskGardener(tree.name)}
              className="bg-emerald-600 text-white px-8 py-4 rounded-full shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transform hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto text-lg"
            >
              <ChatIcon className="w-6 h-6" />
              Pergunte ao Jardineiro Sábio
            </button>
        </div>
      </main>
    </div>
  );
};

export default DetailPage;
