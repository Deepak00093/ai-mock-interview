import React, { useEffect, useState } from 'react';
import axios from 'axios';
import InterviewDashboard from './InterviewDashboard'; // Import the new dashboard

const ResultsPage = ({ match }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Fetch the graded interview data from your backend
    const fetchResults = async () => {
      const response = await axios.get(`https://ai-mock-interview-hs7y.onrender.com/api/interviews/${match.params.interviewId}`);
      setData(response.data);
    };
    fetchResults();
  }, [match.params.interviewId]);

  return <InterviewDashboard interviewData={data} />;
};