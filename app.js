// GLOBAL VARS
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = null;
let score = 0;
let ball, paddle;
let rightPressed = false, leftPressed = false;
let gameInterval;
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let hitCount = 0;  // Counter for each hit

// LOGIN AND REGISTRATION
function showLogin() {
  document.getElementById('login-form').classList.remove('hidden');
  document.getElementById('register-form').classList.add('hidden');
}

function showRegister() {
  document.getElementById('register-form').classList.remove('hidden');
  document.getElementById('login-form').classList.add('hidden');
}

function showNotification(message, color) {
  const notification = document.getElementById('notification');
  notification.innerText = message;
  notification.style.backgroundColor = color;
  notification.classList.remove('hidden');

  setTimeout(() => {
    notification.classList.add('hidden');
  }, 3000);
}

function login() {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    currentUser = user;
    showNotification('Uspešno ste se prijavili!', '#4CAF50');
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('game-menu').classList.remove('hidden');
    document.getElementById('user-name').innerText = username;

    // Update highest score display
    document.getElementById('user-high-score').innerText = currentUser.highScore;
  } else {
    showNotification('Pogrešno korisničko ime ili lozinka!', '#f44336');
  }
}

function register() {
  const username = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;

  if (users.find(u => u.username === username)) {
    showNotification('Korisničko ime već postoji!', '#f44336');
    return;
  }

  const newUser = { username, password, highScore: 0 };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  showNotification('Uspesno ste se registrovali!', '#4CAF50');
  showLogin();
}

// GAME LOGIC
function startGame() {
  document.getElementById('game-menu').classList.add('hidden');
  document.getElementById('game-container').classList.remove('hidden');
  
  ball = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    radius: 10,
    dx: 3,
    dy: -3,
    color: "#0095DD"
  };

  paddle = {
    width: 75,
    height: 10,
    x: (canvas.width - 75) / 2,
    speed: 8,
    dx: 0
  };

  score = 0;
  hitCount = 0;  // Reset hit counter
  document.getElementById('gameOverMenu').classList.add('hidden');
  gameInterval = requestAnimationFrame(gameLoop);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBall();
  drawPaddle();
  detectCollisions();
  movePaddle();

  ball.x += ball.dx;
  ball.y += ball.dy;

  document.getElementById('scoreContainer').innerText = `Poeni: ${score}`;

  if (ball.y + ball.radius > canvas.height) {
    gameOver();
  } else {
    gameInterval = requestAnimationFrame(gameLoop);
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = ball.color;
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddle.x, canvas.height - paddle.height, paddle.width, paddle.height);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function movePaddle() {
  paddle.x += paddle.dx;
  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;
}

function detectCollisions() {
  if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) ball.dx = -ball.dx;
  if (ball.y + ball.dy < ball.radius) ball.dy = -ball.dy;
  else if (ball.y + ball.dy > canvas.height - ball.radius) {
    if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
      ball.dy = -ball.dy;
      hitCount++;  // Increment hit count
      score = hitCount;  // Set score to hit count
    }
    else {
      gameOver();
    }
  }
}

function gameOver() {
  cancelAnimationFrame(gameInterval);
  document.getElementById('finalScore').innerText = `Poeni: ${score}`;
  document.getElementById('gameOverMenu').classList.remove('hidden');

  // Check if the score is the highest for the user and update
  if (score > currentUser.highScore) {
    currentUser.highScore = score;
    localStorage.setItem('users', JSON.stringify(users));
    document.getElementById('user-high-score').innerText = currentUser.highScore;
  }

  // Update leaderboard
  updateLeaderboard();
}

function updateLeaderboard() {
  const leaderboard = users
    .sort((a, b) => b.highScore - a.highScore)
    .slice(0, 5);  // Get top 5 users
  
  const scoreboard = document.getElementById('scoreboard');
  scoreboard.innerHTML = '';  // Clear the leaderboard
  
  leaderboard.forEach(user => {
    const li = document.createElement('li');
    li.innerText = `${user.username}: ${user.highScore}`;
    scoreboard.appendChild(li);
  });
}

function playAgain() {
  startGame();
  document.getElementById('gameOverMenu').classList.add('hidden');
}

// KEY EVENTS
document.addEventListener("keydown", (e) => {
  if (e.key == "Right" || e.key == "ArrowRight") paddle.dx = paddle.speed;
  else if (e.key == "Left" || e.key == "ArrowLeft") paddle.dx = -paddle.speed;
});

document.addEventListener("keyup", () => {
  paddle.dx = 0;
});
