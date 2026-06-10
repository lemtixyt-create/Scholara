# Scholara - AI Study Assistant Backend

A secure backend server for the Scholara AI study notes application. Handles all API calls to Claude AI securely.

## Features

- 🔒 Secure API key management
- 📚 Generate study notes in multiple formats
- 💡 Multiple explanation levels (Beginner to Expert)
- 🏷️ Automatic key terms extraction
- ⚡ Quick facts generation
- 🔗 Related topics suggestions

## Setup Instructions

### 1. Prerequisites

- Node.js 14+ installed
- npm (comes with Node.js)
- Anthropic API key (get it from [console.anthropic.com](https://console.anthropic.com))

### 2. Installation

```bash
# Navigate to Scholara folder
cd c:\Users\hp\Desktop\Scholara

# Install dependencies
npm install
```

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```

2. Edit `.env` and add your API key:
```
ANTHROPIC_API_KEY=sk-ant-YOUR_ACTUAL_KEY_HERE
PORT=3000
CORS_ORIGIN=http://localhost:5500
```

### 4. Start the Backend Server

```bash
# For development (with auto-reload)
npm run dev

# Or for production
npm start
```

You should see:
```
🎓 Scholara backend running on http://localhost:3000
📚 API available at http://localhost:3000/api
```

### 5. Test the Backend

```bash
# Health check
curl http://localhost:3000/api/health
```

Should return:
```json
{"status":"ok","message":"Scholara backend is running"}
```

## API Endpoints

### POST /api/generate
Generate study notes for a topic

**Request:**
```json
{
  "topic": "Photosynthesis",
  "mode": "explain",
  "length": "medium",
  "grade": "grade9",
  "visuals": true,
  "explanation_level": "beginner"
}
```

**Response:**
```json
{
  "success": true,
  "content": "# Photosynthesis...",
  "topic": "Photosynthesis",
  "mode": "explain"
}
```

### POST /api/sidebar
Generate sidebar content (key terms, facts, related topics)

**Request:**
```json
{
  "topic": "Photosynthesis"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "terms": [
      {"word": "Chlorophyll", "def": "Green pigment that absorbs light"},
      ...
    ],
    "facts": ["Fact 1", "Fact 2", ...],
    "related": ["Topic 1", "Topic 2", ...]
  }
}
```

## Modes Available

| Mode | Description |
|------|-------------|
| `study` | Quick Learn - Complete guide |
| `cheatsheet` | Fast Facts - Instant summary |
| `revision` | Test Prep - Exam ready |
| `deepdive` | Deep Dive - Advanced insights |
| `explain` | Simplify - Your level |
| `essay` | Research - Deep analysis |
| `eli5` | Kid Mode - Super easy |
| `cornell` | Note Format - Structured notes |
| `lecture` | Class Notes - Lecture style |

## Explanation Levels

| Level | Best For |
|-------|----------|
| `beginner` | Absolute beginners |
| `intermediate` | Basic knowledge |
| `advanced` | Technical understanding |
| `expert` | Academic/professional level |
| `analogy` | Learning through metaphors |
| `visual` | Visual learners |

## File Structure

```
Scholara/
├── index.html          # Frontend application
├── server.js           # Backend Express server
├── package.json        # Node dependencies
├── .env.example        # Environment variables template
├── .env                # Actual environment (do NOT commit)
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## Troubleshooting

### "Cannot find module" error
```bash
npm install
```

### "ANTHROPIC_API_KEY not set" warning
Make sure you added your API key to `.env` file.

### CORS errors
Update `CORS_ORIGIN` in `.env` to match your frontend URL:
```
CORS_ORIGIN=http://localhost:5500
```

### Backend won't start
Check if port 3000 is already in use:
```bash
netstat -ano | findstr :3000
```

## Switching Between Providers

To use a different AI provider instead of Anthropic:

1. **Google Gemini**: Update `server.js` with Google's SDK
2. **Mistral**: Use `@mistralai/mistralai` package
3. **OpenRouter**: Make HTTP requests to OpenRouter API

## Security Notes

⚠️ **Never commit your `.env` file or API keys to version control**

- API keys are stored server-side only
- Frontend never sees the API key
- CORS is configured to only accept requests from your frontend
- All API calls are logged (in production, consider removing for privacy)

## Performance Tips

- Use shorter `max_tokens` for faster responses
- Cache common topics for faster generation
- Consider rate limiting for multiple users
- Monitor API usage and costs

## Support

For issues with:
- **Scholara App**: Check `index.html`
- **Backend Server**: Check `server.js`
- **API Keys**: Visit [console.anthropic.com](https://console.anthropic.com)
- **Dependencies**: Run `npm install` again

## License

MIT - Built by Shariq
