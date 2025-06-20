/**
 * Enhanced Quiz App - Main Application Script
 * 
 * Features:
 * - Multiple programming language categories
 * - Timer for each question
 * - Score tracking and leaderboard
 * - Responsive design
 * - Animations and visual feedback
 */

// Question database for multiple programming languages
const allQuestions = {
  html: [
    { question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "Hyperlink Text Management Language", "Home Tool Markup Language", "Hyper Tool Multi Language"], answer: "Hyper Text Markup Language" },
    // More HTML questions...
  ],
  css: [
    { question: "What does CSS stand for?", options: ["Cascading Style Sheets", "Colorful Style Syntax", "Computer Style Sheets", "Creative Style Selector"], answer: "Cascading Style Sheets" },
    // More CSS questions...
  ],
  javascript: [
    { question: "Which language runs in the browser?", options: ["Java", "Python", "C++", "JavaScript"], answer: "JavaScript" },
    // More JavaScript questions...
  ],
  python: [
    { question: "What is the correct file extension for Python files?", options: [".py", ".python", ".pt", ".pyt"], answer: ".py" },
    // More Python questions...
  ],
  java: [
    { question: "What is the correct way to create an object called myObj of MyClass?", options: ["MyClass myObj = new MyClass();", "new myObj = MyClass();", "MyClass myObj = MyClass();", "create MyClass myObj;"], answer: "MyClass myObj = new MyClass();" },
    // More Java questions...
  ],
  react: [
    { question: "What does JSX stand for?", options: ["JavaScript XML", "Java Syntax Extension", "JavaScript Extension", "Java XML"], answer: "JavaScript XML" },
    // More React questions...
  ],
  nodejs: [
    { question: "What is Node.js?", options: ["A JavaScript runtime for server-side", "A web browser", "A database", "A CSS framework"], answer: "A JavaScript runtime for server-side" },
    // More Node.js questions...
  ],
  sql: [
    { question: "What does SQL stand for?", options: ["Structured Query Language", "Standard Query Language", "Sequential Query Language", "Simple Query Language"], answer: "Structured Query Language" },
    // More SQL questions...
  ]
};

// Quiz state variables
let currentQuestion = 0;      // Current question index
let score = 0;                // Current score
let timer;                    // Timer reference
let timeLeft = 15;            // Time per question (seconds)
let selectedCategory = '';    // Selected quiz category
let quizData = [];            // Questions for current quiz
let gameState = {             // Global game state
  scores: [],                 // All scores
  attempts: {}                // Attempts per user per category
};

// DOM element references
const loginScreen = document.getElementById('login-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const questionEl = document.getElementById('question');
const answersEl = document.getElementById('answers');
const nextBtn = document.getElementById('nextBtn');
const userDisplay = document.getElementById('userDisplay');
const timerEl = document.getElementById('timer');
const timerDisplay = document.getElementById('timerDisplay');
const progressBar = document.getElementById('progressBar');

/**
 * Starts the quiz after validation
 */
function startQuiz() {
  const username = document.getElementById('username').value.trim();
  selectedCategory = document.getElementById('categorySelect').value;

  // Validate username
  if (!username) {
    showAlert("Please enter your name to start the quiz!");
    return;
  }

  if (username.length < 2) {
    showAlert("Please enter a name with at least 2 characters!");
    return;
  }

  // Initialize quiz data with shuffled questions
  quizData = shuffle([...allQuestions[selectedCategory]]);
  userDisplay.textContent = username;
  
  // Reset quiz state
  currentQuestion = 0;
  score = 0;
  timeLeft = 15;

  // Show quiz screen
  loginScreen.style.display = 'none';
  quizScreen.style.display = 'block';

  // Load first question
  loadQuestion();
}

/**
 * Loads the current question and its options
 */
function loadQuestion() {
  resetState();
  
  // Check if quiz is complete
  if (currentQuestion >= quizData.length) {
    showResult();
    return;
  }

  const current = quizData[currentQuestion];
  questionEl.innerHTML = `<i class="fas fa-question-circle me-2"></i>Question ${currentQuestion + 1}: ${current.question}`;

  // Shuffle options for each question
  const shuffledOptions = shuffle([...current.options]);
  
  // Create answer buttons
  shuffledOptions.forEach((option, index) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.innerHTML = `<strong>${String.fromCharCode(65 + index)}.</strong> ${option}`;
    btn.onclick = () => selectAnswer(btn, current.answer);
    answersEl.appendChild(btn);
  });

  // Update UI
  updateProgress();
  startTimer();
}

/**
 * Handles answer selection
 * @param {HTMLElement} btn - The clicked answer button
 * @param {string} correctAnswer - The correct answer text
 */
function selectAnswer(btn, correctAnswer) {
  clearInterval(timer);
  const buttons = answersEl.querySelectorAll('button');
  buttons.forEach(button => button.disabled = true);

  const selectedText = btn.textContent.substring(3); // Remove "A. " prefix
  
  // Check if answer is correct
  if (selectedText === correctAnswer) {
    btn.classList.add('correct');
    score++;
  } else {
    btn.classList.add('incorrect');
    // Highlight the correct answer
    buttons.forEach(b => {
      const buttonText = b.textContent.substring(3);
      if (buttonText === correctAnswer) {
        b.classList.add('correct');
      }
    });
  }

  // Show next button
  nextBtn.style.display = 'block';
}

/**
 * Moves to the next question or shows results
 */
function nextQuestion() {
  currentQuestion++;
  if (currentQuestion < quizData.length) {
    loadQuestion();
  } else {
    showResult();
  }
}

