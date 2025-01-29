// Rank Configuration
const ranks = [
    { name: "Unranked", timer: 0, emblem: "ranks/unranked.png", threshold: 0 },
    { name: "Iron", timer: 300, emblem: "ranks/iron.png", threshold: 10 },
    { name: "Bronze", timer: 240, emblem: "ranks/bronze.png", threshold: 20 },
    { name: "Silver", timer: 180, emblem: "ranks/silver.png", threshold: 30 },
    { name: "Gold", timer: 120, emblem: "ranks/gold.png", threshold: 40 },
    { name: "Emerald", timer: 60, emblem: "ranks/emerald.png", threshold: 50 },
    { name: "Platinum", timer: 30, emblem: "ranks/platinum.png", threshold: 60 },
    { name: "Diamond", timer: 20, emblem: "ranks/diamond.png", threshold: 70 },
    { name: "Master", timer: 10, emblem: "ranks/master.png", threshold: 80 },
    { name: "Grandmaster", timer: 5, emblem: "ranks/grandmaster.png", threshold: 90 },
    { name: "Challenger", timer: 3, emblem: "ranks/challenger.png", threshold: 100 }
];

// Game State
let gameState = {
    currentRankIndex: 0,
    correctGuessesInRow: 0,
    totalCorrectGuesses: 0,
    timerInterval: null,
    currentTimer: 0,
    isHardMode: false,
    hp: 100,
    isRankedMode: false,
    remainingSkins: [],
    currentSkin: null
};

// DOM Elements
const elements = {
    skinImage: document.getElementById('skin-image'),
    guessInput: document.getElementById('guess-input'),
    timerDisplay: document.getElementById('time'),
    rankEmblem: document.getElementById('rank-emblem'),
    rankName: document.getElementById('rank-name'),
    progressCounter: document.getElementById('progress-counter'),
    hpBar: document.getElementById('hp-bar'),
    hpContainer: document.getElementById('hp-bar-container'),
    hpText: document.getElementById('hp-text'),
    feedback: document.getElementById('feedback'),
    hardModeToggle: document.getElementById('hard-mode-toggle'),
    loadingScreen: document.getElementById('loading-screen'),
    rankUpModal: document.getElementById('rank-up-modal'),
    rankUpEmblem: document.getElementById('rank-up-emblem'),
    rankUpTitle: document.getElementById('rank-up-title'),
    rankUpMessage: document.getElementById('rank-up-message'),
    continueButton: document.getElementById('continue-button'),
    quitButton: document.getElementById('quit-button'),
    gameOverModal: document.getElementById('game-over-modal'),
    gameOverMessage: document.getElementById('game-over-message'),
    finalStats: document.getElementById('final-stats'),
    restartButton: document.getElementById('restart-button')
};

// Initialize Game
initGame();

// Event Listeners
elements.guessInput.addEventListener('keypress', handleGuess);
elements.hardModeToggle.addEventListener('click', toggleHardMode);
elements.continueButton.addEventListener('click', continueGame);
elements.quitButton.addEventListener('click', quitGame);
elements.restartButton.addEventListener('click', restartGame);

// Functions
async function initGame() {
    showLoadingScreen();
    await generateValidSkinList();
    hideLoadingScreen();
    newSkin();
    updateRankDisplay();
}

function showLoadingScreen() {
    elements.loadingScreen.style.display = 'flex';
}

function hideLoadingScreen() {
    elements.loadingScreen.style.display = 'none';
}

// Updated generateValidSkinList function
async function generateValidSkinList() {
    gameState.remainingSkins = [];

    // Updated list: Only Female Champions
    const champions = [
        "Ahri",
        "Akali",
        "Anivia",
        "Annie",
        "Ashe",
        "Belveth",
        "Caitlyn",
        "Camille",
        "Cassiopeia",
        "Diana",
        "Elise",
        "Evelynn",
        "Fiora",
        "Illaoi",
        "Irelia",
        "Janna",
        "Jinx",
        "KaiSa",
        "Kalista",
        "Karma",
        "Katarina",
        "Kayle",
        "Kindred",
        "LeBlanc",
        "Leona",
        "Lillia",
        "Lissandra",
        "Lux",
        "Miss Fortune",
        "Morgana",
        "Nami",
        "Neeko",
        "Nidalee",
        "Nilah",
        "Orianna",
        "Poppy",
        "Qiyana",
        "Quinn",
        "Rell",
        "RenataGlasc",
        "Riven",
        "Samira",
        "Sejuani",
        "Senna",
        "Seraphine",
        "Shyvana",
        "Sivir",
        "Sona",
        "Soraka",
        "Syndra",
        "Taliyah",
        "Tristana",
        "Vayne",
        "Vi",
        "Yuumi",
        "Zeri",
        "Zoe",
        "Zyra"
    ];

    const skinPromises = [];

    for (let champion of champions) {
        for (let i = 1; i <= 20; i++) { // Adjust the max number as needed based on actual skin counts
            const skinPromise = new Promise((resolve) => {
                const img = new Image();
                img.src = `skins/${champion}__${i}.jpg`; // Ensure this path is correct
                
                img.onload = () => {
                    gameState.remainingSkins.push({
                        name: champion,
                        imageUrl: `skins/${champion}__${i}.jpg` // Ensure this path is correct
                    });
                    resolve();
                };
                
                img.onerror = () => {
                    // If the skin image doesn't exist, skip it
                    console.warn(`Skin image not found: skins/${champion}__${i}.jpg`);
                    resolve(); // Resolve even if the image fails to load
                };
            });
            skinPromises.push(skinPromise);
        }
    }

    await Promise.all(skinPromises);

    // Shuffle the skins array
    gameState.remainingSkins.sort(() => Math.random() - 0.5);
}

