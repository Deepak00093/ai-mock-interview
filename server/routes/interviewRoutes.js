const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { startInterview, seedQuestions, submitAnswers, getUserInterviews, getInterviewById, evaluateInterview } = require('../controllers/interviewController');


// Apply authMiddleware to protect the start route
router.post('/start', authMiddleware, startInterview);

// We won't protect the seed route so you can easily hit it to populate your DB
router.post('/seed', seedQuestions);

router.post('/:interviewId/submit', authMiddleware, submitAnswers);

router.get('/', authMiddleware, getUserInterviews);
// router.get('/my-history', authMiddleware, getUserInterviews);

router.get('/:interviewId', authMiddleware, getInterviewById);

router.post('/:interviewId/evaluate', authMiddleware, evaluateInterview);


module.exports = router;