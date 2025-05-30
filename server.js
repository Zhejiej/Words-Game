const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// static assets
app.use(express.static(path.join(__dirname, 'Words-Game')));

const words = fs.readFileSync('Words-Game/5WORDS.txt', 'utf8').split('\n').map(w => w.trim().toLowerCase());

let players = new Map(); // socket.id => { socket, word }
const DICTIONARY_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";


let gameStartTime = null;
const GAME_DURATION_MS = 3 * 60 * 1000; // 3 minutes
const WORD_LENGTH = 5;
let gameTimeout = null;
let sharedWordSequence = [];
const MAX_WORDS = 100;

io.on('connection', socket => {
    // Clean up disconnected sockets
    players.forEach((playerData, id) => {
        if (!playerData.socket.connected) {
            players.delete(id);
        }
    });

    if (players.size >= 2) {
        socket.emit('roomFull', 'Only 2 players allowed.');
        socket.disconnect(true);
        return;
    }

    const playerNum = players.size;
    players.set(socket.id, { socket, word: null, playerNum, score: 0 });
    console.log(`Player ${playerNum} connected: ${socket.id}`);
    socket.emit('welcome', { playerNum });


    if (players.size === 2) {
        console.log(`Both players connected.`);

        sharedWordSequence = generateWordSequence();

        gameStartTime = Date.now();
        players.forEach((playerData, id) => {
            playerData.wordIndex = 0;
            playerData.word = sharedWordSequence[0];

            playerData.socket.emit('startGame', {
                word: sharedWordSequence[0],
                startTime: gameStartTime,
                duration: GAME_DURATION_MS
            });
        });

        gameTimeout = setTimeout(() => {
            console.log("Game over due to timeout.");
            players.forEach(({ socket }) => {
                socket.emit('gameOver', { reason: "timeout" });
            });
            players.clear();
            gameTimeout = null;
        }, GAME_DURATION_MS);
    }

    socket.on('submitWord', async (submittedWord) => {
        const playerData = players.get(socket.id);

        if (!playerData.word) return;

        const isValid = await isValidWord(submittedWord);
        if (!isValid) {
            socket.emit('invalidWord', submittedWord);
            return;
        }

        const isCorrect = submittedWord.toLowerCase() === playerData.word.toLowerCase();

        if (isCorrect) {
            playerData.score += 1;
            playerData.wordIndex++;

            const nextWord = sharedWordSequence[playerData.wordIndex];
            console.log(`Player ${playerNum} advanced to wordIndex ${playerData.wordIndex}: "${nextWord}"`);

            if (!nextWord) {
                socket.emit('gameOver', { reason: "no more words" });
                return;
            }

            playerData.word = nextWord;

            socket.emit('correctGuess', {
                newWord: nextWord,
                score: playerData.score
            });

            socket.broadcast.emit('opponentScored', {
                playerNum,
                score: playerData.score
            });

        } else {
            const colorMap = calculateTileColors(submittedWord.split(""), playerData.word);

            // Send feedback to the submitting player
            socket.emit('wordResult', {
                valid: true,
                correct: false,
                word: submittedWord,
                colorMap
            });

            // 🔽 NEW: Send tile data to opponent
            socket.broadcast.emit('opponentGuess', {
                colorMap
            });
            
        }
    });


    socket.on('disconnect', () => {
        const playerData = players.get(socket.id);
        if (playerData) {
            console.log(`Player ${playerData.playerNum} disconnected`);
        }

        players.delete(socket.id);

        // If one player disconnects, stop the game
        if (gameTimeout) {
            clearTimeout(gameTimeout);
            gameTimeout = null;

            // Notify any remaining player the game is over
            players.forEach(({ socket }) => {
                socket.emit('gameOver', { reason: "opponent disconnected" });
            });

            players.clear();
            console.log("Game ended due to player disconnect.");
        }
    });
});


function generateWordSequence() {
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, MAX_WORDS);
}

function calculateTileColors(guessArr, correctWord) {
    const colors = Array(WORD_LENGTH).fill("grey");
    const correctLetters = correctWord.split("");
    const guess = [...guessArr];

    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guess[i] === correctLetters[i]) {
            colors[i] = "green";
            correctLetters[i] = null;
        }
    }

    for (let i = 0; i < WORD_LENGTH; i++) {
        if (colors[i] === "grey" && correctLetters.includes(guess[i])) {
            colors[i] = "yellow";
            correctLetters[correctLetters.indexOf(guess[i])] = null;
        }
    }

    return colors;
}

async function isValidWord(word) {
    try {
        const response = await fetch(DICTIONARY_URL + word);
        return response.status !== 404;
    } catch (err) {
        console.error("Error validating word:", err.message);
        return false;
    }
}


server.listen(3000, () =>
    console.log('Server running on http://localhost:3000')
);