/**
 * Shows the final result screen
 */
function showResult() {
  quizScreen.style.display = 'none';
  resultScreen.style.display = 'block';

  const username = userDisplay.textContent;
  const total = quizData.length;
  const percentage = (score / total) * 100;

  // Update result display
  document.getElementById("resultScore").textContent = `${score}/${total}`;
  
  // Determine result message based on percentage
  let resultMessage = "";
  if (percentage >= 90) {
    resultMessage = `🏆 Outstanding, ${username}! You're a true ${selectedCategory.toUpperCase()} expert!`;
  } else if (percentage >= 80) {
    resultMessage = `🎉 Excellent work, ${username}! You really know your ${selectedCategory.toUpperCase()}!`;
  } else if (percentage >= 70) {
    resultMessage = `👏 Great job, ${username}! You have solid ${selectedCategory.toUpperCase()} knowledge!`;
  } else if (percentage >= 60) {
    resultMessage = `👍 Good effort, ${username}! Keep studying ${selectedCategory.toUpperCase()}!`;
  } else {
    resultMessage = `💪 Keep practicing, ${username}! You'll master ${selectedCategory.toUpperCase()} soon!`;
  }
  
  document.getElementById("resultText").textContent = resultMessage;

  // Update attempts count
  const key = `${username}_${selectedCategory}`;
  gameState.attempts[key] = (gameState.attempts[key] || 0) + 1;

  // Save score to game state
  gameState.scores.push({ 
    username, 
    category: selectedCategory, 
    score, 
    total, 
    percentage: Math.round(percentage),
    date: new Date().toLocaleDateString() 
  });

  // Show attempts count
  document.getElementById("attemptsText").textContent = `Attempts in ${selectedCategory.toUpperCase()}: ${gameState.attempts[key]}`;

  // Update and show scoreboard
  updateScoreboard();
}

/**
 * Updates the scoreboard with top performers
 */
function updateScoreboard() {
  // Filter and sort scores for current category
  const filtered = gameState.scores.filter(s => s.category === selectedCategory);
  const sorted = filtered.sort((a, b) => b.score - a.score || b.percentage - a.percentage).slice(0, 5);
  const scoreList = document.getElementById("scoreList");
  scoreList.innerHTML = "";
  
  // Handle empty scoreboard
  if (sorted.length === 0) {
    scoreList.innerHTML = '<div class="text-muted text-center">No scores yet. Be the first!</div>';
  } else {
    // Create score items for each top performer
    sorted.forEach((s, i) => {
      const scoreItem = document.createElement("div");
      scoreItem.className = "score-item";
      scoreItem.innerHTML = `
        <div class="d-flex align-items-center">
          <div class="score-rank me-3">${i + 1}</div>
          <div>
            <strong>${s.username}</strong>
            <small class="text-muted d-block">${s.date}</small>
          </div>
        </div>
        <div class="fw-bold text-primary">${s.score}/${s.total} (${s.percentage}%)</div>
      `;
      scoreList.appendChild(scoreItem);
    });
  }
}

/**
 * Resets the quiz state for next question
 */
function resetState() {
  nextBtn.style.display = 'none';
  answersEl.innerHTML = '';
  clearInterval(timer);
  timeLeft = 15;
  timerEl.textContent = timeLeft;
  timerDisplay.classList.remove('warning');
}

/**
 * Starts the countdown timer for current question
 */
function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    
    // Add warning class when time is running low
    if (timeLeft <= 5) {
      timerDisplay.classList.add('warning');
    }
    
    // Handle time expiration
    if (timeLeft === 0) {
      clearInterval(timer);
      const buttons = answersEl.querySelectorAll('button');
      if (buttons.length > 0 && !buttons[0].disabled) {
        const correctAnswer = quizData[currentQuestion].answer;
        // Auto-select a wrong answer when time runs out
        let wrongButton = null;
        buttons.forEach(btn => {
          const buttonText = btn.textContent.substring(3);
          if (buttonText !== correctAnswer && !wrongButton) {
            wrongButton = btn;
          }
        });
        if (wrongButton) {
          selectAnswer(wrongButton, correctAnswer);
        }
      }
    }
  }, 1000);
}

/**
 * Updates the progress bar
 */
function updateProgress() {
  const percent = ((currentQuestion + 1) / quizData.length) * 100;
  progressBar.style.width = `${percent}%`;
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param {Array} array - The array to shuffle
 * @returns {Array} The shuffled array
 */
function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Resets the quiz to start over
 */
function tryAgain() {
  // Reset all quiz variables
  currentQuestion = 0;
  score = 0;
  timeLeft = 15;
  quizData = [];

  // Clear the username input
  document.getElementById('username').value = '';

  // Hide result screen and show login screen
  resultScreen.style.display = 'none';
  loginScreen.style.display = 'block';
}

/**
 * Shows a user-friendly alert message
 * @param {string} message - The message to display
 */
function showAlert(message) {
  const alertDiv = document.createElement('div');
  alertDiv.className = 'alert alert-warning alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
  alertDiv.style.zIndex = '9999';
  alertDiv.style.maxWidth = '400px';
  alertDiv.innerHTML = `
    <i class="fas fa-exclamation-triangle me-2"></i>${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(alertDiv);
  
  // Auto remove after 4 seconds
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove();
    }
  }, 4000);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Focus on username input when page loads
  document.getElementById('username').focus();
  
  // Allow Enter key to start quiz
  document.getElementById('username').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      startQuiz();
    }
  });
});