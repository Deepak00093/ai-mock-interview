const Interview = require('../models/Interview');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

const { GoogleGenAI } = require('@google/genai');


// @route   POST /api/interviews/start
// @desc    Create a new interview and fetch questions
exports.startInterview = async (req, res) => {
  try {
    const { role } = req.body; // e.g., 'Frontend Developer'

    // 1. Fetch questions matching this role from the database
    // We will limit it to 3 questions for the MVP
    const questions = await Question.find({ role }).limit(3);

    if (questions.length === 0) {
      return res.status(404).json({ message: `No questions found for role: ${role}` });
    }

    // 2. Create the Interview record in MongoDB
    const newInterview = new Interview({
      userId: req.user.id, // This comes from our authMiddleware!
      role,
      totalScore: 0
    });
    await newInterview.save();

    // 3. Send the interview ID and the questions back to the React frontend
    res.status(200).json({ 
      interviewId: newInterview._id, 
      questions 
    });

  } catch (error) {
    console.error('Start Interview Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   POST /api/interviews/seed
// @desc    TEMPORARY: Add some test questions to the database
exports.seedQuestions = async (req, res) => {
  try {
    const sampleQuestions = [
      { role: 'Frontend Developer', questionText: 'What is the Virtual DOM in React, and how does it improve performance?', difficulty: 'Medium', topic: 'React' },
      { role: 'Frontend Developer', questionText: 'Explain the difference between `let`, `const`, and `var` in JavaScript.', difficulty: 'Easy', topic: 'JavaScript' },
      { role: 'Frontend Developer', questionText: 'What are CSS Flexbox and Grid? When would you use one over the other?', difficulty: 'Medium', topic: 'CSS' }
    ];

    await Question.insertMany(sampleQuestions);
    res.status(201).json({ message: 'Sample questions added successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error seeding questions' });
  }
};

// @route   POST /api/interviews/:interviewId/submit
// @desc    Save the user's answers to the database
exports.submitAnswers = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { answers } = req.body; // Expecting an array of { questionId, answerText }

    // Format the data to match our Answer schema
    const formattedAnswers = answers.map((ans) => ({
      interviewId,
      questionId: ans.questionId,
      answerText: ans.answerText,
      // Score and feedback stay at default (0 and 'Pending') for now!
    }));

    // Save all answers to MongoDB in one go
    await Answer.insertMany(formattedAnswers);

    res.status(200).json({ message: 'Interview submitted successfully!' });
  } catch (error) {
    console.error('Submit Answers Error:', error);
    res.status(500).json({ message: 'Server error while saving answers' });
  }
};

// @route   GET /api/interviews/my-history
// @desc    Get all interviews for the logged-in user
exports.getUserInterviews = async (req, res) => {
  try {
    // Find all interviews that belong to the user ID from the token
    const interviews = await Interview.find({ userId: req.user.id }).sort({ createdAt: -1 }); // Sort by newest first
    
    res.status(200).json(interviews);
  } catch (error) {
    console.error('Fetch History Error:', error);
    res.status(500).json({ message: 'Server error while fetching history' });
  }
};

// @route   GET /api/interviews/:interviewId
// @desc    Get a single interview with its questions and answers
exports.getInterviewById = async (req, res) => {
  try {
    const { interviewId } = req.params;

    // 1. Verify the interview belongs to this user
    const interview = await Interview.findOne({ _id: interviewId, userId: req.user.id });
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // 2. Fetch all answers for this interview, and magically attach the Question text to them
    const answers = await Answer.find({ interviewId }).populate('questionId');

    res.status(200).json({ interview, answers });
  } catch (error) {
    console.error('Fetch Interview Error:', error);
    res.status(500).json({ message: 'Server error while fetching interview details' });
  }
};

// @route   POST /api/interviews/:interviewId/evaluate
// @desc    Use Gemini AI to grade all answers for an interview

// A list of realistic technical feedback strings to use as a fallback
const fallbackFeedbacks = [
  "The candidate demonstrated a good understanding of core concepts but could improve on optimization and edge-case handling.",
  "Excellent response. The explanation of data structures was precise, though mentioning time complexity explicit bounds would strengthen it.",
  "The answer covers the basic syntax well. To elevate this to a senior level, consider discussing memory allocation and error boundaries.",
  "Good problem-solving approach. The logic is clean, but ensure practical architectural trade-offs are emphasized in production scenarios."
];

exports.evaluateInterview = async (req, res) => {
  try {
    // 1. Initialize the official SDK
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const { interviewId } = req.params;

    // 2. Fetch the candidate's answers
    const answers = await Answer.find({ interviewId }).populate('questionId');
    if (!answers || answers.length === 0) {
      return res.status(404).json({ message: 'No answers found to evaluate' });
    }

    // 3. BATCHING: Combine all questions and answers into one single payload
    const formattedQA = answers.map((a) => `
      [ID: ${a._id}]
      Question: "${a.questionId.questionText}"
      Candidate Answer: "${a.answerText}"
    `).join('\n\n');

    const prompt = `
      You are a Senior Software Engineer evaluating a candidate.
      Evaluate the following batch of answers. 
      You MUST return ONLY a raw JSON ARRAY of objects. No markdown, no formatting.
      Each object must contain exactly these three fields:
      "answerId": The exact ID provided in the prompt
      "score": a number from 0 to 10
      "feedback": 2 to 3 sentences of strict, constructive technical feedback
      
      ${formattedQA}
    `;

    // 4. The Single API Request (No fallbacks, real AI only)
    console.log("Sending request to real Gemini AI...");
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    // 5. Clean and parse the real AI response
    let responseText = response.text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const evaluatedBatch = JSON.parse(responseText);

    // 6. Map the real grades back to your database
    let totalScore = 0;
    for (const evalResult of evaluatedBatch) {
      const answerDoc = answers.find(a => a._id.toString() === evalResult.answerId);
      if (answerDoc) {
        answerDoc.score = evalResult.score || 0;
        answerDoc.feedback = evalResult.feedback || "Processed.";
        await answerDoc.save();
        totalScore += answerDoc.score;
      }
    }

    await Interview.findByIdAndUpdate(interviewId, { totalScore });
    console.log("✅ Real AI Evaluation Complete!");
    res.status(200).json({ message: 'Real AI Evaluation Complete!' });

  } catch (error) {
    // If Google rejects this brand new key, we want to know EXACTLY why.
    console.error('🚨 FATAL API ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};