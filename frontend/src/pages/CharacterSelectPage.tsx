import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { comicApi, sessionApi } from '../services/api';
import { useComicStore } from '../stores/comic';
import { CharacterAssignment } from '../services/types';

const CHARACTER_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red  
  '#22c55e', // green
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#ec4899', // pink
];

const CharacterSelectPage: React.FC = () => {
  const { comicId } = useParams<{ comicId: string }>();
  const navigate = useNavigate();
  const { 
    currentComic, 
    setCurrentComic, 
    characterAssignments, 
    setCharacterAssignments,
    isLoading,
    setLoading,
    error,
    setError 
  } = useComicStore();

  const [playerCount, setPlayerCount] = useState(1);
  const [playerNames, setPlayerNames] = useState(['Player 1']);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  useEffect(() => {
    if (comicId && !currentComic) {
      loadComic();
    }
  }, [comicId]);

  const loadComic = async () => {
    if (!comicId) return;
    
    try {
      setLoading(true);
      setError(null);
      const comic = await comicApi.getComic(comicId);
      setCurrentComic(comic);
    } catch (err) {
      setError('Failed to load comic');
      console.error('Error loading comic:', err);
    } finally {
      setLoading(false);
    }
  };

  const updatePlayerCount = (count: number) => {
    setPlayerCount(count);
    const newNames = Array.from({ length: count }, (_, i) => 
      playerNames[i] || `Player ${i + 1}`
    );
    setPlayerNames(newNames);
    
    // Reset character assignments when player count changes
    setCharacterAssignments([]);
  };

  const updatePlayerName = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const assignCharacterToPlayer = (character: string, playerIndex: number) => {
    const newAssignments = [...characterAssignments];
    
    // Remove character from any existing assignment
    newAssignments.forEach(assignment => {
      assignment.characters = assignment.characters.filter(c => c !== character);
    });
    
    // Find or create assignment for this player
    let playerAssignment = newAssignments.find((_, i) => i === playerIndex);
    if (!playerAssignment) {
      playerAssignment = {
        player_name: playerNames[playerIndex],
        characters: [],
        color: CHARACTER_COLORS[playerIndex % CHARACTER_COLORS.length],
      };
      newAssignments[playerIndex] = playerAssignment;
    }
    
    // Add character to player
    playerAssignment.characters.push(character);
    playerAssignment.player_name = playerNames[playerIndex];
    
    setCharacterAssignments(newAssignments);
  };

  const removeCharacterFromPlayer = (character: string) => {
    const newAssignments = characterAssignments.map(assignment => ({
      ...assignment,
      characters: assignment.characters.filter(c => c !== character),
    }));
    setCharacterAssignments(newAssignments);
  };

  const getCharacterAssignment = (character: string) => {
    return characterAssignments.findIndex(assignment => 
      assignment.characters.includes(character)
    );
  };

  const getUnassignedCharacters = () => {
    if (!currentComic?.metadata) return [];
    
    const assignedCharacters = characterAssignments.flatMap(a => a.characters);
    return currentComic.metadata.characters.filter(c => !assignedCharacters.includes(c));
  };

  const startReading = async () => {
    if (!currentComic || !comicId) return;
    
    try {
      setIsCreatingSession(true);
      
      // Create character assignment object for API
      const apiAssignments: Record<string, any> = {
        players: characterAssignments.filter(a => a.characters.length > 0),
        ai_characters: getUnassignedCharacters(),
      };
      
      const session = await sessionApi.createSession(comicId, apiAssignments);
      
      // Navigate to reading page
      navigate(`/read/${session.id}`);
      
    } catch (err) {
      setError('Failed to create reading session');
      console.error('Error creating session:', err);
    } finally {
      setIsCreatingSession(false);
    }
  };

  const canStartReading = () => {
    return characterAssignments.some(assignment => assignment.characters.length > 0);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p>Loading comic...</p>
      </div>
    );
  }

  if (error || !currentComic) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'Comic not found'}
        </div>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <Link to="/" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
          ← Back to Home
        </Link>
        <h1 className="text-4xl font-heading text-gray-800 mb-2">
          Choose Your Characters
        </h1>
        <h2 className="text-2xl text-gray-600 mb-4">{currentComic.title}</h2>
        <p className="text-gray-600">
          Select which characters each player will voice. AI will handle the rest!
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Player Setup */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">👥 Players</h3>
          
          {/* Player Count */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              How many people will be reading?
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map(count => (
                <button
                  key={count}
                  onClick={() => updatePlayerCount(count)}
                  className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                    playerCount === count
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Player Names */}
          <div className="space-y-3">
            {playerNames.map((name, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: CHARACTER_COLORS[index % CHARACTER_COLORS.length] }}
                ></div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => updatePlayerName(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={`Player ${index + 1} name`}
                />
                <span className="text-sm text-gray-500">
                  {characterAssignments[index]?.characters.length || 0} characters
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Character Assignment */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">🎭 Characters</h3>
          
          {currentComic.metadata && (
            <div className="space-y-3">
              {currentComic.metadata.characters.map((character, index) => {
                const assignedPlayerIndex = getCharacterAssignment(character);
                const isAssigned = assignedPlayerIndex !== -1;
                
                return (
                  <motion.div
                    key={character}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isAssigned
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {isAssigned && (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ 
                              backgroundColor: characterAssignments[assignedPlayerIndex]?.color 
                            }}
                          ></div>
                        )}
                        <span className="font-semibold text-gray-800">{character}</span>
                        {isAssigned && (
                          <span className="text-sm text-primary-600">
                            → {characterAssignments[assignedPlayerIndex]?.player_name}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        {isAssigned ? (
                          <button
                            onClick={() => removeCharacterFromPlayer(character)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        ) : (
                          <select
                            onChange={(e) => {
                              if (e.target.value !== '') {
                                assignCharacterToPlayer(character, parseInt(e.target.value));
                              }
                            }}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                            value=""
                          >
                            <option value="">Assign to...</option>
                            {playerNames.map((name, playerIndex) => (
                              <option key={playerIndex} value={playerIndex}>
                                {name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* AI Characters Info */}
          {getUnassignedCharacters().length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">🤖 AI will voice:</h4>
              <div className="flex flex-wrap gap-2">
                {getUnassignedCharacters().map(character => (
                  <span
                    key={character}
                    className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-sm"
                  >
                    {character}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Start Reading Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center mt-8"
      >
        <button
          onClick={startReading}
          disabled={!canStartReading() || isCreatingSession}
          className={`px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 ${
            canStartReading() && !isCreatingSession
              ? 'btn-primary hover:shadow-lg transform hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isCreatingSession ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Starting Session...</span>
            </div>
          ) : (
            '🚀 Start Reading Adventure!'
          )}
        </button>
        
        {!canStartReading() && (
          <p className="text-sm text-gray-500 mt-2">
            Assign at least one character to a player to continue
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default CharacterSelectPage;