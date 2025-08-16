import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useComicStore } from '../stores/comic';
import { comicApi } from '../services/api';

const HomePage: React.FC = () => {
  const { comics, setComics, isLoading, setLoading, error, setError } = useComicStore();

  useEffect(() => {
    loadComics();
  }, []);

  const loadComics = async () => {
    try {
      setLoading(true);
      setError(null);
      const userComics = await comicApi.getUserComics();
      setComics(userComics);
    } catch (err) {
      setError('Failed to load comics');
      console.error('Error loading comics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl font-heading text-primary-700 mb-4">
          🗨️ Bubbl
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          AI-powered interactive comic reading where you become the characters!
        </p>
      </motion.div>

      {/* Quick Start */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-12"
      >
        <Link
          to="/upload"
          className="inline-block btn-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          📖 Upload Your First Comic
        </Link>
      </motion.div>

      {/* Comics Library */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="max-w-4xl mx-auto"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Comic Library</h2>

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <p className="mt-4 text-gray-600">Loading your comics...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {!isLoading && comics.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 bg-white rounded-lg shadow-lg"
          >
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Comics Yet!</h3>
            <p className="text-gray-600 mb-6">
              Upload your first comic to start your interactive reading adventure.
            </p>
            <Link to="/upload" className="btn-primary">
              Get Started
            </Link>
          </motion.div>
        )}

        {!isLoading && comics.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comics.map((comic, index) => (
              <motion.div
                key={comic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card hover:shadow-xl transition-shadow duration-200 cursor-pointer group"
              >
                <div className="aspect-[3/4] bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-4xl">📖</div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-primary-600 transition-colors">
                  {comic.title}
                </h3>
                
                {comic.metadata && (
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>📝 Style: {comic.metadata.style}</p>
                    <p>👥 Characters: {comic.metadata.characters.length}</p>
                    <p>📄 Pages: {comic.metadata.pages.length}</p>
                  </div>
                )}
                
                <Link
                  to={`/characters/${comic.id}`}
                  className="btn-primary w-full text-center block"
                >
                  Start Reading
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="max-w-4xl mx-auto mt-16"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "1",
              title: "Upload Comic",
              description: "Upload any PDF comic and our AI will analyze characters and dialogue",
              icon: "📤"
            },
            {
              step: "2", 
              title: "Choose Characters",
              description: "Select which characters you want to voice, AI handles the rest",
              icon: "🎭"
            },
            {
              step: "3",
              title: "Start Reading",
              description: "Read panel by panel with highlighted text and turn coordination",
              icon: "🗣️"
            }
          ].map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.2 }}
              className="text-center p-6"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <div className="text-2xl font-bold text-primary-600 mb-2">Step {item.step}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default HomePage;