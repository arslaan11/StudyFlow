import React, { useState } from 'react';
import { User } from '../types';
import { GraduationCap, ArrowRight } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    username: '',
    grade: '11th',
    prepGoal: 'JEE',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && formData.phoneNumber.length >= 10) {
      setStep(2);
    } else if (step === 2 && formData.username) {
      onLogin({
        ...formData,
        totalStudyMinutes: 0,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender-100 to-white flex flex-col items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-lavender-100 p-4 rounded-full mb-4">
            <GraduationCap size={48} className="text-lavender-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome to StudyFlow</h1>
          <p className="text-gray-500 text-sm text-center mt-2">Your minimalist AI study companion.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 ? (
            <div className="space-y-4">
               <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-lavender-500 transition-all"
                  placeholder="Enter mobile number"
                  value={formData.phoneNumber}
                  onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
               <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Username</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-lavender-500"
                  placeholder="Pick a username"
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                />
              </div>
              
              <div className="flex gap-3">
                 <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Class</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-lavender-500"
                      value={formData.grade}
                      onChange={e => setFormData({...formData, grade: e.target.value})}
                    >
                      <option value="10th">10th</option>
                      <option value="11th">11th</option>
                      <option value="12th">12th</option>
                      <option value="College">College</option>
                    </select>
                 </div>
                 <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Target</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-lavender-500"
                      value={formData.prepGoal}
                      onChange={e => setFormData({...formData, prepGoal: e.target.value})}
                    >
                      <option value="JEE">JEE</option>
                      <option value="NEET">NEET</option>
                      <option value="Boards">Boards</option>
                      <option value="Other">Other</option>
                    </select>
                 </div>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-lavender-600 hover:bg-lavender-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-lavender-300"
          >
            {step === 1 ? 'Continue' : 'Start Studying'}
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthScreen;