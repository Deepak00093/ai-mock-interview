import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // 1. Import useParams to get the ID
import axios from 'axios'; // 2. Import axios to fetch data
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const InterviewDashboard = () => {
  // 3. Grab the interview ID directly from the URL
  const { id } = useParams(); 
  
  // 4. Set up internal state to hold the fetched data
  const [interviewData, setInterviewData] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [error, setError] = useState(null);

  // 5. Fetch the data as soon as the component loads
  // 5. Fetch the data as soon as the component loads
  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Grab the token from local storage (Make sure this matches where you store your token!)
        const token = localStorage.getItem('token'); 

        // Add the Authorization header to the axios request
        const response = await axios.get(`https://ai-mock-interview-hs7y.onrender.com/api/interviews/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setInterviewData(response.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Could not load interview results. Are you logged in?");
      }
    };
    
    if (id) {
      fetchResults();
    }
  }, [id]);

  // Handle Errors
  if (error) {
    return <div className="text-center p-10 text-red-500 font-bold">{error}</div>;
  }

  // Handle Loading State
  if (!interviewData || !interviewData.answers) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <div className="text-gray-600 font-medium">Analyzing AI results...</div>
      </div>
    );
  }

  // 1. Safely extract JUST the answers array
// 1. Safely extract the answers array
  const { answers } = interviewData;

  // 2. Calculate the Total Score dynamically
  const maxScorePerQuestion = 10; 
  const calculatedTotalScore = answers.reduce((sum, item) => sum + (Number(item.score) || 0), 0);
  const maxPossibleScore = answers.length * maxScorePerQuestion;

  // 3. Calculate the Success Rate Percentage
  const successRate = Math.round((calculatedTotalScore / maxPossibleScore) * 100) || 0;

  // 4. Transform Backend Data for the Bar Chart
  const barChartData = answers.map((ans, index) => ({
    name: `Q${index + 1}`,
    score: ans.score,
    fullQuestion: ans.questionId.questionText
  }));

  // 5. Transform Backend Data for the Radar Chart (Skill Areas)
  const radarData = [
    { subject: 'Logic & Problem Solving', A: answers[0]?.score || 0, fullMark: 10 },
    { subject: 'Syntax & Architecture', A: answers[1]?.score || 0, fullMark: 10 },
    { subject: 'Communication', A: answers[2]?.score || 0, fullMark: 10 },
    { subject: 'Edge-Case Handling', A: Math.round((calculatedTotalScore / answers.length)) || 0, fullMark: 10 },
  ];

  const percentage = successRate; // Cleanly linked to the success rate!

  // PDF Download Logic
  // Upgraded PDF Download Logic with Debugging
  // The Native Pro Solution
  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      
      {/* 1. Header Section */}
      <div className="mb-8 flex justify-between items-center relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">AI Performance Analysis</h1>
          <p className="text-gray-500 mt-2">Detailed breakdown of your technical interview</p>
        </div>
        
        {/* Added print:hidden so the button vanishes ONLY inside the PDF! */}
        <button
          onClick={handleDownloadPdf}
          className="print:hidden px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
        >
          📥 Download PDF Report
        </button>
      </div>

      {/* 👇 THIS IS THE MISSING WRAPPER! Everything inside here gets put in the PDF. */}
      <div id="interview-report" className="w-full">

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full max-w-6xl">
          
          {/* Total Score Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <h3 className="text-gray-500 font-semibold mb-2">Total Score</h3>
            <div className="text-4xl font-bold text-blue-600">
              {calculatedTotalScore} <span className="text-lg text-gray-400">/ {maxPossibleScore}</span>
            </div>
          </div>

          {/* Success Rate Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <h3 className="text-gray-500 font-semibold mb-2">Success Rate</h3>
            <div className={`text-4xl font-bold ${successRate >= 70 ? 'text-green-500' : successRate >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
              {successRate}%
            </div>
          </div>

          {/* Questions Answered Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <h3 className="text-gray-500 font-semibold mb-2">Questions Evaluated</h3>
            <div className="text-4xl font-bold text-gray-800">
              {answers.length}
            </div>
          </div>
          
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Radar Chart: Skill Breakdown */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Skill Breakdown</h2>
            <div className="w-full">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                  <Radar name="Candidate" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart: Question by Question Score */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Question Performance</h2>
            <div className="w-full">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} />
                  <Bar dataKey="score" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed AI Feedback Accordion */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">Detailed AI Feedback</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {answers.map((ans, index) => (
              <div key={ans._id} className="p-0">
                <button 
                  onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
                  className="w-full p-6 text-left hover:bg-gray-50 flex justify-between items-center transition-colors"
                >
                  <div>
                    <span className="text-sm font-bold text-blue-600 mr-3">Q{index + 1}</span>
                    <span className="font-medium text-gray-800">{ans.questionId.questionText}</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      ans.score >= 8 ? 'bg-green-100 text-green-700' : 
                      ans.score >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {ans.score} / 10
                    </span>
                  </div>
                </button>
                
                {/* Expandable Content Area */}
                {expandedQuestion === index && (
                  <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <div className="mb-4">
                      <h4 className="text-xs uppercase font-bold text-gray-400 mb-1">Your Answer</h4>
                      <p className="text-gray-700 bg-white p-4 rounded border border-gray-200">{ans.answerText}</p>
                    </div>
                    <div>
                      <h4 className="text-xs uppercase font-bold text-indigo-400 mb-1">Gemini AI Critique</h4>
                      <p className="text-indigo-900 bg-indigo-50 p-4 rounded border border-indigo-100">{ans.feedback}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div> {/* 👈 And this closes the PDF wrapper perfectly! */}

    </div>
  );
};

export default InterviewDashboard;