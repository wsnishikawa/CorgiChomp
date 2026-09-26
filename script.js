const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const timeElement = document.getElementById('time');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// Game state
let score = 0;
let timeLeft = 30;
let gameInterval;
let timerInterval;
let isPlaying = false;

// Entities
const corgi = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 100, // Make it big enough to see the real corgi
    speed: 7,
    wobble: 0,
    isMoving: false
};

const corgiSprite = new Image();
corgiSprite.src = 'corgi.jpg';

const bgSprite = new Image();
bgSprite.src = 'bg.jpg';

const alligatorSprite = new Image();
alligatorSprite.src = 'alligator.jpg';

const alligators = [];
const alligatorSize = 80;

// Keys
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

// Event Listeners
window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
        e.preventDefault();
    }
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

function spawnAlligator() {
    if (alligators.length < 7) { // Max 7 alligators at a time
        alligators.push({
            x: Math.random() * (canvas.width - alligatorSize),
            y: Math.random() * (canvas.height - alligatorSize)
        });
    }
}

function startGame() {
    score = 0;
    timeLeft = 30;
    alligators.length = 0;
    corgi.x = canvas.width / 2;
    corgi.y = canvas.height / 2;
    
    scoreElement.textContent = score;
    timeElement.textContent = timeLeft;
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    isPlaying = true;
    
    // Spawn initial alligators
    for(let i=0; i<4; i++) spawnAlligator();
    
    timerInterval = setInterval(() => {
        timeLeft--;
        timeElement.textContent = timeLeft;
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
    
    gameLoop();
}

function endGame() {
    isPlaying = false;
    clearInterval(timerInterval);
    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

function update() {
    corgi.isMoving = false;
    // Move Corgi
    if (keys.ArrowUp && corgi.y > 0) { corgi.y -= corgi.speed; corgi.isMoving = true; }
    if (keys.ArrowDown && corgi.y < canvas.height - corgi.size) { corgi.y += corgi.speed; corgi.isMoving = true; }
    if (keys.ArrowLeft && corgi.x > 0) { corgi.x -= corgi.speed; corgi.isMoving = true; }
    if (keys.ArrowRight && corgi.x < canvas.width - corgi.size) { corgi.x += corgi.speed; corgi.isMoving = true; }
    
    if (corgi.isMoving) {
        corgi.wobble += 0.4;
    } else {
        corgi.wobble = 0; // reset
    }

    // Check collisions
    for (let i = alligators.length - 1; i >= 0; i--) {
        const gator = alligators[i];
        
        // Simple bounding box collision
        if (corgi.x < gator.x + alligatorSize &&
            corgi.x + corgi.size > gator.x &&
            corgi.y < gator.y + alligatorSize &&
            corgi.y + corgi.size > gator.y) {
            
            // Collect alligator
            alligators.splice(i, 1);
            score++;
            scoreElement.textContent = score;
            
            // Pop effect
            const sb = document.querySelector('.score-board');
            sb.style.transform = 'scale(1.2)';
            setTimeout(() => sb.style.transform = 'scale(1)', 100);
            
            // Spawn new alligator
            spawnAlligator();
        }
    }
    
    // Randomly spawn more alligators occasionally
    if (Math.random() < 0.03) {
        spawnAlligator();
    }
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    if (bgSprite.complete) {
        ctx.drawImage(bgSprite, 0, 0, canvas.width, canvas.height);
    }
    
    // Use multiply to remove white backgrounds
    ctx.globalCompositeOperation = 'multiply';
    
    // Draw alligators
    alligators.forEach(gator => {
        if (alligatorSprite.complete) {
            ctx.drawImage(alligatorSprite, gator.x, gator.y, alligatorSize, alligatorSize);
        }
    });
    
    // Draw corgi
    ctx.save();
    
    let offsetY = 0;
    let rotation = 0;
    let scaleY = 1;
    
    if (corgi.isMoving) {
        // Bobbing up and down
        offsetY = Math.abs(Math.sin(corgi.wobble)) * -10;
        // Slight rotation to simulate steps
        rotation = Math.cos(corgi.wobble) * 0.1;
        // Squish slightly on landing
        scaleY = 1 + Math.sin(corgi.wobble * 2) * 0.05;
    }
    
    // Draw simple shadow under corgi (using normal blend mode so it shows properly)
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    // Shadow shrinks when corgi is in the air
    const shadowWidth = corgi.size * 0.6 + (offsetY * 2);
    ctx.ellipse(corgi.x + corgi.size/2, corgi.y + corgi.size - 5, shadowWidth/2, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Restore multiply blend mode for the corgi sprite
    ctx.globalCompositeOperation = 'multiply';
    
    // Translate to center of corgi for rotation
    ctx.translate(corgi.x + corgi.size/2, corgi.y + corgi.size/2 + offsetY);
    ctx.rotate(rotation);
    ctx.scale(1, scaleY);
    
    // Flip horizontally if moving left
    if (keys.ArrowLeft) {
        ctx.scale(-1, 1);
    }
    
    if (corgiSprite.complete) {
        ctx.drawImage(corgiSprite, -corgi.size/2, -corgi.size/2, corgi.size, corgi.size);
    }
    
    ctx.restore();
    
    ctx.globalCompositeOperation = 'source-over'; // Reset
}

function gameLoop() {
    if (!isPlaying) return;
    
    update();
    draw();
    
    requestAnimationFrame(gameLoop);
}
