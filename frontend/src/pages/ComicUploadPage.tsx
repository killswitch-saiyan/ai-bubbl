import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { comicApi } from '../services/api';
import { useComicStore } from '../stores/comic';

const ComicUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentComic, setLoading, setError } = useComicStore();
  
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      setUploadError('Please select a PDF file');
      return;
    }
    
    setFile(selectedFile);
    setUploadError(null);
    
    // Auto-generate title from filename
    if (!title) {
      const fileName = selectedFile.name.replace('.pdf', '');
      setTitle(fileName);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      setUploadError('Please select a file and enter a title');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      setLoading(true);
      
      const comic = await comicApi.uploadComic(file, title.trim());
      setCurrentComic(comic);
      
      // Navigate to character selection
      navigate(`/characters/${comic.id}`);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload comic. Please try again.');
    } finally {
      setIsUploading(false);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <Link to="/" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
          ← Back to Home
        </Link>
        <h1 className="text-4xl font-heading text-gray-800 mb-4">
          Upload Your Comic
        </h1>
        <p className="text-gray-600">
          Upload a PDF comic and our AI will analyze it for interactive reading
        </p>
      </motion.div>

      {/* Upload Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-primary-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {file ? (
            <div className="space-y-4">
              <div className="text-4xl">📄</div>
              <div>
                <p className="font-semibold text-gray-800">{file.name}</p>
                <p className="text-sm text-gray-600">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                Choose different file
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-4xl">📁</div>
              <div>
                <p className="text-lg font-semibold text-gray-800 mb-2">
                  Drop your comic PDF here
                </p>
                <p className="text-gray-600 mb-4">or</p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                  id="file-input"
                />
                <label
                  htmlFor="file-input"
                  className="btn-secondary cursor-pointer inline-block"
                >
                  Browse Files
                </label>
              </div>
              <p className="text-sm text-gray-500">
                Supports PDF files up to 50MB
              </p>
            </div>
          )}
        </div>

        {/* Title Input */}
        <div className="mt-6">
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
            Comic Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter comic title..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Error Display */}
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
          >
            {uploadError}
          </motion.div>
        )}

        {/* Upload Button */}
        <div className="mt-8">
          <button
            onClick={handleUpload}
            disabled={!file || !title.trim() || isUploading}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-200 ${
              file && title.trim() && !isUploading
                ? 'btn-primary hover:shadow-lg transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isUploading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing Comic...</span>
              </div>
            ) : (
              '🚀 Upload & Process Comic'
            )}
          </button>
        </div>

        {/* Processing Info */}
        {isUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-sm text-gray-600"
          >
            <p>Our AI is analyzing your comic...</p>
            <p>This may take 30-60 seconds depending on comic length.</p>
          </motion.div>
        )}
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 bg-blue-50 rounded-lg p-6"
      >
        <h3 className="font-bold text-gray-800 mb-3">📝 Tips for Best Results:</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Use high-quality PDF scans for better character recognition</li>
          <li>• Comics with clear speech bubbles work best</li>
          <li>• Both Western comics and Manga are supported</li>
          <li>• Processing time depends on comic length and complexity</li>
        </ul>
      </motion.div>
    </div>
  );
};

export default ComicUploadPage;