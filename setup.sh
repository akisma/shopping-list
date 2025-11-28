#!/bin/bash

# Shopping List Backend + Frontend Startup Script

echo "🛒 Shopping List App - Startup"
echo "================================"
echo ""

# Check if .env exists in backend
if [ ! -f "backend/.env" ]; then
    echo "⚠️  No backend/.env file found!"
    echo ""
    echo "Creating backend/.env from .env.example..."
    cp backend/.env.example backend/.env
    echo ""
    echo "✅ Created backend/.env"
    echo ""
    echo "⚠️  IMPORTANT: Add your OpenAI API key to backend/.env:"
    echo "   OPENAI_API_KEY=sk-your-api-key-here"
    echo ""
    read -p "Press Enter when you've added your API key..."
fi

echo ""
echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

echo ""
echo "📱 Installing mobile dependencies..."
cd shopping-list && npm install && cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "================================"
echo "To start the app:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend && npm run dev"
echo ""
echo "Terminal 2 (Mobile):"
echo "  cd shopping-list && npm start"
echo ""
echo "================================"
echo ""
echo "📝 Voice Commands:"
echo "  - 'Create a list called produce'"
echo "  - 'Add tomatoes'"
echo "  - 'Add three cases of onions'"
echo "  - 'Remove the garlic'"
echo "  - 'Send this list'"
echo "  - 'Show my lists'"
echo ""
