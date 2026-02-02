#!/bin/bash
# Division 2 Gear Tracker - Quick Setup Script

echo "🎮 Division 2 Gear Tracker - Setup"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Frontend setup
echo "📦 Installing frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Frontend dependency installation failed"
        exit 1
    fi
    echo "✅ Frontend dependencies installed"
else
    echo "✅ Frontend dependencies already installed"
fi
cd ..

# Backend setup
echo ""
echo "📦 Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Backend dependency installation failed"
        exit 1
    fi
    echo "✅ Backend dependencies installed"
else
    echo "✅ Backend dependencies already installed"
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo ""
    echo "⚠️  Warning: backend/.env file not found"
    echo "   Copy .env.example and configure it:"
    echo "   cd backend"
    echo "   cp .env.example .env"
    echo "   # Edit .env with your credentials"
fi
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Set up the database:"
echo "   mysql -u root -p divtrack < database/00_setup_complete.sql"
echo ""
echo "2. Configure backend/.env with your credentials"
echo ""
echo "3. Start the backend:"
echo "   cd backend && npm run dev"
echo ""
echo "4. In a new terminal, start the frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "5. Open http://localhost:5173"
echo ""
