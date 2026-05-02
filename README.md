# 🏫 School Portal — Full Stack App

## Tech Stack
- **Backend:** Flask (Python) + PostgreSQL
- **Frontend:** React
- **Auth:** JWT Tokens

## Roles
| Role | Login With | Can Do |
|------|-----------|--------|
| Admin | Phone + Password | Manage classes, teachers, students |
| Teacher | Phone + Password | Create tests, enter marks |
| Parent | Parent Phone + Password | View child's marks only |

---

## 📦 Local Setup

### Step 1: PostgreSQL Database banao
```sql
CREATE DATABASE schooldb;
```

### Step 2: Backend Setup
```bash
cd backend
pip install -r requirements.txt

# .env file banao
echo "DATABASE_URL=postgresql://postgres:yourpassword@localhost/schooldb" > .env
echo "JWT_SECRET_KEY=your-secret-key-here" >> .env

# Database initialize karo
python init_db.py

# Server start karo
flask run
```

### Step 3: Frontend Setup
```bash
cd frontend
npm install

# .env file banao
echo "REACT_APP_API_URL=http://localhost:5000" > .env

npm start
```

---

## 🚀 Vercel + Railway Deploy

### Backend (Railway pe deploy karo - free)
1. railway.app pe jaao
2. New Project → Deploy from GitHub
3. backend folder select karo
4. Environment variables set karo:
   - DATABASE_URL (Railway PostgreSQL)
   - JWT_SECRET_KEY

### Frontend (Vercel pe deploy karo)
1. vercel.com pe jaao
2. frontend folder import karo
3. Environment variable set karo:
   - REACT_APP_API_URL = Railway backend URL

---

## 🔐 Default Admin Login
- Phone: 9999999999
- Password: admin123

(Production mein zaroor change karo!)

---

## Workflow
1. **Admin** login kare → Classes banaye → Teachers add kare → Students add kare
2. **Teacher** login kare → Test banaye (Unit Test 1, etc.) → Marks daale
3. **Parent** login kare → Apne bachche ke marks dekhe (sirf unke)
