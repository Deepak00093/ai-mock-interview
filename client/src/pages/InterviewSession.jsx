import React, { useState, useRef } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function InterviewSession() {
  const { id } = useParams(); // Gets the interview ID from the URL
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve the questions we passed from the setup page
  const questions = location.state?.questions || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerText, setAnswerText] = useState("");

  const [allAnswers, setAllAnswers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // To prevent double-clicks

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);

  const toggleRecording = () => {
    if (isRecording) {
      // 1. The user manually clicked STOP
      isRecordingRef.current = false;
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        "Sorry, your browser doesn't support Voice-to-Text. Try Google Chrome!",
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let currentTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      if (currentTranscript.trim()) {
        setAnswerText((prev) => {
          const updated = prev
            ? `${prev.trim()} ${currentTranscript.trim()}`
            : currentTranscript.trim();
          return updated;
        });
      }
    };

    recognition.onerror = (event) => {
      // Ignore 'no-speech' errors, which happen naturally when the user is quiet
      if (event.error !== "no-speech") {
        console.error("Speech recognition error:", event.error);
        isRecordingRef.current = false;
        setIsRecording(false);
      }
    };

    recognition.onend = () => {
      // 2. THE MAGIC FIX: If Chrome killed the mic, but the user didn't click stop... turn it back on!
      if (isRecordingRef.current) {
        try {
          recognition.start();
        } catch (e) {
          // Catch silent browser errors
        }
      } else {
        setIsRecording(false);
      }
    };

    // 3. Start the process
    isRecordingRef.current = true;
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  // Security check: If they somehow got here without questions, kick them back
  if (questions.length === 0) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl text-red-600">No questions found!</h2>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 text-blue-600 underline"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  const handleNext = async () => {
    // 1. Save the current answer into our array
    const currentAnswerData = {
      questionId: currentQuestion._id,
      answerText: answerText,
    };

    const updatedAnswers = [...allAnswers, currentAnswerData];

    // 2. Check if this was the last question
    if (currentIndex < questions.length - 1) {
      // Move to next question and clear the text box
      setAllAnswers(updatedAnswers);
      setCurrentIndex(currentIndex + 1);
      setAnswerText("");
    } else {
      // 3. This was the last question! Submit to backend
      setIsSubmitting(true);
      try {
        const token = localStorage.getItem("token");

        await axios.post(
          `https://ai-mock-interview-hs7y.onrender.com/api/interviews/${id}/submit`,
          { answers: updatedAnswers },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        // Step B: Tell Gemini AI to read and grade them!
        // (This might take 3-5 seconds since the AI has to think)
        await axios.post(
          `https://ai-mock-interview-hs7y.onrender.com/api/interviews/${id}/evaluate`,
          {}, // We don't need to send data, the backend already has the ID
          { headers: { Authorization: `Bearer ${token}` } },
        );

        alert("Mock Interview Complete! Answers saved to database.");
        navigate("/dashboard");
      } catch (error) {
        console.error("Submission failed", error);
        // This extracts the exact error message your backend sent!
        const errorMessage = error.response?.data?.message || error.message;

        alert(`Server Error: ${errorMessage}`);
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top Progress Bar Area */}
      <div className="p-4 bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <span className="font-semibold text-gray-600">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
            {currentQuestion.topic}
          </span>
        </div>
      </div>

      {/* Main Interview Area */}
      <main className="flex-1 max-w-4xl p-6 mx-auto w-full mt-6">
        <div className="p-8 bg-white border border-gray-200 shadow-sm rounded-xl">
          <h2 className="text-2xl font-bold text-gray-800">
            {currentQuestion.questionText}
          </h2>

          <div className="mt-8">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Your Answer
              </label>

              <button
                type="button"
                onClick={toggleRecording}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all text-sm ${
                  isRecording
                    ? "bg-red-100 text-red-600 animate-pulse border border-red-300"
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                }`}
              >
                {isRecording ? (
                  <>
                    <span className="h-2.5 w-2.5 bg-red-600 rounded-full animate-ping"></span>
                    Recording... Click to Stop
                  </>
                ) : (
                  <>🎙️ Speak Answer</>
                )}
              </button>
            </div>
            <textarea
              rows="8"
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Type your explanation here, or click the mic to speak..."
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              disabled={isSubmitting}
            ></textarea>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleNext}
              // 1. Bulletproof check: If it has any length at all, unlock it.
              disabled={!answerText || answerText.length === 0 || isSubmitting}
              // 2. Explicit color handling based on the state
              className={`px-6 py-3 font-semibold text-white rounded-lg transition-all ${
                answerText && answerText.length > 0 && !isSubmitting
                  ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  : "bg-gray-400 opacity-50 cursor-not-allowed"
              }`}
            >
              {isSubmitting
                ? "AI is Grading..."
                : currentIndex === questions.length - 1
                  ? "Submit Interview"
                  : "Submit & Next"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
