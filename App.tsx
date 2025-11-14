
import React, { useState, useCallback } from 'react';
import HomePage from './components/HomePage';
import DetailPage from './components/DetailPage';
import ChatPage from './components/ChatPage';
import { FruitTree, Page } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedTree, setSelectedTree] = useState<FruitTree | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearchComplete = useCallback((tree: FruitTree) => {
    setSelectedTree(tree);
    setCurrentPage('detail');
    setError(null);
  }, []);

  const handleGoToChat = useCallback((treeName?: string) => {
    // Lazy import and call startChat
    import('./services/geminiService').then(service => {
        service.startChat(treeName);
        setCurrentPage('chat');
    });
  }, []);

  const handleBack = useCallback(() => {
    setSelectedTree(null);
    setError(null);
    setCurrentPage('home');
  }, []);

  const renderContent = () => {
    switch (currentPage) {
      case 'detail':
        return selectedTree && <DetailPage tree={selectedTree} onBack={handleBack} onAskGardener={handleGoToChat} />;
      case 'chat':
        return <ChatPage onBack={handleBack} />;
      case 'home':
      default:
        return (
          <HomePage 
            onSearchComplete={handleSearchComplete} 
            onGoToChat={handleGoToChat}
            setLoading={setIsLoading}
            setError={setError}
          />
        );
    }
  };

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-t-emerald-500 border-gray-200 rounded-full animate-spin"></div>
        </div>
      )}
      {error && (
        <div className="fixed top-5 right-5 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="absolute top-1 right-2 text-white font-bold">&times;</button>
        </div>
      )}
      <div className="transition-opacity duration-300">
        {renderContent()}
      </div>
    </>
  );
};

export default App;
