# GrowNet - Mentor/Mentee Matching Platform

A full-featured mentoring platform built with React + TypeScript frontend and Node.js + Express backend.

## 📱 Pages & Features Implemented

### 1. **Welcome/Onboarding** (`/welcome`)
- 3-step onboarding carousel
- Progress indicator (1/3, 2/3, 3/3)
- Smooth transitions between steps
- Redirects to profile setup after completion

### 2. **Authentication**
- **Login Page** (`/login`)
  - Email & password fields
  - Remember me checkbox
  - Forgot password link
  - Social login (Google, Facebook)
  - Link to register page
  
- **Register Page** (`/register`)
  - Email, password, confirm password
  - Role selection (Mentor/Mentee)
  - CAPTCHA verification
  - Social registration options
  - Link to login page

### 3. **Profile Setup** (`/profile-setup`)
- Complete profile form with fields:
  - Full name (Họ và Tên)
  - Date of birth (Ngày tháng năm sinh)
  - Gender (Giới tính)
  - Role selection (Vai trò)
  - Profession (Nghề nghiệp/Chức danh)
  - Education (Học vấn)
  - Self introduction (Giới thiệu bản thân)
- Form validation
- Redirects to dashboard after submission

### 4. **Dashboard** (`/dashboard`)
- **Header Navigation**
  - Logo and brand name
  - Global search bar
  - Chat icon
  - Notification icon
  - User avatar menu
  
- **Left Sidebar - Quick Filters**
  - Field tags (Design, Marketing, UX/UI, etc.)
  - Location selection (TP HCM, Hà Nội, Other)
  - Experience slider (0-10+ years)
  - Status toggle (Active/Inactive)
  - Advanced filter button
  
- **Main Content - Profile Cards**
  - Cover image
  - Name and role
  - Skill tags
  - Description preview
  - Accept/Reject actions
  
- **Right Sidebar - Calendar**
  - Month/Week view toggle
  - Calendar grid with current day highlight
  - Today's schedule list with time slots
  - Event status indicators (Available, Busy)
  - "View all" button

### 5. **Advanced Filter Modal**
- Role selection (Mentor/Mentee tabs)
- Multiple field selection (Công Nghệ, Thiết kế, Kinh doanh, Marketing, Dữ liệu)
- Skills selection (JavaScript, Python, UX/UI, Project Management, Public Speaking)
- Location selection (TP. Hồ Chí Minh, Hà Nội, Đà Nẵng, Online)
- Apply filters button
- Close modal functionality

### 6. **Chat/Messaging** (`/chat`)
- **Left Sidebar - Contacts List**
  - Search conversations
  - Tabs: All, Requests (3), Unread (2)
  - Contact items with:
    - Avatar with online status indicator
    - Name
    - Last message preview
    - Timestamp
  
- **Main Chat Window**
  - Chat header with user info and actions
  - Messages container with:
    - System messages (match notifications)
    - Sent/received messages with avatars
    - Timestamp display
  - Input area with:
    - Attachment button
    - Text input
    - Emoji button
    - Send button
  - Footer with:
    - Delete history option
    - Report button
  
- **Right Sidebar - Chat Info**
  - User profile summary
  - Quick action buttons:
    - View profile
    - Search messages
    - Theme settings
  - Media gallery (Images/Videos grid)
  - File list with metadata
  - Link list with preview
  - "View all" buttons for each section

### 7. **Notifications Panel** (Component)
- Tabs: ALL / UNREAD
- Sections:
  - TODAY (Hôm nay)
  - YESTERDAY (Hôm qua)
  - EARLIER (Trước đó)
- Notification items with:
  - Unread indicator (red dot)
  - Avatar
  - Action text with highlighting
  - Timestamp
  - Pin/action button
- "View all" links for each section

## 🎨 Design Features

