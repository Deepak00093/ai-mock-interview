import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  
  // The Configuration State (Merged with your role concept)
  const [config, setConfig] = useState({
    topic: 'Frontend Developer',
    difficulty: 'Mid-Level',
    questionCount: 3
  });

  const topics = [
    { value: 'Frontend Developer', label: 'Frontend Developer (React/JS)' },
    { value: 'Backend Developer', label: 'Backend Developer (Node/DB)' },
    { value: 'Software Development Engineer', label: 'SDE (Data Structures/Algorithms)' },
    { value: 'HR / Behavioral', label: 'HR / Behavioral' }
  ];

  const difficulties = ['Junior / Entry-Level', 'Mid-Level', 'Senior'];

  const handleStartInterview = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      // 1. Get the token from storage
      const token = localStorage.getItem('token');
      
      // 2. Ask the backend to start the interview
      // Note: I mapped config.topic to 'role' so your backend doesn't break!
      const response = await axios.post(
        'https://ai-mock-interview-hs7y.onrender.com/api/interviews/start/',
        { 
          role: config.topic
        },
        { headers: { Authorization: `Bearer ${token}` } } // VIP Pass
      );

      // 3. Send them to the session page, passing the questions along!
      navigate(`/interview/${response.data.interviewId}`, { 
        state: { questions: response.data.questions } 
      });

    } catch (error) {
      console.error('Error starting interview:', error);
      alert('Could not start interview. Please make sure you are logged in.');
      setIsCreating(false); // Turn off the loading spinner if it fails
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
            ⚙️
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Configure Interview</h1>
          <p className="text-gray-500 mt-2 text-sm">Customize your AI mock evaluation</p>
        </div>

        <form onSubmit={handleStartInterview} className="space-y-6">
          {/* Topic Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Target Role</label>
            <select
              value={config.topic}
              onChange={(e) => setConfig({ ...config, topic: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-700"
            >
              {topics.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty Level</label>
            <div className="grid grid-cols-3 gap-3">
              {difficulties.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setConfig({ ...config, difficulty: level })}
                  className={`p-2 text-xs font-bold rounded-lg border transition-all ${
                    config.difficulty === level 
                      ? 'bg-blue-50 border-blue-500 text-blue-700' 
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {level.split(' / ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Number of Questions: <span className="text-blue-600">{config.questionCount}</span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={config.questionCount}
              onChange={(e) => setConfig({ ...config, questionCount: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Short (1)</span>
              <span>Full (5)</span>
            </div>
          </div>

          {/* Start Button */}
          <button
            type="submit"
            disabled={isCreating}
            className="w-full py-4 mt-4 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex justify-center items-center gap-2 shadow-md"
          >
            {isCreating ? (
              <>
                <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Generating Session...
              </>
            ) : (
              '🚀 Launch Interview'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}