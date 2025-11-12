import React, { useState, useEffect, useCallback } from 'react';
import { AdventureTurn, StoryLog } from './types';
import { generateAdventureTurn, generateImage } from './services/geminiService';
import Sidebar from './components/Sidebar';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
    const [gameState, setGameState] = useState<AdventureTurn | null>(null);
    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const [storyHistory, setStoryHistory] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const handleNewTurn = useCallback(async (choice: string | null) => {
        setIsLoading(true);
        setError(null);
        
        const currentInventory = gameState?.inventory || [];
        const currentQuest = gameState?.quest || "여정을 시작하세요.";

        try {
            const newTurnPromise = generateAdventureTurn(storyHistory, currentInventory, currentQuest, choice);
            
            const newTurn = await newTurnPromise;
            
            if(choice) {
                setStoryHistory(prev => [...prev, choice]);
            }
            setStoryHistory(prev => [...prev, newTurn.story]);

            setGameState(newTurn);

            // Generate image in parallel but don't block UI update
            generateImage(newTurn.imagePrompt).then(setImageUrl => {
                setCurrentImage(setImageUrl);
            }).catch(imgError => {
                console.error("Image generation failed:", imgError);
                setCurrentImage(null); // Or a placeholder
            });

        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    }, [gameState, storyHistory]);

    useEffect(() => {
        // Start the game on initial render
        handleNewTurn(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChoiceClick = (choice: string) => {
        if (!isLoading) {
            setCurrentImage(null); // Clear previous image while new one loads
            handleNewTurn(choice);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8">
            <header className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
                    무한 어드벤처 엔진
                </h1>
            </header>

            {error && (
                <div className="bg-red-800/50 border border-red-600 text-red-200 p-4 rounded-lg mb-6 text-center">
                    <p><strong>오류가 발생했습니다:</strong> {error}</p>
                    <button onClick={() => handleNewTurn(null)} className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md">모험 다시 시작</button>
                </div>
            )}
            
            <main className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
                <div className="flex-grow lg:w-2/3 xl:w-3/4">
                    <div className="bg-gray-800/60 rounded-lg shadow-2xl p-6 border border-gray-700/50">
                        <div className="aspect-video bg-gray-900 rounded-md mb-6 flex items-center justify-center overflow-hidden border border-gray-700">
                            {isLoading && !currentImage ? (
                                <div className="text-center text-gray-400">
                                    <LoadingSpinner className="w-12 h-12 mx-auto mb-2" />
                                    <p>장면을 생성하는 중...</p>
                                </div>
                            ) : currentImage ? (
                                <img src={currentImage} alt="모험 장면" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center text-gray-500">
                                    <p>이미지가 여기에 표시됩니다.</p>
                                </div>
                            )}
                        </div>

                        <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed mb-8">
                            {isLoading && !gameState?.story ? (
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-700 rounded w-full animate-pulse"></div>
                                    <div className="h-4 bg-gray-700 rounded w-5/6 animate-pulse"></div>
                                    <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse"></div>
                                </div>
                            ) : (
                                <p>{gameState?.story}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                           {gameState?.choices.map((choice, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleChoiceClick(choice)}
                                    disabled={isLoading}
                                    className="w-full text-left p-4 bg-indigo-600/80 rounded-lg shadow-md hover:bg-indigo-500/80 transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
                                >
                                    <p className="font-semibold text-white">{choice}</p>
                                </button>
                            ))}
                        </div>
                         {isLoading && gameState?.choices && (
                            <div className="mt-6 text-center text-indigo-400 flex items-center justify-center">
                                <LoadingSpinner className="w-6 h-6 mr-2" />
                                <p>던전 마스터가 생각 중입니다...</p>
                            </div>
                        )}
                    </div>
                </div>

                {gameState && <Sidebar quest={gameState.quest} inventory={gameState.inventory} />}
            </main>
        </div>
    );
};

export default App;