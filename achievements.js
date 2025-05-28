// Achievements data structure
const achievements = [
    {
        id: 'first_win',
        title: 'First Win',
        description: 'Win your first game',
        rarity: 'common',
        icon: '🏆'
    },
    {
        id: 'one_week_streak',
        title: 'One Week Streak',
        description: 'Play and win for 7 consecutive days',
        rarity: 'uncommon',
        icon: '📅'
    },
    {
        id: 'one_month_streak',
        title: 'One Month Streak',
        description: 'Play and win for 30 consecutive days',
        rarity: 'rare',
        icon: '🗓️'
    },
    {
        id: 'one_year_streak',
        title: 'One Year Streak',
        description: 'Play and win for 365 consecutive days',
        rarity: 'precious',
        icon: '🎖️'
    },
    {
        id: 'first_guess',
        title: 'First Try',
        description: 'Guess the word correctly on your first try',
        rarity: 'precious',
        icon: '🎯'
    },
    {
        id: 'clutch_guess',
        title: 'Clutch Guess',
        description: 'Win on your very last guess',
        rarity: 'rare',
        icon: '😅'
    },
    {
        id: 'comeback',
        title: 'Comeback',
        description: 'First three guesses have 0 correct letters but still win at the end',
        rarity: 'rare',
        icon: '🔄'
    },
    {
        id: 'gambler',
        title: 'Gambler',
        description: 'Use the same first guess for a whole week',
        rarity: 'rare',
        icon: '🎲'
    },
    {
        id: 'freeze',
        title: 'Freeze',
        description: 'Spend over an hour on one game',
        rarity: 'uncommon',
        icon: '❄️'
    },
    {
        id: 'zero_green',
        title: 'Zero Green',
        description: 'Win a game without ever getting a green tile until the final guess',
        rarity: 'rare',
        icon: '🟩'
    },
    {
        id: 'sixth_sense',
        title: 'Sixth Sense',
        description: 'Solve in exactly 6 guesses, 6 days in a row',
        rarity: 'rare',
        icon: '6️⃣'
    },
    {
        id: 'one_and_done',
        title: 'One and Done',
        description: 'Only make one total guess today — win or lose',
        rarity: 'uncommon',
        icon: '1️⃣'
    },
    {
        id: 'blacked_out',
        title: 'Blacked Out',
        description: 'Lose a game with only gray tiles',
        rarity: 'uncommon',
        icon: '⬛'
    }
];

// Achievement notification queue
const achievementQueue = [];
let isShowingAchievement = false;

// Load user achievements from localStorage
function loadUserAchievements() {
    try {
        const saved = localStorage.getItem("userAchievements");
        return saved ? JSON.parse(saved) : {};
    } catch (e) {
        console.error('Error loading achievements:', e);
        return {};
    }
}

// Save user achievements to localStorage
function saveUserAchievements(userAchievements) {
    try {
        localStorage.setItem("userAchievements", JSON.stringify(userAchievements));
    } catch (e) {
        console.error('Error saving achievements:', e);
    }
}

// Unlock an achievement
function unlockAchievement(achievementId) {
    const userAchievements = loadUserAchievements();
    
    // If achievement is not already unlocked
    if (!userAchievements[achievementId]) {
        userAchievements[achievementId] = {
            unlocked: true,
            date: new Date().toISOString()
        };
        
        saveUserAchievements(userAchievements);
        
        // Add achievement to notification queue
        const achievement = achievements.find(a => a.id === achievementId);
        if (achievement) {
            queueAchievementNotification(achievement);
        }
    }
}

// Queue an achievement notification
function queueAchievementNotification(achievement) {
    achievementQueue.push(achievement);
    processAchievementQueue();
}

// Process the achievement notification queue
function processAchievementQueue() {
    if (isShowingAchievement || achievementQueue.length === 0) {
        return;
    }
    
    isShowingAchievement = true;
    const achievement = achievementQueue.shift();
    showAchievementNotification(achievement);
}