### Styling
- Modern, clean UI with blue accent colors (#3b82f6)
- Consistent spacing and typography
- Smooth transitions and hover effects
- Responsive grid layouts
- Custom scrollbar styling
- Box shadows for depth

### Responsive Design
- Desktop-first approach
- Breakpoints:
  - Large desktop: 1280px+
  - Desktop: 968px+
  - Tablet: 768px+
  - Mobile: < 768px
- Adaptive layouts for all screen sizes

### Color Palette
- Primary: #3b82f6 (Blue)
- Secondary: #10b981 (Green for success)
- Background: #f8fafc (Light gray)
- Text: #1e293b (Dark slate)
- Muted: #64748b (Gray)
- Border: #e2e8f0 (Light border)

## 🚀 Quick Start

### Frontend Development
```powershell
cd frontend
npm install
npm run dev
```
Frontend runs on: http://localhost:3000

### Backend Development
```powershell
cd backend
npm install
npm run dev
```
Backend runs on: http://localhost:4000

### Available Routes
- `/` → Redirects to `/login`
- `/login` → Login page
- `/register` → Registration page
- `/welcome` → Onboarding (3 steps)
- `/profile-setup` → Complete profile form
- `/dashboard` → Main app dashboard
- `/chat` → Messaging interface

### Backend Endpoints
- `GET /api/health` → Health check
- `GET /api/locales/en` → English locale data
- Static files served from `Home/public`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Welcome.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── ProfileSetup.tsx
│   │   ├── Dashboard.tsx
│   │   └── Chat.tsx
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── ProfileCard.tsx
│   │   ├── Calendar.tsx
│   │   ├── FilterModal.tsx
│   │   ├── ChatSidebar.tsx
│   │   ├── ChatWindow.tsx
│   │   ├── ChatInfo.tsx
│   │   └── Notification.tsx
│   ├── styles/
│   │   ├── Welcome.css
│   │   ├── Auth.css
│   │   ├── ProfileSetup.css
│   │   ├── Dashboard.css
│   │   ├── Sidebar.css
│   │   ├── ProfileCard.css
│   │   ├── Calendar.css
│   │   ├── FilterModal.css
│   │   ├── Chat.css
│   │   ├── ChatSidebar.css
│   │   ├── ChatWindow.css
│   │   ├── ChatInfo.css
│   │   ├── Notification.css
│   │   └── styles.css
│   ├── App.tsx
│   └── main.tsx
└── public/
    ├── logo.svg
    ├── google-icon.svg
    └── facebook-icon.svg

backend/
├── src/
│   └── index.ts
├── package.json
└── tsconfig.json
```

## 🔧 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **CSS3** - Styling (no frameworks, pure CSS)

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **ts-node-dev** - Development server with hot reload

## 🎯 Next Steps / TODOs

### Backend Integration
- [ ] Connect frontend forms to backend APIs
- [ ] Implement authentication (JWT tokens)
- [ ] Add user registration and login endpoints
- [ ] Create profile management APIs
- [ ] Implement real-time chat with WebSockets/Socket.io
- [ ] Add notification system backend

### Database
- [ ] Set up database (MongoDB/PostgreSQL)
- [ ] Create user models
- [ ] Create chat/message models
- [ ] Create notification models
- [ ] Implement matching algorithm

### Additional Features
- [ ] Add profile image upload
- [ ] Implement search functionality
- [ ] Add filtering and sorting
- [ ] Create mentor/mentee matching algorithm
- [ ] Add scheduling system
- [ ] Implement video call integration
- [ ] Add email notifications
- [ ] Create admin dashboard

### Testing & Deployment
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Set up CI/CD pipeline
- [ ] Deploy to production (Vercel/Netlify + Heroku/Railway)

## 📝 Notes

- All components are fully typed with TypeScript
- CSS is modular and scoped to components
- Responsive design works on all screen sizes
- Icons currently use emoji (consider icon library like Lucide/Heroicons)
- Images use placeholder paths (need real assets)
- Forms have basic validation (enhance with libraries like Formik/React Hook Form)
- State management is local (consider Redux/Zustand for global state)

## 🤝 Development Workflow

1. Start backend server first
2. Start frontend dev server
3. Navigate to http://localhost:3000
4. Test all routes and features
5. Check browser console for any errors
6. Verify responsive design on different screen sizes

## 📞 Contact & Support

For questions or issues, refer to the main README or create an issue in the repository.

---

**Built with ❤️ for GrowNet**
