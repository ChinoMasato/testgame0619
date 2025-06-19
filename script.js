const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let score = 0;
let lives = 3;
// let gameStarted = false; // Replaced by gameState
let gameState = 'titleScreen'; // Possible states: 'titleScreen', 'playing', 'gameOver' (later)

// Ball properties
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;
const ballRadius = 10;

// Paddle properties
const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;

// Brick properties
const brickRowCount = 3;
const brickColumnCount = 5;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

// Control state
let rightPressed = false;
let leftPressed = false;

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function startGameOnClick() {
    if (gameState === 'titleScreen') {
        gameState = 'playing';

        // Initialize/reset game elements for a new game
        x = canvas.width / 2;           // Ball x position
        y = canvas.height - 30;         // Ball y position
        dx = 2;                         // Ball horizontal speed
        dy = -2;                        // Ball vertical speed
        paddleX = (canvas.width - paddleWidth) / 2; // Paddle position
        score = 0;                      // Reset score
        lives = 3;                      // Reset lives

        // Re-initialize bricks
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                bricks[c][r].status = 1; // Reset all bricks to active
            }
        }

        // canvas.removeEventListener('click', startGameOnClick); // Listener will be re-added if game ends and returns to title
        // Let's keep removing it for now, and if a game over screen is implemented that doesn't reload,
        // we might need to re-add it there. Reloading the page currently handles re-adding.
        canvas.removeEventListener('click', startGameOnClick);
    }
}
canvas.addEventListener('click', startGameOnClick, false);


function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
    }
}


function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score++;
                    if (score === brickRowCount * brickColumnCount) {
                        alert('YOU WIN, CONGRATULATIONS!');
                        document.location.reload();
                    }
                }
            }
        }
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

function drawTitleScreen() {
    // ctx.clearRect(0, 0, canvas.width, canvas.height); // Clearing is now done at the start of draw()

    // Draw Title
    ctx.font = '48px Arial';
    ctx.fillStyle = '#0095DD';
    ctx.textAlign = 'center';
    ctx.fillText('Block Breaker', canvas.width / 2, canvas.height / 2 - 30);

    // Draw Prompt
    ctx.font = '24px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText('Click to Start', canvas.width / 2, canvas.height / 2 + 20);
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = '#0095DD';
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawScore() {
    document.getElementById('score').textContent = 'Score: ' + score;
}

function drawLives() {
    document.getElementById('lives').textContent = 'Lives: ' + lives;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas each frame

    if (gameState === 'playing') {
        drawBricks();
        drawBall();
        drawPaddle();
        drawScore();
        drawLives();
        collisionDetection();

        // Ball movement
        if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
            dx = -dx;
        }
        if (y + dy < ballRadius) {
            dy = -dy;
        } else if (y + dy > canvas.height - ballRadius) {
            if (x > paddleX && x < paddleX + paddleWidth) {
                dy = -dy; // Bounce off paddle
            } else {
                lives--;
                if (!lives) {
                    alert('GAME OVER');
                    document.location.reload(); // Resets to titleScreen via reload
                } else {
                    // Reset ball and paddle for next life, gameState remains 'playing'
                    x = canvas.width / 2;
                    y = canvas.height - 30;
                    paddleX = (canvas.width - paddleWidth) / 2;
                }
            }
        }
        x += dx;
        y += dy;

        // Paddle movement
        if (rightPressed && paddleX < canvas.width - paddleWidth) {
            paddleX += 7;
        } else if (leftPressed && paddleX > 0) {
            paddleX -= 7;
        }

    } else if (gameState === 'titleScreen') {
        drawTitleScreen();
        // No game elements drawn or game logic processed here.
        // Paddle is not drawn, score/lives are not displayed.
    }

    requestAnimationFrame(draw);
}

draw();
