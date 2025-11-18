import React, { useMemo } from 'react';
import { User, Exam, StudyLog, Chapter } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CheckCircle, Circle, Calendar, Clock, Book } from 'lucide-react';

interface DashboardProps {
  user: User;
  exams: Exam[];
  logs: StudyLog[];
  updateProgress: (examId: string, subId: string, chapId: string, done: boolean) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, exams, logs, updateProgress }) => {

  // --- Analytics Logic ---
  const weeklyStudyTime = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    return logs
      .filter(log => new Date(log.date) >= startOfWeek)
      .reduce((acc, curr) => acc + curr.durationMinutes, 0);
  }, [logs]);

  const weeklyGoalMinutes = 15 * 60; // Mock goal: 15 hours
  const goalProgress = Math.min(100, (weeklyStudyTime / weeklyGoalMinutes) * 100);

  // --- AI Timetable Logic ---
  // Suggests tasks based on uncompleted chapters with high estimated hours or nearing deadlines
  const suggestedTasks = useMemo(() => {
    let tasks: { examId: string; subId: string; chapter: Chapter; examName: string; subName: string; daysLeft: number }[] = [];
    
    exams.forEach(exam => {
      const daysLeft = Math.ceil((new Date(exam.date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      if (daysLeft < 0) return; // Past exam

      exam.subjects.forEach(sub => {
        sub.chapters.forEach(chap => {
          if (!chap.isCompleted) {
            tasks.push({
              examId: exam.id,
              subId: sub.id,
              chapter: chap,
              examName: exam.name,
              subName: sub.name,
              daysLeft
            });
          }
        });
      });
    });

    // Sort by urgency (daysLeft) and then difficulty (estimatedHours desc)
    return tasks.sort((a, b) => a.daysLeft - b.daysLeft || b.chapter.estimatedHours - a.chapter.estimatedHours).slice(0, 5);
  }, [exams]);


  const chartData = [
    { name: 'Completed', value: goalProgress },
    { name: 'Remaining', value: 100 - goalProgress },
  ];
  const COLORS = ['#8b5cf6', '#ede9fe']; // Lavender-500, Lavender-100

  return (
    <div className="space-y-6 pb-20">
      {/* Greeting */}
      <div className="mt-2">
        <h2 className="text-2xl font-bold text-gray-800">Hi, {user.username} 👋</h2>
        <p className="text-gray-500">Let's make today productive.</p>
      </div>

      {/* Progress Card */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-lavender-100 flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-32 h-32 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={55}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
             <span className="text-xl font-bold text-lavender-600">{Math.round(weeklyStudyTime/60)}h</span>
             <span className="text-[10px] text-gray-400 uppercase tracking-wide">Studied</span>
          </div>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="font-semibold text-gray-800">Weekly Goal</h3>
          <p className="text-sm text-gray-500 mt-1">
            You've completed <span className="text-lavender-600 font-medium">{Math.round(goalProgress)}%</span> of your {weeklyGoalMinutes/60}h goal. Keep pushing!
          </p>
        </div>
      </div>

      {/* Today's Plan (AI Generated Priority) */}
      <div>
        <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <Calendar size={18} className="text-lavender-500" />
                Today's Focus
            </h3>
            <span className="text-xs bg-mint-100 text-mint-500 px-2 py-1 rounded-full font-medium">AI Suggested</span>
        </div>
        
        <div className="space-y-3">
            {suggestedTasks.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-gray-300">
                    <p className="text-gray-400 text-sm">No pending tasks! Add an exam or enjoy your break.</p>
                </div>
            ) : (
                suggestedTasks.map((task) => (
                    <div key={task.chapter.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-lavender-200 transition-all">
                        <div className="flex items-start gap-3">
                            <button 
                                onClick={() => updateProgress(task.examId, task.subId, task.chapter.id, true)}
                                className="mt-1 text-gray-300 hover:text-lavender-500 transition-colors"
                            >
                                <Circle size={20} />
                            </button>
                            <div>
                                <h4 className="font-medium text-gray-800 line-clamp-1">{task.chapter.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{task.subName}</span>
                                    <span className="text-xs text-lavender-600 font-medium flex items-center gap-1">
                                        <Clock size={10} /> {task.chapter.estimatedHours}h
                                    </span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                        task.chapter.difficulty === 'Hard' ? 'border-red-100 text-red-500 bg-red-50' :
                                        task.chapter.difficulty === 'Medium' ? 'border-yellow-100 text-yellow-600 bg-yellow-50' :
                                        'border-green-100 text-green-600 bg-green-50'
                                    }`}>
                                        {task.chapter.difficulty}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;