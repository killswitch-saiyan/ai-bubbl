# Bubbl - AI-Powered Interactive Comic Reading

Bubbl is an AI-powered interactive comic reading app where children can role-play characters from comic books by reading aloud speech bubbles. The system uses AI to automatically detect characters and coordinate reading sessions.

## Features

- **AI Comic Processing**: Automatically analyze PDF comics and extract characters, panels, and dialogue
- **Character Assignment**: Assign characters to human players, with AI voicing the rest
- **Interactive Reading**: Panel-by-panel reading with highlighted text and turn coordination
- **Universal Format Support**: Works with both Western comics and Manga
- **Session Management**: Save and resume reading progress

## Tech Stack

### Backend
- **FastAPI** - Python web framework
- **Supabase** - Database and storage
- **OpenAI GPT-4V** - Comic analysis and character extraction
- **PyMuPDF** - PDF processing

### Frontend
- **React 18** - Frontend framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Zustand** - State management

## Setup Instructions

### Prerequisites
- Python 3.12+
- Node.js 18+
- OpenAI API key
- Supabase account

### Backend Setup

1. **Create virtual environment**:
   ```bash
   cd backend
   python -m venv venv
   ```

2. **Activate virtual environment**:
   - Windows: `venv\Scripts\activate`
   - Unix/macOS: `source venv/bin/activate`

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your API keys:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

5. **Set up database**:
   - Go to your Supabase project dashboard
   - Run the SQL commands from `setup_database.sql` in the SQL editor
   - Create a storage bucket named "comics" with public access

6. **Run the server**:
   ```bash
   python main.py
   ```
   Server will be available at http://localhost:8000

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```
   Frontend will be available at http://localhost:3000

## Usage

1. **Upload Comic**: Upload a PDF comic file
2. **Character Detection**: AI automatically analyzes and extracts characters
3. **Assign Characters**: Choose which characters each player will voice
4. **Start Reading**: Read panel-by-panel with highlighted dialogue and turn coordination

## Project Structure

```
ai-bubbl/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── core/           # Configuration and database
│   │   ├── models/         # Data models
│   │   ├── services/       # Business logic
│   │   ├── api/            # API endpoints
│   │   └── schemas/        # Request/response schemas
│   ├── requirements.txt
│   └── main.py
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API calls and types
│   │   └── stores/         # State management
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Development Principles

This project follows:
- **KISS** (Keep It Simple Stupid)
- **YAGNI** (You Aren't Gonna Need It)
- **SOLID** principles for clean architecture

## API Documentation

Once the backend is running, visit http://localhost:8000/docs for interactive API documentation.

## Contributing

This is an MVP (Minimum Viable Product) focused on core functionality. Future enhancements will include:
- Speech recognition and validation
- AI voice generation
- Multi-device multiplayer
- Advanced comic parsing
- Gamification features

## License

This project is for educational and demonstration purposes.