const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const scoreDisplay = document.getElementById("score");
const finalScoreDisplay = document.getElementById("finalScore");
const bestScoreDisplay = document.getElementById("bestScore");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const flapSound = document.getElementById("flapSound");
const scoreSound = document.getElementById("scoreSound");
const hitSound = document.getElementById("hitSound");

let gameStarted = false;
let gameOver = false;
let animationId;

let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;

const bird = {
    x: 80,
    y: 250,
    width: 40,
    height: 30,
    velocity: 0,
    gravity: 0.5,
    jump: -8,

    draw() {
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(
            this.x,
            this.y,
            this.width / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();

        /* Eye */
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(
            this.x + 8,
            this.y - 5,
            6,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(
            this.x + 10,
            this.y - 5,
            2,
            0,
            Math.PI * 2
        );
        ctx.fill();

        /* Beak */
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.moveTo(this.x + 18, this.y);
        ctx.lineTo(this.x + 30, this.y - 5);
        ctx.lineTo(this.x + 18, this.y + 5);
        ctx.closePath();
        ctx.fill();
    },

    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;
    },

    flap() {
        this.velocity = this.jump;

        if (flapSound) {
            flapSound.currentTime = 0;
            flapSound.play().catch(() => {});
        }
    },

    reset() {
        this.y = 250;
        this.velocity = 0;
    }
};

const pipes = [];

const pipeWidth = 60;
const pipeGap = 150;
const pipeSpeed = 2;

function createPipe() {
    const topHeight =
        Math.random() * 250 + 50;

    pipes.push({
        x: canvas.width,
        top: topHeight,
        bottom:
            canvas.height -
            topHeight -
            pipeGap,
        scored: false
    });
}

function updatePipes() {
    for (let i = pipes.length - 1; i >= 0; i--) {

        pipes[i].x -= pipeSpeed;

        if (
            !pipes[i].scored &&
            pipes[i].x + pipeWidth < bird.x
        ) {
            pipes[i].scored = true;

            score++;
            scoreDisplay.textContent = score;

            if (scoreSound) {
                scoreSound.currentTime = 0;
                scoreSound.play().catch(() => {});
            }
        }

        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }
    }
}

function drawPipes() {
    ctx.fillStyle = "green";

    pipes.forEach(pipe => {

        /* Top pipe */
        ctx.fillRect(
            pipe.x,
            0,
            pipeWidth,
            pipe.top
        );

        /* Bottom pipe */
        ctx.fillRect(
            pipe.x,
            canvas.height - pipe.bottom,
            pipeWidth,
            pipe.bottom
        );
    });
}

function drawBackground() {

    /* Ground */
    ctx.fillStyle = "#8BC34A";

    ctx.fillRect(
        0,
        canvas.height - 40,
        canvas.width,
        40
    );
}

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawBackground();

    drawPipes();

    bird.draw();
}

function update() {

    bird.update();

    updatePipes();
}

function gameLoop() {

    if (gameOver) {
        return;
    }

    update();

    draw();

    animationId =
        requestAnimationFrame(gameLoop);
}

/* Generate pipes every 1.5 seconds */
setInterval(() => {

    if (gameStarted && !gameOver) {
        createPipe();
    }

}, 1500);

/* Keyboard Controls */
document.addEventListener(
    "keydown",
    (e) => {

        if (e.code === "Space") {

            e.preventDefault();

            if (
                gameStarted &&
                !gameOver
            ) {
                bird.flap();
            }
        }
    }
);

/* Mobile Tap Controls */
canvas.addEventListener(
    "click",
    () => {

        if (
            gameStarted &&
            !gameOver
        ) {
            bird.flap();
        }
    }
);

/* Start Button */
startBtn.addEventListener(
    "click",
    startGame
);

function startGame() {

    gameStarted = true;

    startScreen.classList.add(
        "hidden"
    );

    bird.reset();

    score = 0;

    scoreDisplay.textContent = score;

    pipes.length = 0;

    gameLoop();
}
/* Collision Detection */
function checkCollision() {

    /* Top boundary */
    if (bird.y - bird.height / 2 <= 0) {
        endGame();
    }

    /* Ground collision */
    if (
        bird.y + bird.height / 2 >=
        canvas.height - 40
    ) {
        endGame();
    }

    /* Pipe collision */
    pipes.forEach(pipe => {

        const birdLeft =
            bird.x - bird.width / 2;

        const birdRight =
            bird.x + bird.width / 2;

        const birdTop =
            bird.y - bird.height / 2;

        const birdBottom =
            bird.y + bird.height / 2;

        const pipeLeft = pipe.x;
        const pipeRight =
            pipe.x + pipeWidth;

        /* Bird overlaps pipe */
        if (
            birdRight > pipeLeft &&
            birdLeft < pipeRight
        ) {

            /* Hits top pipe */
            if (
                birdTop < pipe.top
            ) {
                endGame();
            }

            /* Hits bottom pipe */
            if (
                birdBottom >
                canvas.height -
                pipe.bottom
            ) {
                endGame();
            }
        }
    });
}

/* End Game */
function endGame() {

    if (gameOver) return;

    gameOver = true;

    cancelAnimationFrame(
        animationId
    );

    if (hitSound) {

        hitSound.currentTime = 0;

        hitSound.play().catch(
            () => {}
        );
    }

    /* Save Best Score */
    if (score > bestScore) {

        bestScore = score;

        localStorage.setItem(
            "bestScore",
            bestScore
        );
    }

    finalScoreDisplay.textContent =
        score;

    bestScoreDisplay.textContent =
        bestScore;

    gameOverScreen.classList.remove(
        "hidden"
    );
}

/* Restart Game */
function restartGame() {

    gameOver = false;

    gameStarted = true;

    score = 0;

    scoreDisplay.textContent =
        score;

    pipes.length = 0;

    bird.reset();

    gameOverScreen.classList.add(
        "hidden"
    );

    gameLoop();
}

/* Restart Button */
restartBtn.addEventListener(
    "click",
    restartGame
);

/* Allow SPACE to restart */
document.addEventListener(
    "keydown",
    (e) => {

        if (
            e.code === "Space" &&
            gameOver
        ) {

            e.preventDefault();

            restartGame();
        }
    }
);

/* Update game loop */
const originalGameLoop =
    gameLoop;

gameLoop = function () {

    if (gameOver) {
        return;
    }

    update();

    checkCollision();

    draw();

    animationId =
        requestAnimationFrame(
            gameLoop
        );
};