import React, { useState } from 'react';
import { User, Exam, Subject, Chapter } from '../types';
import { Plus, Sparkles, Trash2, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { generateSyllabus } from '../services/geminiService';

interface SyllabusManagerProps {
  user: User;
  exams: Exam[];
  setExams: React.Dispatch<React.SetStateAction<Exam[]>>;
}

const SyllabusManager: React.FC<SyllabusManagerProps> = ({ user, exams, setExams }) => {
  const [showAddExam, setShowAddExam] = useState(false);
  const [newExamName, setNewExamName] = useState('');
  const [newExamDate, setNewExamDate] = useState('');
  
  const [loadingSubject, setLoadingSubject] = useState<string | null>(null);

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    const exam: Exam = {
      id: crypto.randomUUID(),
      name: newExamName,
      date: newExamDate,
      subjects: []
    };
    setExams([...exams, exam]);
    setNewExamName('');
    setNewExamDate('');
    setShowAddExam(false);
  };

  const handleAddSubject = async (examId: string, subjectName: string) => {
    setLoadingSubject(subjectName);
    
    // AI call to generate chapters
    const chapters = await generateSyllabus(subjectName, user.prepGoal);
    
    const newSubject: Subject = {
      id: crypto.randomUUID(),
      name: subjectName,
      chapters: chapters
    };

    setExams(prev => prev.map(ex => {
      if (ex.id !== examId) return ex;
      return { ...ex, subjects: [...ex.subjects, newSubject] };
    }));
    
    setLoadingSubject(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">My Plan</h2>
        <button 
            onClick={() => setShowAddExam(true)}
            className="bg-lavender-600 text-white p-2 rounded-full shadow-lg hover:bg-lavender-700 transition-colors"
        >
            <Plus size={24} />
        </button>
      </div>

      {showAddExam && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-lavender-200 animate-in fade-in zoom-in duration-300">
            <h3 className="font-semibold text-gray-700 mb-3">Add New Exam</h3>
            <form onSubmit={handleAddExam} className="space-y-3">
                <input 
                    type="text" 
                    placeholder="Exam Name (e.g. JEE Mains)" 
                    className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-lavender-300 outline-none"
                    value={newExamName}
                    onChange={e => setNewExamName(e.target.value)}
                    required
                />
                <input 
                    type="date" 
                    className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-lavender-300 outline-none"
                    value={newExamDate}
                    onChange={e => setNewExamDate(e.target.value)}
                    required
                />
                <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setShowAddExam(false)} className="text-sm text-gray-500 px-3 py-1">Cancel</button>
                    <button type="submit" className="text-sm bg-lavender-600 text-white px-4 py-2 rounded-lg">Save</button>
                </div>
            </form>
        </div>
      )}

      <div className="space-y-6">
        {exams.map(exam => (
            <ExamCard 
                key={exam.id} 
                exam={exam} 
                onAddSubject={handleAddSubject}
                loadingSubject={loadingSubject}
                onDelete={() => setExams(exams.filter(e => e.id !== exam.id))}
            />
        ))}
        {exams.length === 0 && !showAddExam && (
            <div className="text-center py-12 text-gray-400">
                <BookOpen size={48} className="mx-auto mb-2 opacity-30" />
                <p>No exams added yet.</p>
            </div>
        )}
      </div>
    </div>
  );
};

interface ExamCardProps { 
    exam: Exam; 
    onAddSubject: (id: string, name: string) => void;
    loadingSubject: string | null;
    onDelete: () => void;
}

const ExamCard: React.FC<ExamCardProps> = ({ exam, onAddSubject, loadingSubject, onDelete }) => {
    const [subjectInput, setSubjectInput] = useState('');
    const [expanded, setExpanded] = useState(true);

    const submitSubject = (e: React.FormEvent) => {
        e.preventDefault();
        if(subjectInput.trim()) {
            onAddSubject(exam.id, subjectInput);
            setSubjectInput('');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-lavender-50 border-b border-lavender-100 flex justify-between items-center">
                <div onClick={() => setExpanded(!expanded)} className="cursor-pointer flex-1">
                    <h3 className="font-bold text-gray-800">{exam.name}</h3>
                    <p className="text-xs text-gray-500">
                        {new Date(exam.date).toLocaleDateString()} 
                        <span className="mx-1">•</span> 
                        {Math.ceil((new Date(exam.date).getTime() - Date.now()) / (1000 * 3600 * 24))} days left
                    </p>
                </div>
                <div className="flex items-center gap-2">
                     <button onClick={onDelete} className="text-gray-400 hover:text-red-400"><Trash2 size={16}/></button>
                     <button onClick={() => setExpanded(!expanded)} className="text-gray-400">
                        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                     </button>
                </div>
            </div>

            {expanded && (
                <div className="p-4">
                    {/* Subject List */}
                    <div className="space-y-4 mb-4">
                        {exam.subjects.map(sub => (
                            <div key={sub.id} className="border-l-2 border-lavender-300 pl-3">
                                <h4 className="font-semibold text-sm text-gray-700">{sub.name}</h4>
                                <div className="text-xs text-gray-500 mt-1">
                                    {sub.chapters.length} chapters • {sub.chapters.reduce((acc, c) => acc + c.estimatedHours, 0)}h total
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add Subject Form */}
                    <form onSubmit={submitSubject} className="relative">
                        <input 
                            type="text"
                            className="w-full pl-3 pr-10 py-2 bg-gray-50 rounded-lg text-sm border border-gray-200 focus:ring-1 focus:ring-lavender-400 outline-none"
                            placeholder="Add subject (e.g. Physics)"
                            value={subjectInput}
                            onChange={e => setSubjectInput(e.target.value)}
                            disabled={loadingSubject !== null}
                        />
                        <button 
                            type="submit"
                            disabled={loadingSubject !== null}
                            className="absolute right-1 top-1 bottom-1 bg-white text-lavender-600 p-1 rounded-md shadow-sm hover:bg-lavender-50 disabled:opacity-50"
                        >
                            {loadingSubject === subjectInput ? (
                                <div className="w-4 h-4 border-2 border-lavender-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Sparkles size={16} />
                            )}
                        </button>
                    </form>
                    {loadingSubject && <p className="text-[10px] text-lavender-500 mt-1 text-center animate-pulse">AI is generating syllabus for {loadingSubject}...</p>}
                </div>
            )}
        </div>
    );
};

export default SyllabusManager;