// Show achievement notification
function showAchievementNotification(achievement) {
    const notification = document.getElementById('notification');
    if (notification) {
        // Clear any existing content and classes
        notification.innerHTML = `
            <div class="achievement-notification">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-title">Achievement Unlocked: ${achievement.title}</div>
                    <div class="achievement-description">${achievement.description}</div>
                </div>
            </div>
        `;
        
        // Force a reflow to ensure animations work correctly if notifications are in quick succession
        notification.offsetHeight;
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
            
            // After notification is removed, wait a short time before showing the next one
            setTimeout(() => {
                isShowingAchievement = false;
                processAchievementQueue();
            }, 500); // Small gap between notifications
        }, 5000);
    } else {
        // If notification element doesn't exist, move to the next achievement
        console.error('Notification element not found');
        isShowingAchievement = false;
        setTimeout(processAchievementQueue, 100);
    }
}

// Toggle achievements panel
function toggleAchievementsPanel() {
    const panel = document.getElementById('achievements-panel');
    const overlay = document.getElementById('menu-overlay');
    
    if (panel) {
        panel.classList.toggle('visible');
        
        if (panel.classList.contains('visible')) {
            overlay.classList.add('visible');
            renderAchievements();
        } else {
            overlay.classList.remove('visible');
        }
    }
}

// Close achievements panel
function closeAchievementsPanel() {
    const panel = document.getElementById('achievements-panel');
    const overlay = document.getElementById('menu-overlay');
    
    if (panel) {
        panel.classList.remove('visible');
        overlay.classList.remove('visible');
    }
}

