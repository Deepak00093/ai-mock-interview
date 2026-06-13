import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetching all interviews for the logged-in user
        const response = await axios.get('https://ai-mock-interview-hs7y.onrender.com/api/interviews', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setHistory(response.data);
      } catch (err) {
        console.error("Failed to fetch history:", err);
        setError("Could not load your interview history.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <div className="text-gray-600 font-medium">Loading your command center...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Your Dashboard</h1>
            <p className="text-gray-500 mt-2">Track your AI mock interview progress</p>
          </div>
          <button 
            onClick={() => navigate('/interview/setup')}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <span>+</span> New Interview
          </button>
        </div>

        {/* Error Handling */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium border border-red-100">
            {error}
          </div>
        )}

        {/* Empty State */}
        {history.length === 0 && !error ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-100 shadow-sm text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No interviews yet!</h2>
            <p className="text-gray-500 mb-6">Start your first AI-powered mock interview to generate your baseline score.</p>
            <button 
              onClick={() => navigate('/interview/setup')}
              className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors"
            >
              Start Practice Session
            </button>
          </div>
        ) : (
          /* History Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((session) => {
              // Calculate dynamic total score for the preview card
              const maxScorePerQuestion = 10;
              const calculatedTotalScore = session.answers?.reduce((sum, item) => sum + (Number(item.score) || 0), 0) || 0;
              const maxPossibleScore = (session.answers?.length || 0) * maxScorePerQuestion;
              const successRate = maxPossibleScore > 0 ? Math.round((calculatedTotalScore / maxPossibleScore) * 100) : 0;

              return (
                <div key={session._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                      {session.role || "Technical Review"}
                    </span>
                    <span className="text-gray-400 text-sm font-medium">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="mb-6 flex items-end gap-2">
                    <span className={`text-4xl font-black tracking-tight ${successRate >= 70 ? 'text-green-500' : successRate >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {successRate}%
                    </span>
                    <span className="text-gray-400 font-medium mb-1">Success Rate</span>
                  </div>

                  <button 
                    onClick={() => navigate(`/interview/results/${session._id}`)}
                    className="w-full py-3 bg-gray-50 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    View Detailed Report
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}