function newSkin() {
    if (gameState.remainingSkins.length === 0) {
        generateValidSkinList();
    }
    gameState.currentSkin = gameState.remainingSkins.pop();
    elements.skinImage.src = gameState.currentSkin.imageUrl;
}

function handleGuess(event) {
    if (event.key !== 'Enter') return;
    
    const guess = elements.guessInput.value.trim().toLowerCase();
    const correctName = gameState.currentSkin.name.toLowerCase();
    
    // Handle special cases for champion names with spaces or special characters
    const correct = (guess === correctName || 
                    guess === correctName.replace(/\s+/g, '') ||
                    guess === correctName.replace(/\s+/g, '-'));
    
    if (correct) {
        handleCorrectGuess();
    } else {
        handleWrongGuess();
    }
    
    elements.guessInput.value = '';
}

function handleCorrectGuess() {
    gameState.correctGuessesInRow++;
    gameState.totalCorrectGuesses++;
    
    showFeedback(true);
    checkRankProgress();
    resetTimer();
    newSkin();
}

function handleWrongGuess() {
    gameState.correctGuessesInRow = 0;
    showFeedback(false);
    
    if (gameState.isRankedMode) {
        reduceHP();
        skipTimer();
    }
}

function showFeedback(isCorrect) {
    elements.feedback.textContent = isCorrect ? 'Correct!' : 'Wrong!';
    elements.feedback.className = isCorrect ? 'correct' : 'wrong';
    
    setTimeout(() => {
        elements.feedback.textContent = '';
        elements.feedback.className = '';
    }, 1500);
}

function checkRankProgress() {
    const nextRank = ranks[gameState.currentRankIndex + 1];
    if (nextRank && gameState.correctGuessesInRow >= nextRank.threshold) {
        rankUp();
    }
    updateRankDisplay();
}

function rankUp() {
    gameState.currentRankIndex++;
    const newRank = ranks[gameState.currentRankIndex];
    
    if (gameState.currentRankIndex === 1) { // Iron rank achieved
        startRankedMode();
    }
    
    showRankUpModal(newRank);
}

function startRankedMode() {
    gameState.isRankedMode = true;
    elements.hpContainer.classList.remove('hidden');
    resetTimer();
    startTimer();
}

function showRankUpModal(rank) {
    elements.rankUpEmblem.src = rank.emblem;
    elements.rankUpTitle.textContent = `Welcome to ${rank.name}!`;
    elements.rankUpMessage.textContent = `You've reached ${rank.name} rank! The timer is now ${rank.timer} seconds.`;
    elements.rankUpModal.style.display = 'flex';
}

function updateRankDisplay() {
    const currentRank = ranks[gameState.currentRankIndex];
    elements.rankEmblem.src = currentRank.emblem;
    elements.rankName.textContent = currentRank.name;
    elements.progressCounter.textContent = `${gameState.correctGuessesInRow}/${ranks[gameState.currentRankIndex + 1]?.threshold || 'MAX'}`;
}

function toggleHardMode() {
    gameState.isHardMode = !gameState.isHardMode;
    document.body.classList.toggle('hard-mode');
    elements.hardModeToggle.textContent = `Hard Mode: ${gameState.isHardMode ? 'ON' : 'OFF'}`;
}

function startTimer() {
    if (gameState.timerInterval) clearInterval(gameState.timerInterval);
    gameState.timerInterval = setInterval(updateTimer, 1000);
}

function resetTimer() {
    if (gameState.isRankedMode) {
        const currentRank = ranks[gameState.currentRankIndex];
        gameState.currentTimer = currentRank.timer;
        updateTimerDisplay();
    }
}

function updateTimer() {
    if (gameState.currentTimer > 0) {
        gameState.currentTimer--;
        updateTimerDisplay();
        
        if (gameState.currentTimer === 0) {
            endGame("Time's up!");
        }
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(gameState.currentTimer / 60);
    const seconds = gameState.currentTimer % 60;
    elements.timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function skipTimer() {
    if (gameState.isRankedMode) {
        gameState.currentTimer = Math.max(0, gameState.currentTimer - 3);
        updateTimerDisplay();
    }
}

function reduceHP() {
    gameState.hp = Math.max(0, gameState.hp - 10);
    elements.hpBar.style.width = `${gameState.hp}%`;
    elements.hpText.textContent = `${gameState.hp} HP`;
    
    if (gameState.hp <= 0) {
        endGame("You ran out of HP!");
    }
}

function endGame(reason) {
    clearInterval(gameState.timerInterval);
    showGameOverModal(reason);
}

function showGameOverModal(reason) {
    elements.gameOverMessage.textContent = reason;
    elements.finalStats.textContent = `Final Score: ${gameState.totalCorrectGuesses} skins guessed correctly\nHighest Rank: ${ranks[gameState.currentRankIndex].name}`;
    elements.gameOverModal.style.display = 'flex';
}

function continueGame() {
    elements.rankUpModal.style.display = 'none';
    newSkin();
}

function quitGame() {
    elements.rankUpModal.style.display = 'none';
    restartGame();
}

function restartGame() {
    gameState = {
        currentRankIndex: 0,
        correctGuessesInRow: 0,
        totalCorrectGuesses: 0,
        timerInterval: null,
        currentTimer: 0,
        isHardMode: false,
        hp: 100,
        isRankedMode: false,
        remainingSkins: [],
        currentSkin: null
    };
    
    elements.gameOverModal.style.display = 'none';
    elements.hpContainer.classList.add('hidden');
    document.body.classList.remove('hard-mode');
    elements.hardModeToggle.textContent = 'Hard Mode: OFF';
    
    clearInterval(gameState.timerInterval);
    initGame();
}
