import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function InterviewResults() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`https://ai-mock-interview-hs7y.onrender.com/api/interviews/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch results', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id]);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading your results...</div>;
  if (!data) return <div className="p-10 text-center text-red-500">Could not load results.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex items-center p-4 bg-white shadow-sm">
        <Link to="/dashboard" className="text-blue-600 hover:underline">&larr; Back to Dashboard</Link>
      </nav>

      <main className="max-w-4xl p-6 mx-auto mt-6">
        <div className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-3xl font-bold text-gray-800">Interview Results</h2>
          <p className="mt-2 text-gray-600">
            Role: <span className="font-semibold">{data.interview.role}</span> | 
            Date: {new Date(data.interview.createdAt).toLocaleDateString()}
          </p>

          <div className="mt-8 space-y-8">
            {data.answers.map((item, index) => (
              <div key={item._id} className="p-6 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    <span className="text-blue-600 mr-2">Q{index + 1}:</span> 
                    {item.questionId.questionText}
                  </h3>
                  <span className="px-3 py-1 text-xs font-medium text-purple-800 bg-purple-100 rounded-full">
                    {item.questionId.topic}
                  </span>
                </div>
                
                <div className="p-4 bg-white border rounded">
                  <p className="text-sm font-semibold text-gray-500 mb-2">Your Answer:</p>
                  <p className="text-gray-800 whitespace-pre-wrap">{item.answerText}</p>
                </div>

                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm font-semibold text-yellow-800 mb-1">AI Feedback:</p>
                  <p className="text-yellow-900">{item.feedback}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}