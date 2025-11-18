export interface User {
  username: string;
  phoneNumber: string;
  grade: string; // e.g., "11th", "12th"
  prepGoal: string; // e.g., "JEE", "NEET", "Boards"
  totalStudyMinutes: number;
}

export interface Chapter {
  id: string;
  name: string;
  estimatedHours: number;
  isCompleted: boolean;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface Subject {
  id: string;
  name: string;
  chapters: Chapter[];
}

export interface Exam {
  id: string;
  name: string;
  date: string; // ISO string
  subjects: Subject[];
}

export interface StudyLog {
  id: string;
  date: string;
  durationMinutes: number;
  timestamp: number;
}

export interface Friend {
  id: string;
  username: string;
  totalHours: number;
  isOnline: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  imageUri?: string;
  timestamp: number;
}

export interface Flashcard {
  id: string;
  front: string; // Question/Term
  back: string; // Answer/Definition
  status: 'new' | 'learned' | 'review';
}