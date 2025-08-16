import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { sessionApi, comicApi } from '../services/api';
import { useComicStore } from '../stores/comic';
import { ComicBubble, ComicPanel } from '../services/types';

const ComicReaderPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const {
    currentComic,
    setCurrentComic,
    currentSession,
    setCurrentSession,
    readingState,
    updateReadingState,
    characterAssignments,
    setCharacterAssignments,
    isLoading,
    setLoading,
    error,
    setError
  } = useComicStore();

  const [currentBubbleIndex, setCurrentBubbleIndex] = useState(0);
  const [isReading, setIsReading] = useState(false);

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  const loadSession = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      setError(null);
      
      // Load session
      const session = await sessionApi.getSession(sessionId);
      setCurrentSession(session);
      
      // Load comic if not already loaded
      if (!currentComic || currentComic.id !== session.comic_id) {
        const comic = await comicApi.getComic(session.comic_id);
        setCurrentComic(comic);
      }
      
      // Set character assignments from session
      if (session.character_assignments?.players) {
        setCharacterAssignments(session.character_assignments.players);
      }
      
      // Set reading state
      updateReadingState({
        currentPage: session.current_page,
        currentPanel: session.current_panel,
        currentBubble: 0,
        isReading: false,
      });
      
    } catch (err) {
      setError('Failed to load reading session');
      console.error('Error loading session:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPage = () => {
    if (!currentComic?.metadata) return null;
    return currentComic.metadata.pages.find(p => p.page_number === readingState.currentPage);
  };

  const getCurrentPanel = () => {
    const page = getCurrentPage();
    if (!page) return null;
    return page.panels.find(p => p.order === readingState.currentPanel);
  };

  const getCurrentBubbles = () => {
    const panel = getCurrentPanel();
    if (!panel) return [];
    return panel.bubbles.sort((a, b) => a.order - b.order);
  };

  const getCharacterForBubble = (bubble: ComicBubble) => {
    return characterAssignments.find(assignment => 
      assignment.characters.includes(bubble.character)
    );
  };

  const isPlayerTurn = (bubble: ComicBubble) => {
    return getCharacterForBubble(bubble) !== undefined;
  };

  const nextBubble = () => {
    const bubbles = getCurrentBubbles();
    if (currentBubbleIndex < bubbles.length - 1) {
      setCurrentBubbleIndex(currentBubbleIndex + 1);
    } else {
      nextPanel();
    }
  };

  const previousBubble = () => {
    if (currentBubbleIndex > 0) {
      setCurrentBubbleIndex(currentBubbleIndex - 1);
    } else {
      previousPanel();
    }
  };

  const nextPanel = () => {
    const page = getCurrentPage();
    if (!page) return;

    if (readingState.currentPanel < page.panels.length) {
      // Next panel on same page
      updateReadingState({
        currentPanel: readingState.currentPanel + 1,
      });
      setCurrentBubbleIndex(0);
      saveProgress(readingState.currentPage, readingState.currentPanel + 1);
    } else {
      // Next page
      nextPage();
    }
  };

  const previousPanel = () => {
    if (readingState.currentPanel > 1) {
      // Previous panel on same page
      updateReadingState({
        currentPanel: readingState.currentPanel - 1,
      });
      setCurrentBubbleIndex(0);
      saveProgress(readingState.currentPage, readingState.currentPanel - 1);
    } else {
      // Previous page
      previousPage();
    }
  };

  const nextPage = () => {
    if (!currentComic?.metadata) return;
    
    if (readingState.currentPage < currentComic.metadata.pages.length) {
      updateReadingState({
        currentPage: readingState.currentPage + 1,
        currentPanel: 1,
      });
      setCurrentBubbleIndex(0);
      saveProgress(readingState.currentPage + 1, 1);
    }
  };

  const previousPage = () => {
    if (readingState.currentPage > 1) {
      const prevPage = currentComic?.metadata?.pages.find(p => 
        p.page_number === readingState.currentPage - 1
      );
      const lastPanel = prevPage ? prevPage.panels.length : 1;
      
      updateReadingState({
        currentPage: readingState.currentPage - 1,
        currentPanel: lastPanel,
      });
      setCurrentBubbleIndex(0);
      saveProgress(readingState.currentPage - 1, lastPanel);
    }
  };

  const saveProgress = async (page: number, panel: number) => {
    if (!sessionId) return;
    
    try {
      await sessionApi.updateProgress(sessionId, page, panel);
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  };

  const replayPanel = () => {
    setCurrentBubbleIndex(0);
  };

  const getBubbleClassName = (bubble: ComicBubble) => {
    const baseClasses = "p-4 rounded-lg max-w-md mx-auto text-center transition-all duration-300";
    
    switch (bubble.bubble_type) {
      case 'thought':
        return `${baseClasses} comic-bubble-thought`;
      case 'narration':
        return `${baseClasses} comic-bubble-narration`;
      case 'sound':
        return `${baseClasses} comic-bubble-sound`;
      default:
        return `${baseClasses} comic-bubble`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p>Loading reading session...</p>
        </div>
      </div>
    );
  }

  if (error || !currentSession || !currentComic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error || 'Session not found'}
          </div>
          <Link to="/" className="btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  const currentPage = getCurrentPage();
  const currentPanel = getCurrentPanel();
  const bubbles = getCurrentBubbles();
  const currentBubble = bubbles[currentBubbleIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-primary-600 hover:text-primary-700">
                ← Home
              </Link>
              <h1 className="text-xl font-bold text-gray-800">{currentComic.title}</h1>
            </div>
            
            <div className="text-sm text-gray-600">
              Page {readingState.currentPage} of {currentComic.metadata?.pages.length || 0} • 
              Panel {readingState.currentPanel} of {currentPage?.panels.length || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Main Reading Area */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Panel Display */}
          <motion.div
            key={`${readingState.currentPage}-${readingState.currentPanel}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-lg p-8 mb-8"
          >
            {/* Panel Visual Placeholder */}
            <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-6 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🎨</div>
                <p className="text-gray-600">Comic Panel {readingState.currentPanel}</p>
                <p className="text-sm text-gray-500">Visual representation would appear here</p>
              </div>
            </div>

            {/* Current Bubble */}
            <AnimatePresence mode="wait">
              {currentBubble && (
                <motion.div
                  key={currentBubble.bubble_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6"
                >
                  <div className={getBubbleClassName(currentBubble)}>
                    <p className="text-lg font-comic">{currentBubble.text}</p>
                  </div>
                  
                  {/* Speaker Info */}
                  <div className="text-center mt-4">
                    {isPlayerTurn(currentBubble) ? (
                      <div className="inline-flex items-center space-x-2 bg-primary-100 px-4 py-2 rounded-full">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ 
                            backgroundColor: getCharacterForBubble(currentBubble)?.color 
                          }}
                        ></div>
                        <span className="font-semibold text-primary-700">
                          {getCharacterForBubble(currentBubble)?.player_name} as {currentBubble.character}
                        </span>
                        <span className="text-primary-600">🎙️ Your turn!</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
                        <span className="font-semibold text-gray-700">🤖 AI as {currentBubble.character}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Panel Progress */}
            <div className="flex justify-center mb-6">
              <div className="flex space-x-2">
                {bubbles.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentBubbleIndex
                        ? 'bg-primary-500'
                        : index < currentBubbleIndex
                        ? 'bg-primary-300'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Reading Controls */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={previousBubble}
                disabled={currentBubbleIndex === 0 && readingState.currentPanel === 1 && readingState.currentPage === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ⏮️ Previous
              </button>
              
              <button
                onClick={replayPanel}
                className="btn-secondary"
              >
                🔁 Replay Panel
              </button>
              
              <button
                onClick={nextBubble}
                className="btn-primary"
              >
                Next ⏭️
              </button>
            </div>
          </motion.div>

          {/* Player Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {characterAssignments.map((assignment, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow p-4"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: assignment.color }}
                  ></div>
                  <span className="font-semibold text-gray-800">{assignment.player_name}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Characters: {assignment.characters.join(', ')}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComicReaderPage;