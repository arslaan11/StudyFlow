import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { Home, BookOpen, Clock, Users, MessageCircle, Menu, User as UserIcon, LogOut, GraduationCap } from 'lucide-react';
import { User, Exam, StudyLog, Friend } from './types';

// Pages
import Dashboard from './components/Dashboard';
import SyllabusManager from './components/SyllabusManager';
import FocusTimer from './components/FocusTimer';
import Social from './components/Social';
import DoubtSolver from './components/DoubtSolver';
import AuthScreen from './components/AuthScreen';
import FlashcardDeck from './components/FlashcardDeck';

// Helper for local storage
const useStickyState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => {
    const stickyValue = window.localStorage.getItem(key);
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
  });
  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
};

// --- Navigation Component ---
const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/syllabus', icon: BookOpen, label: 'Plan' },
    { path: '/timer', icon: Clock, label: 'Focus' },
    { path: '/social', icon: Users, label: 'Friends' },
    { path: '/doubts', icon: MessageCircle, label: 'Doubts' },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-lavender-200 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${isActive ? 'text-lavender-600' : 'text-gray-400'}`}
            >
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

// --- Header Component ---
const Header = ({ user, onLogout }: { user: User, onLogout: () => void }) => {
  return (
    <header className="sticky top-0 z-40 bg-lavender-50/90 backdrop-blur-md border-b border-lavender-100 px-4 h-14 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <GraduationCap className="text-lavender-600" size={24} />
        <span className="font-bold text-lg text-gray-800 tracking-tight">StudyFlow</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="bg-white px-2 py-1 rounded-full border border-lavender-200 flex items-center gap-2 shadow-sm">
           <UserIcon size={14} className="text-lavender-500" />
           <span className="text-xs font-medium text-gray-600">{user.username}</span>
        </div>
        <button onClick={onLogout} className="text-gray-400 hover:text-red-400 transition-colors">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

// --- Main App ---
const App = () => {
  const [user, setUser] = useStickyState<User | null>('studyflow_user', null);
  const [exams, setExams] = useStickyState<Exam[]>('studyflow_exams', []);
  const [logs, setLogs] = useStickyState<StudyLog[]>('studyflow_logs', []);
  const [friends, setFriends] = useStickyState<Friend[]>('studyflow_friends', []);

  const handleLogin = (newUser: User) => setUser(newUser);
  const handleLogout = () => setUser(null);

  const addStudyLog = (minutes: number) => {
    const newLog: StudyLog = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      durationMinutes: minutes,
      timestamp: Date.now(),
    };
    setLogs(prev => [...prev, newLog]);
    
    if (user) {
      setUser({ ...user, totalStudyMinutes: user.totalStudyMinutes + minutes });
    }
  };

  const updateExamProgress = (examId: string, subjectId: string, chapterId: string, isCompleted: boolean) => {
    setExams(prevExams => prevExams.map(exam => {
      if (exam.id !== examId) return exam;
      return {
        ...exam,
        subjects: exam.subjects.map(sub => {
          if (sub.id !== subjectId) return sub;
          return {
            ...sub,
            chapters: sub.chapters.map(chap => 
              chap.id === chapterId ? { ...chap, isCompleted } : chap
            )
          };
        })
      };
    }));
  };

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-lavender-50 pb-20 font-sans text-gray-800">
        <Header user={user} onLogout={handleLogout} />
        <div className="max-w-md mx-auto p-4">
          <Routes>
            <Route path="/" element={<Dashboard user={user} exams={exams} logs={logs} updateProgress={updateExamProgress} />} />
            <Route path="/syllabus" element={<SyllabusManager exams={exams} setExams={setExams} user={user} />} />
            <Route path="/timer" element={<FocusTimer onSessionComplete={addStudyLog} />} />
            <Route path="/social" element={<Social user={user} friends={friends} setFriends={setFriends} />} />
            <Route path="/doubts" element={<DoubtSolver />} />
            <Route path="/flashcards" element={<FlashcardDeck />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Navigation />
      </div>
    </HashRouter>
  );
};

export default App;