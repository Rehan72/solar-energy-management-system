# Solar Energy Management System

A full-stack solar energy monitoring and management application built with Go (backend) and React (frontend).

## 🌞 Features

- **Real-time Energy Monitoring** - Track solar energy production and consumption
- **AI-Powered Predictions** - Machine learning-based energy output forecasting
- **User Management** - Role-based access control (Super Admin, Admin, User)
- **Device Management** - IoT device integration for solar nodes
- **Interactive Dashboard** - Visualize energy data with charts and maps
- **Responsive Design** - Works on desktop and mobile devices

## 🏗️ Tech Stack

### Backend
- **Go** with Gin framework
- **SQLite** database
- **JWT** authentication
- **AI/ML** service for energy predictions (Python)

### Frontend
- **React** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls

## 📁 Project Structure

```
solar-energy-management-system/
├── backend/              # Go backend
│   ├── cmd/server/       # Entry point
│   ├── internal/         # Core packages
│   │   ├── auth/        # Authentication
│   │   ├── database/    # Database operations
│   │   ├── devices/     # Device management
│   │   ├── energy/      # Energy calculations
│   │   ├── middleware/  # Auth middleware
│   │   └── users/       # User management
│   ├── ai-service/       # Python AI predictions
│   └── iot/             # IoT configurations
│
└── frontend/            # React frontend
    └── src/
        ├── components/  # Reusable components
        ├── pages/       # Page components
        ├── contexts/    # React contexts
        ├── lib/         # Utilities
        └── router/      # Routes
```

## 🚀 Getting Started

### Prerequisites
- Go 1.21+
- Node.js 18+
- Python 3.10+ (for AI service)

### Backend Setup

```bash
cd backend
go mod download
go run cmd/server/main.go
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### AI Service Setup

```bash
cd backend/ai-service
pip install -r requirements.txt
python app.py
```

## 🔐 Environment Variables

Create `.env` files in both backend and frontend directories:

**Backend:**
```env
JWT_SECRET=your-secret-key
```

**Frontend:**
```env
VITE_API_URL=http://localhost:8080
```

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/energy` | Get energy data |
| GET | `/api/predictions` | Get AI predictions |
| GET | `/api/devices` | List devices |

## 🛠️ Development

```bash
# Run backend (from backend directory)
go run cmd/server/main.go

# Run frontend (from frontend directory)
npm run dev

# Run AI service (from backend/ai-service)
python app.py
```

## 📝 License

MIT License