// Render achievements in the panel
function renderAchievements() {
    const achievementsList = document.querySelector('.achievements-list');
    if (!achievementsList) return;
    
    // Clear existing achievements
    achievementsList.innerHTML = '';
    
    // Get user achievements
    const userAchievements = loadUserAchievements();
    
    // Render each achievement
    achievements.forEach(achievement => {
        const isUnlocked = userAchievements[achievement.id]?.unlocked || false;
        
        const achievementElement = document.createElement('div');
        achievementElement.className = `achievement-item achievement-${achievement.rarity} ${!isUnlocked ? 'achievement-locked' : ''}`;
        
        achievementElement.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-description">${achievement.description}</div>
            </div>
        `;
        
        achievementsList.appendChild(achievementElement);
    });
}

// Helper function to get today's date string
function getTodayDateString() {
    return new Date().toISOString().split('T')[0];
}

// Helper function to get game statistics
function getGameStats() {
    try {
        const saved = localStorage.getItem("gameStats");
        return saved ? JSON.parse(saved) : {
            streakData: [],
            firstGuesses: [],
            sixthSenseData: [],
            totalGamesToday: 0,
            lastPlayDate: null,
            gameStartTime: null
        };
    } catch (e) {
        console.error('Error loading game stats:', e);
        return {
            streakData: [],
            firstGuesses: [],
            sixthSenseData: [],
            totalGamesToday: 0,
            lastPlayDate: null,
            gameStartTime: null
        };
    }
}

// Helper function to save game statistics
function saveGameStats(stats) {
    try {
        localStorage.setItem("gameStats", JSON.stringify(stats));
    } catch (e) {
        console.error('Error saving game stats:', e);
    }
}

// Helper function to update streak data
function updateStreakData(won) {
    const stats = getGameStats();
    const today = getTodayDateString();
    
    // Remove today's entry if it exists (in case of multiple games per day)
    stats.streakData = stats.streakData.filter(entry => entry.date !== today);
    
    // Add today's result
    stats.streakData.push({
        date: today,
        won: won
    });
    
    // Keep only last 365 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 365);
    const cutoffString = cutoffDate.toISOString().split('T')[0];
    
    stats.streakData = stats.streakData.filter(entry => entry.date >= cutoffString);
    
    saveGameStats(stats);
    return stats;
}

// Helper function to calculate current win streak
function getCurrentWinStreak(streakData) {
    if (!streakData || streakData.length === 0) return 0;
    
    // Sort by date descending
    const sorted = streakData.slice().sort((a, b) => b.date.localeCompare(a.date));
    
    let streak = 0;
    for (const entry of sorted) {
        if (entry.won) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

// Helper function to track first guesses
function trackFirstGuess(firstGuess) {
    const stats = getGameStats();
    const today = getTodayDateString();
    
    // Add today's first guess
    stats.firstGuesses = stats.firstGuesses.filter(entry => entry.date !== today);
    stats.firstGuesses.push({
        date: today,
        guess: firstGuess.toLowerCase()
    });
    
    // Keep only last 7 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);
    const cutoffString = cutoffDate.toISOString().split('T')[0];
    
    stats.firstGuesses = stats.firstGuesses.filter(entry => entry.date >= cutoffString);
    
    saveGameStats(stats);
    return stats;
}

// Helper function to track sixth sense achievement
function trackSixthSense(guessCount) {
    const stats = getGameStats();
    const today = getTodayDateString();
    
    // Add today's guess count if it's exactly 6
    if (guessCount === 6) {
        stats.sixthSenseData = stats.sixthSenseData.filter(entry => entry.date !== today);
        stats.sixthSenseData.push({
            date: today,
            guessCount: 6
        });
        
        // Keep only last 6 days
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 6);
        const cutoffString = cutoffDate.toISOString().split('T')[0];
        
        stats.sixthSenseData = stats.sixthSenseData.filter(entry => entry.date >= cutoffString);
        
        saveGameStats(stats);
    }
    
    return stats;
}

// Check for achievements to unlock
function checkForAchievements(gameState) {
    if (!gameState) return;
    
    console.log('=== ACHIEVEMENT CHECK START ===');
    console.log('Game State:', gameState);
    
    const today = getTodayDateString();
    const stats = getGameStats();
    
    // Update total games today counter
    if (stats.lastPlayDate !== today) {
        stats.totalGamesToday = 1;
        stats.lastPlayDate = today;
    } else {
        stats.totalGamesToday++;
    }
    saveGameStats(stats);
    
    // 1. First Win - Win your first game
    if (gameState.won) {
        const userAchievements = loadUserAchievements();
        if (!userAchievements['first_win']) {
            unlockAchievement('first_win');
        }
    }
    
    // 2. First Try - Guess the word correctly on your first try
    if (gameState.won && gameState.guessCount === 1) {
        unlockAchievement('first_guess');
    }
    
    // 3. Clutch Guess - Win on your very last guess
    if (gameState.won && gameState.guessCount === gameState.maxGuesses) {
        unlockAchievement('clutch_guess');
    }
    
    // 4. Comeback - First three guesses have 0 correct or present letters but still win at the end
    if (gameState.won && gameState.guessHistory && gameState.guessHistory.length >= 4) {
        console.log('=== COMEBACK CHECK ===');
        const firstThreeGuesses = gameState.guessHistory.slice(0, 3);
        console.log('First 3 guesses for comeback:', firstThreeGuesses);
        
        let hasAnyCorrectOrPresent = false;
        
        for (let guessIndex = 0; guessIndex < firstThreeGuesses.length; guessIndex++) {
            const guess = firstThreeGuesses[guessIndex];
            for (let letterIndex = 0; letterIndex < guess.length; letterIndex++) {
                const letter = guess[letterIndex];
                console.log(`Comeback - Guess ${guessIndex + 1}, Letter ${letterIndex + 1}:`, letter);
                
                if (letter.state === 'correct' || letter.state === 'present') {
                    hasAnyCorrectOrPresent = true;
                    console.log('Comeback - Found correct/present letter, blocking achievement');
                    break;
                }
            }
            if (hasAnyCorrectOrPresent) break;
        }
        
        console.log('Comeback - Has any correct/present in first 3:', hasAnyCorrectOrPresent);
        
        if (!hasAnyCorrectOrPresent) {
            console.log('UNLOCKING: comeback');
            unlockAchievement('comeback');
        }
    }
    
    // 5. Zero Green - Win a game without ever getting a green tile until the final guess
    if (gameState.won && gameState.guessHistory && gameState.guessHistory.length > 1) {
        console.log('=== ZERO GREEN CHECK ===');
        const allButLastGuesses = gameState.guessHistory.slice(0, -1);
        console.log('All but last guesses for zero green:', allButLastGuesses);
        
        let hasAnyGreenBeforeEnd = false;
        
        for (let guessIndex = 0; guessIndex < allButLastGuesses.length; guessIndex++) {
            const guess = allButLastGuesses[guessIndex];
            for (let letterIndex = 0; letterIndex < guess.length; letterIndex++) {
                const letter = guess[letterIndex];
                console.log(`Zero Green - Guess ${guessIndex + 1}, Letter ${letterIndex + 1}:`, letter);
                
                if (letter.state === 'correct') {
                    hasAnyGreenBeforeEnd = true;
                    console.log('Zero Green - Found green letter, blocking achievement');
                    break;
                }
            }
            if (hasAnyGreenBeforeEnd) break;
        }
        
        console.log('Zero Green - Has any green before end:', hasAnyGreenBeforeEnd);
        
        if (!hasAnyGreenBeforeEnd) {
            console.log('UNLOCKING: zero_green');
            unlockAchievement('zero_green');
        }
    }
    
    // 6. Blacked Out - Lose a game with only gray tiles
    if (!gameState.won && gameState.guessHistory) {
        const allGrayTiles = gameState.guessHistory.every(guess =>
            guess.every(letter => letter.state === 'absent')
        );
        
        if (allGrayTiles) {
            unlockAchievement('blacked_out');
        }
    }
    
    // 7. One and Done - Only make one total guess today — win or lose
    if (stats.totalGamesToday === 1 && gameState.guessCount === 1) {
        unlockAchievement('one_and_done');
    }
    
    // 8. Freeze - Spend over an hour on one game
    if (gameState.gameStartTime) {
        const gameEndTime = Date.now();
        const gameTimeMs = gameEndTime - gameState.gameStartTime;
        const gameTimeHours = gameTimeMs / (1000 * 60 * 60);
        
        if (gameTimeHours > 1) {
            unlockAchievement('freeze');
        }
    }
    
    // Update streak data for streak-based achievements
    if (gameState.won) {
        const updatedStats = updateStreakData(true);
        const currentStreak = getCurrentWinStreak(updatedStats.streakData);
        
        // 9. One Week Streak - Play and win for 7 consecutive days
        if (currentStreak >= 7) {
            unlockAchievement('one_week_streak');
        }
        
        // 10. One Month Streak - Play and win for 30 consecutive days
        if (currentStreak >= 30) {
            unlockAchievement('one_month_streak');
        }
        
        // 11. One Year Streak - Play and win for 365 consecutive days
        if (currentStreak >= 365) {
            unlockAchievement('one_year_streak');
        }
        
        // 12. Sixth Sense - Solve in exactly 6 guesses, 6 days in a row
        if (gameState.guessCount === 6) {
            const sixthSenseStats = trackSixthSense(6);
            if (sixthSenseStats.sixthSenseData.length >= 6) {
                const sorted = sixthSenseStats.sixthSenseData.slice().sort((a, b) => a.date.localeCompare(b.date));
                let consecutive = true;
                for (let i = 1; i < sorted.length; i++) {
                    const prevDate = new Date(sorted[i-1].date);
                    const currDate = new Date(sorted[i].date);
                    const dayDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);
                    if (dayDiff !== 1) {
                        consecutive = false;
                        break;
                    }
                }
                if (consecutive) {
                    unlockAchievement('sixth_sense');
                }
            }
        }
    } else {
        updateStreakData(false);
    }
    
    // 13. Gambler - Use the same first guess for a whole week
    if (gameState.guessHistory && gameState.guessHistory.length > 0) {
        const firstGuess = gameState.guessHistory[0].map(letter => letter.letter).join('');
        const firstGuessStats = trackFirstGuess(firstGuess);
        
        if (firstGuessStats.firstGuesses.length >= 7) {
            const allSameGuess = firstGuessStats.firstGuesses.every(entry => 
                entry.guess === firstGuess.toLowerCase()
            );
            
            if (allSameGuess) {
                unlockAchievement('gambler');
            }
        }
    }
    
    console.log('=== ACHIEVEMENT CHECK END ===');
}

// Initialize achievements
function initAchievements() {
    // Add notification wrapper if not exists
    if (!document.getElementById('notification-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.id = 'notification-wrapper';
        
        const notification = document.createElement('div');
        notification.id = 'notification';
        
        wrapper.appendChild(notification);
        document.body.appendChild(wrapper);
    }
    
    // Add overlay if not exists
    if (!document.getElementById('menu-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'menu-overlay';
        overlay.className = 'menu-overlay';
        overlay.addEventListener('click', closeAchievementsPanel);
        document.body.appendChild(overlay);
    }
    
    // Add achievements panel if not exists
    if (!document.getElementById('achievements-panel')) {
        const panel = document.createElement('div');
        panel.id = 'achievements-panel';
        
        panel.innerHTML = `
            <button class="achievements-close" onclick="closeAchievementsPanel()">&times;</button>
            <h2>Achievements</h2>
            <div class="achievements-list"></div>
        `;
        
        document.body.appendChild(panel);
    }
    
    // Add achievements button if not exists
    if (!document.getElementById('achievements-btn')) {
        const header = document.querySelector('header') || document.querySelector('.header') || document.querySelector('#header');
        
        if (header) {
            const button = document.createElement('button');
            button.id = 'achievements-btn';
            button.className = 'achievements-btn';
            button.textContent = 'achievements';
            button.addEventListener('click', toggleAchievementsPanel);
            
            header.appendChild(button);
        }
    }
}

// Add CSS to head if not already included
function addAchievementsCSS() {
    // Check if achievement CSS is already loaded
    if (!document.querySelector('link[href="achievements.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'achievements.css';
        document.head.appendChild(link);
    }
}

// Event listeners for achievements testing
document.addEventListener('DOMContentLoaded', function() {
    addAchievementsCSS();
    initAchievements();
    
    // Example of DOM event listening for achievements
    document.body.addEventListener('gamewon', function(e) {
        if (e.detail) {
            checkForAchievements(e.detail);
        }
    });
    
    document.body.addEventListener('gamelost', function(e) {
        if (e.detail) {
            checkForAchievements(e.detail);
        }
    });
});

// Create a global Achievements object
window.Achievements = {
    achievements: achievements,
    unlockAchievement: unlockAchievement,
    loadUserAchievements: loadUserAchievements,
    saveUserAchievements: saveUserAchievements,
    showAchievementNotification: showAchievementNotification,
    queueAchievementNotification: queueAchievementNotification,
    renderAchievements: renderAchievements,
    checkForAchievements: checkForAchievements,
    toggleAchievementsPanel: toggleAchievementsPanel,
    closeAchievementsPanel: closeAchievementsPanel,
    getGameStats: getGameStats,
    saveGameStats: saveGameStats,
    updateStreakData: updateStreakData,
    getCurrentWinStreak: getCurrentWinStreak,
    trackFirstGuess: trackFirstGuess,
    trackSixthSense: trackSixthSense,
    getTodayDateString: getTodayDateString
}; 