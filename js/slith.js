var canvas = document.getElementById('game');
var context = canvas.getContext('2d');
const loadingScreen = document.getElementById('loading');
const loadText = document.getElementById('press');
const bgMusic = document.getElementById('bgm');
const soundFX = document.getElementById('sfx');
const deadFX = document.getElementById('nuu');
const letter = document.getElementById('secret-letta');

const gameOverScreen = document.getElementById('gameOverScreen');
const continueButton = document.getElementById('continueButton');

// This object will store the position of our on-canvas "Play Again?" button
let restartButtonBounds = {};

const secretMessage = `To my sweet Kevin, 
I love you so much, but I don’t think words can honestly describe how much I love you. Thank you for everything you’ve done for me, from the big things to the little; I noticed them all. I miss you so much, and I can’t wait till the day I get to see you again. I love every moment we spend together, whether it’s pointless laughter on the phone or our silly drives around the city; you never fail to make me laugh stupid. 
Anyways happy anniversary my heart, I love you forever and always<3`;

const secretWords = secretMessage.trim().replace(/\n/g, ' <br> ').split(/ +/).filter(Boolean);
let wordsRevealed = 0;
let gameState;

var grid = 64;
var currIndex = 0;
const cols = canvas.width / grid;
const rows = canvas.height / grid;

var loadedAppleImages = [];
const imageFolderPath = 'kevin/';

var snake = {
    x: grid * Math.floor(cols / 2),
    y: grid * Math.floor(rows / 2),
    prevX: grid * Math.floor(cols / 2),
    prevY: grid * Math.floor(rows / 2),
    dx: grid,
    dy: 0,
    cells: [],
};

var apple = {
    x: grid * Math.floor(cols * 0.75),
    y: grid * Math.floor(rows * 0.75),
    img: null
};

let lastUpdateTime = 0;
const updateInterval = 150;

// --- CORE GAME LOGIC ---

function loop(currentTime) {
    requestAnimationFrame(loop);

    if (gameState === 'playing') {
        const deltaTime = currentTime - lastUpdateTime;
        if (deltaTime > updateInterval) {
            const prevX = snake.x;
            const prevY = snake.y;
            snake.x += snake.dx;
            snake.y += snake.dy;

            if (snake.x < 0) snake.x = canvas.width - grid;
            else if (snake.x >= canvas.width) snake.x = 0;
            if (snake.y < 0) snake.y = canvas.height - grid;
            else if (snake.y >= canvas.height) snake.y = 0;

            if (snake.x === apple.x && snake.y === apple.y) {
                if (soundFX) {
                  soundFX.currentTime = 0;
                  soundFX.play();
                }

                snake.cells.unshift({ x: prevX, y: prevY, img: apple.img });
                
                do {
                    if (wordsRevealed < secretWords.length) {
                        wordsRevealed++;
                    } else {
                        break;
                    }
                } while (secretWords[wordsRevealed - 1] === '<br>');
                
                if (wordsRevealed >= secretWords.length) {
                    handleGameWin();
                } else {
                    advanceToNextApple();
                }
            }

            if (snake.cells.length > 0) {
                for (let i = snake.cells.length - 1; i > 0; i--) {
                    snake.cells[i].x = snake.cells[i - 1].x;
                    snake.cells[i].y = snake.cells[i - 1].y;
                }
                snake.cells[0].x = prevX;
                snake.cells[0].y = prevY;
            }
            lastUpdateTime = currentTime;
        }
    }

    renderGame();

    if (gameState === 'playing') {
        for (const cell of snake.cells) {
            if (cell.x === snake.x && cell.y === snake.y) {
                handleGameOver();
                break;
            }
        }
    }
}

// This function now handles drawing for all game states.
function renderGame() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    // The secret message is always drawn
    drawRevealedText(context);

    // The snake and apple are ONLY drawn if the game is being played
    if (gameState === 'playing') {
        if (apple.img) {
            context.drawImage(apple.img, apple.x, apple.y, grid, grid);
        }
        snake.cells.forEach(cell => {
            if (cell.img) context.drawImage(cell.img, cell.x, cell.y, grid, grid);
        });

        context.save();
        context.translate(snake.x + grid / 2, snake.y + grid / 2);
        let angle = 0;
        if (snake.dx > 0) angle = -Math.PI / 2;
        else if (snake.dx < 0) angle = Math.PI / 2;
        else if (snake.dy > 0) angle = 0;
        context.rotate(angle);
        context.fillStyle = "red";
        drawHeart(-grid / 2, -grid / 2, grid, grid);
        context.restore();
    }

    // The endgame UI is ONLY drawn if the game is finished
    if (gameState === 'finished') {
        drawEndGameText();
        drawRestartButton();
    }
}

function handleGameOver() {
    gameState = 'gameOver';
    deadFX.play();
    bgMusic.pause();
    gameOverScreen.style.display = 'flex';
}

function continueGame() {
    gameOverScreen.style.display = 'none';
    snake.x = grid * Math.floor(cols / 2);
    snake.y = grid * Math.floor(rows / 2);
    snake.cells = [];
    snake.dx = grid;
    snake.dy = 0;
    placeApple();
    bgMusic.play();
    gameState = 'playing';
}

// This function simply triggers the end of the game.
function handleGameWin() {
    gameState = 'finished';
}

function restartGame() {
    window.location.reload();
}

// --- HELPER & SETUP FUNCTIONS ---

