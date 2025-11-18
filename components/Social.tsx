import React, { useState } from 'react';
import { User, Friend } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { UserPlus, Trophy } from 'lucide-react';

interface SocialProps {
  user: User;
  friends: Friend[];
  setFriends: React.Dispatch<React.SetStateAction<Friend[]>>;
}

const Social: React.FC<SocialProps> = ({ user, friends, setFriends }) => {
  const [addName, setAddName] = useState('');

  const addFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName) return;

    // Mock fetching friend data
    const newFriend: Friend = {
      id: crypto.randomUUID(),
      username: addName,
      totalHours: Math.floor(Math.random() * 50) + 5, // Random 5-55 hours
      isOnline: Math.random() > 0.5
    };

    setFriends([...friends, newFriend]);
    setAddName('');
  };

  // Prepare chart data including current user
  const chartData = [
    { name: 'Me', hours: Math.round(user.totalStudyMinutes / 60), isMe: true },
    ...friends.map(f => ({ name: f.username, hours: f.totalHours, isMe: false }))
  ].sort((a, b) => b.hours - a.hours);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Leaderboard</h2>

      {/* Comparison Chart */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-lavender-100 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={60} />
            <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
            />
            <Bar dataKey="hours" radius={[0, 4, 4, 0]} barSize={20}>
               {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.isMe ? '#8b5cf6' : '#e5e7eb'} />
               ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Add Friend */}
      <form onSubmit={addFriend} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <UserPlus size={16} className="text-lavender-500"/> Add Study Buddy
        </h3>
        <div className="flex gap-2">
            <input 
                type="text" 
                placeholder="Enter friend's username"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender-200"
                value={addName}
                onChange={e => setAddName(e.target.value)}
            />
            <button type="submit" className="bg-lavender-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Add
            </button>
        </div>
      </form>

      {/* Friends List */}
      <div className="space-y-3">
        {friends.map((friend, idx) => (
            <div key={friend.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-pale-100 rounded-full flex items-center justify-center text-yellow-600 font-bold text-xs">
                        {idx + 2} {/* Rank (assuming user is #1 usually, simplistic logic) */}
                    </div>
                    <div>
                        <p className="font-medium text-sm text-gray-800">{friend.username}</p>
                        <p className="text-[10px] text-gray-400">{friend.isOnline ? 'Studying now...' : 'Offline'}</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="font-bold text-lavender-600 text-sm">{friend.totalHours}h</span>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Social;