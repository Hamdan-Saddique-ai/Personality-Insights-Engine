let currentQuestionIndex = 0;
let userAnswers = [];
let questionsData = null;

// Load questions from JSON file
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        const data = await response.json();
        questionsData = data;
        userAnswers = new Array(questionsData.questions.length).fill(null);
        renderQuestion();
        updateProgress();
    } catch (error) {
        console.error('Error loading questions:', error);
        document.getElementById('question-text').innerText = 'Error loading questions. Please check console.';
    }
}

function renderQuestion() {
    if (!questionsData) return;
    
    const question = questionsData.questions[currentQuestionIndex];
    document.getElementById('question-number').innerText = `Question ${currentQuestionIndex + 1} of ${questionsData.questions.length}`;
    document.getElementById('question-text').innerText = question.text;
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, idx) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        if (userAnswers[currentQuestionIndex] === idx) {
            optionDiv.classList.add('selected');
        }
        optionDiv.innerText = option.text;
        optionDiv.onclick = () => selectOption(idx);
        optionsContainer.appendChild(optionDiv);
    });
    
    // Update navigation buttons
    document.getElementById('prev-btn').disabled = currentQuestionIndex === 0;
    const nextBtn = document.getElementById('next-btn');
    if (currentQuestionIndex === questionsData.questions.length - 1) {
        nextBtn.innerText = 'Submit';
    } else {
        nextBtn.innerText = 'Next →';
    }
}

function selectOption(optionIndex) {
    userAnswers[currentQuestionIndex] = optionIndex;
    renderQuestion(); // Re-render to show selected state
}

function nextQuestion() {
    if (userAnswers[currentQuestionIndex] === null) {
        alert('Please select an answer before proceeding.');
        return;
    }
    
    if (currentQuestionIndex === questionsData.questions.length - 1) {
        calculatePersonality();
    } else {
        currentQuestionIndex++;
        renderQuestion();
        updateProgress();
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
        updateProgress();
    }
}

function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / questionsData.questions.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
}

function calculatePersonality() {
    // Count trait frequencies
    const traitScores = {};
    
    for (let i = 0; i < userAnswers.length; i++) {
        const answerIndex = userAnswers[i];
        if (answerIndex !== null) {
            const trait = questionsData.questions[i].options[answerIndex].trait;
            traitScores[trait] = (traitScores[trait] || 0) + 1;
        }
    }
    
    // Determine top traits (at least 3, max 5)
    const sortedTraits = Object.entries(traitScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    // Generate personality description
    const primaryTrait = sortedTraits[0][0];
    const personalityDesc = questionsData.personality_types[primaryTrait] || 
        `Based on your answers, your dominant trait is ${primaryTrait}. You show a unique blend of characteristics that make you who you are.`;
    
    // Display results
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('result-container').style.display = 'block';
    
    const traitsContainer = document.getElementById('personality-traits');
    traitsContainer.innerHTML = sortedTraits.map(([trait, count]) => 
        `<span class="trait-badge">${trait.toUpperCase()} (${count})</span>`
    ).join('');
    
    document.getElementById('personality-description').innerHTML = `
        <strong>Your Primary Personality: ${primaryTrait.toUpperCase()}</strong><br><br>
        ${personalityDesc}<br><br>
        <strong>Additional traits you possess:</strong><br>
        ${sortedTraits.slice(1).map(([trait]) => `• ${trait}`).join('<br>')}
    `;
}

function restartQuiz() {
    currentQuestionIndex = 0;
    userAnswers = new Array(questionsData.questions.length).fill(null);
    document.getElementById('quiz-container').style.display = 'block';
    document.getElementById('result-container').style.display = 'none';
    renderQuestion();
    updateProgress();
}

// Event listeners
document.getElementById('next-btn').addEventListener('click', nextQuestion);
document.getElementById('prev-btn').addEventListener('click', prevQuestion);
document.getElementById('restart-btn').addEventListener('click', restartQuiz);

// Load the quiz
loadQuestions();