function drawRevealedText(context) {
    if (wordsRevealed === 0) return;

    context.fillStyle = 'black';
    context.font = '24px "Love", sans-serif';
    context.textAlign = 'center';

    const revealed = secretWords.slice(0, wordsRevealed);
    const maxWidth = canvas.width - 60;
    const lines = [];
    let currentLine = '';

    for (const word of revealed) {
        if (word === '<br>') {
            lines.push(currentLine.trim());
            currentLine = '';
            continue;
        }
        const testLine = currentLine + word + ' ';
        if (context.measureText(testLine).width > maxWidth && currentLine !== '') {
            lines.push(currentLine.trim());
            currentLine = word + ' ';
        } else {
            currentLine = testLine;
        }
    }
    if (currentLine.trim() !== '') {
        lines.push(currentLine.trim());
    }

    const lineHeight = 30;
    const x = canvas.width / 2;
    let y = 40;

    for (const line of lines) {
        if (line) {
             context.fillText(line, x, y);
        }
        y += lineHeight;
    }
}

// This new function draws the final text on the canvas
function drawEndGameText() {
    context.fillStyle = 'white';
    context.font = '32px "Eden", sans-serif';
    context.textAlign = 'center';
    context.shadowColor = 'rgba(0,0,0,0.5)';
    context.shadowBlur = 5;
    context.fillText('kisses miles away<3 ~rhea', canvas.width / 2, canvas.height - 120);
    context.shadowBlur = 0; // Reset shadow
}

// This new function draws the final "Play Again?" button on the canvas
function drawRestartButton() {
    const buttonWidth = 200;
    const buttonHeight = 50;
    const buttonX = (canvas.width - buttonWidth) / 2;
    const buttonY = canvas.height - 80;

    restartButtonBounds = { x: buttonX, y: buttonY, width: buttonWidth, height: buttonHeight };

    context.fillStyle = 'red';
    context.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    context.strokeStyle = 'white';
    context.lineWidth = 2;
    context.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

    context.fillStyle = 'white';
    context.font = '24px "Eden", sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('again?', canvas.width / 2, buttonY + buttonHeight / 2);
}

function drawHeart(x, y, width, height) {
    context.beginPath();
    const halfWidth = width / 2;
    const topY = y + height * 0.3;
    const bottomY = y + height * 0.9;
    context.moveTo(x + halfWidth, topY);
    context.bezierCurveTo(x, y, x, y + height * 0.75, x + halfWidth, bottomY);
    context.bezierCurveTo(x + width, y + height * 0.75, x + width, y, x + halfWidth, topY);
    context.closePath();
    context.fill();
}

function placeApple() {
    let newX, newY, overlaps;
    do {
        newX = getRandomInt(0, cols) * grid;
        newY = getRandomInt(0, rows) * grid;
        overlaps = false;
        if (newX === snake.x && newY === snake.y) {
            overlaps = true;
        } else {
            for (const cell of snake.cells) {
                if (cell.x === newX && cell.y === newY) {
                    overlaps = true;
                    break;
                }
            }
        }
    } while (overlaps);
    apple.x = newX;
    apple.y = newY;
}

function advanceToNextApple() {
    placeApple();
    if (loadedAppleImages.length > 0) {
        apple.img = loadedAppleImages[currIndex];
        currIndex = (currIndex + 1) % loadedAppleImages.length;
    }
}

function beginGame() {
    loadingScreen.style.display = "none";
    bgMusic.volume = 0.5;
    bgMusic.play();
    gameState = 'playing';
    requestAnimationFrame(loop);
}

async function startGame() {
  try {
    const urls = await fetchImageUrls();
    loadedAppleImages = await preloadImages(urls);
    advanceToNextApple();
    loadText.innerHTML = "<br>this lil game contains all my fav pics i have of you, hope you like <3<br><br>press any button to start<br><br><br>ps. you suck if you fail";
    window.addEventListener("keydown", beginGame, { once: true });
    continueButton.addEventListener('click', continueGame);
    // The HTML restart button is not used, so its listener is removed.
  } catch (error) {
    console.error("Failed to load images from Firebase:", error);
    alert("Could not load game images.");
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

async function fetchImageUrls() {
  const listRef = storage.ref(imageFolderPath);
  const res = await listRef.listAll();
  return Promise.all(res.items.map(itemRef => itemRef.getDownloadURL()));
}

function preloadImages(urls) {
  const promises = urls.map(url => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => { console.warn("image failed: ", url); resolve(null);}
      img.src = url;
    });
  });
  return Promise.all(promises).then(results => results.filter(img => img !== null));
}

document.addEventListener('keydown', function(e) {
    if (gameState !== 'playing') return;
    
    if (e.which === 37 && snake.dx === 0) {
        snake.dx = -grid; snake.dy = 0;
    } else if (e.which === 38 && snake.dy === 0) {
        snake.dy = -grid; snake.dx = 0;
    } else if (e.which === 39 && snake.dx === 0) {
        snake.dx = grid; snake.dy = 0;
    } else if (e.which === 40 && snake.dy === 0) {
        snake.dy = grid; snake.dx = 0;
    }
});

// This new event listener handles clicks on the canvas for the "Play Again?" button.
canvas.addEventListener('click', function(event) {
    if (gameState !== 'finished') return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (mouseX >= restartButtonBounds.x && mouseX <= restartButtonBounds.x + restartButtonBounds.width &&
        mouseY >= restartButtonBounds.y && mouseY <= restartButtonBounds.y + restartButtonBounds.height) {
        restartGame();
    }
});

startGame();