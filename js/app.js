/* Notes 
- Make sure screen assets resize with game screen
- Add canvas and ctx citation in README
- Change name of repo to adhere to project criteria
- XXtemplate literal declaring winner on game over screenXX
- add more styling to game over screen
- XXcreate reset button on game over screenXX
- try to implement double jump and ability to jump over opponent
- falling off platform does not trigger win/loss
- add player names above health bars
- add on screen gameplay instructions
- begin cleaning up code
*/

/*  Current bugs (XX--XX = squashed)
- XXplayers fall through platform if double-jump not timed properlyXX
- XXhit detection only works on right side of each characterXX
- XXhit causes opponent to slide off platformXX
- XXconsole.log gameOver is constant in browser console, not just in game-over stateXX
- XXgameOver state not passing to endGame()XX
- XXtakeDamage() not behaving as expectedXX
- XXinfinite jump doesn't enhance gameplay if player can't jump over opponentXX
- XXhealth bar is sometimes delayed when damage is takenXX
- XXplayers keep moving after game overXX
- jump over opponent feature failing
- player's can't stand on each other's heads
*/



/* ------------------- cache ------------------- */

const canvas = document.getElementById('gameScreen');
const ctx = canvas.getContext('2d');

/* ------------------- constants ------------------- */

// canvas size
canvas.width = 800;
canvas.height = 500;

// gravity and movement
const gravity = 1;
const playerSpeed = 5;
const jumpSpeed = -15;

// platform object
const platform = {
    x: 150,
    y: 400,
    width: 500,
    height: 20
};


/* ------------------- create elements ------------------- */

// health container
const healthContainer = document.createElement('div');
healthContainer.classList.add('health-container');

// containers for player stats
const p1Container = document.createElement('div');
const p2Container = document.createElement('div');

// player name elements
const p1Name = document.createElement('div');
const p2Name = document.createElement('div');

p1Name.classList.add('player-name');
p2Name.classList.add('player-name');

p1Name.innerHTML = 'Player 1';
p2Name.innerHTML = 'Player 2';

// player health bars
const p1HealthBar = document.createElement('div');
const p2HealthBar = document.createElement('div');

p1HealthBar.classList.add('health-bar');
p2HealthBar.classList.add('health-bar');

// player instructions
const p1Instructions = document.createElement('div');
const p2Instructions = document.createElement('div');

p1Instructions.classList.add('player-instructions');
p2Instructions.classList.add('player-instructions');

p1Instructions.innerHTML = `
    <p>Move: A / D</p>
    <p>Jump: W</p>
    <p>Attack: Space</p>
`;

p2Instructions.innerHTML = `
    <p>Move: Left / Right</p>
    <p>Jump: Up</p>
    <p>Attack: Return</p>
`;

// append player stats and health bars
p1Container.appendChild(p1Name);
p1Container.appendChild(p1HealthBar);
p1Container.appendChild(p1Instructions);

p2Container.appendChild(p2Name);
p2Container.appendChild(p2HealthBar);
p2Container.appendChild(p2Instructions);

// append player containers to health container
healthContainer.appendChild(p1Container);
healthContainer.appendChild(p2Container);

// health container insert before canvas
document.body.insertBefore(healthContainer, canvas);

// game over text
const gameOverText = document.createElement('div');
gameOverText.id = 'game-over-screen';
document.body.appendChild(gameOverText);

/* -------------------  classes  ------------------- */

class character {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
        this.color = color;
        this.velocityX = 0;
        this.velocityY = 0;
        this.grounded = false;
        this.isAttacking = false;
        this.health = 100;
        this.faceDirection = 1;
        this.jumpsLeft = 2;
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    update(opponent) {
        // gravity
        this.velocityY += gravity;
        this.y += this.velocityY;
        this.x += this.velocityX;
        this.grounded = false;

        // ground-friction simulation
        this.velocityX *= 0.9;

        //platform collision
        if (
            this.y + this.height >= platform.y && 
            this.y + this.height <= platform.y + 10 && 
            this.x + this.width > platform.x && 
            this.x < platform.x + platform.width
            ) {
                this.y = platform.y - this.height;
                this.velocityY = 0;
                this.grounded = true;
                this.jumpsLeft = 2;
            } else {
                this.grounded = false;
        }

        // player collision
        if (this.playerCollision(opponent)) {
            if (this.velocityX > 0) {
                this.x = opponent.x - this.width;
            } else if (this.velocityX < 0) {
                this.x = opponent.x + opponent.width;
            }
            this.velocityX = 0;
        }

        if (this.y > canvas.height) {
            this.health = 0;
            updateHealthBars();
            endGame(opponent);
        }
    }

    playerCollision(opponent) {
        return (
            this.x < opponent.x + opponent.width &&
            this.x + this.width > opponent.x &&
            this.y + this.height > opponent.y + 10
        )
    }

    attack(opponent) {
        if (!this.isAttacking) {
            this.isAttacking = true;
        setTimeout(() => (this.isAttacking = false), 500);
        
        const attackRange = 30;
        const attackX = this.x + (this.faceDirection * attackRange);

        if (
            attackX < opponent.x + opponent.width &&
            attackX + attackRange > opponent.x &&
            this.y < opponent.y + opponent.height &&
            this.y + this.height > opponent.y
            ) {
                opponent.takeDamage(this);
            }
        }
    }

    takeDamage(attacker) {
        this.health -= 10;

        updateHealthBars();

        if (this.health <= 0) {
            this.health = 0;
            endGame(attacker);
        }
        this.knockback(attacker);
    }

    knockback(attacker) {
        const knockbackForce = 8;
        const upwardForce = -7;

        this.velocityX = attacker.faceDirection * knockbackForce;
        this.velocityY = upwardForce;
    }
}

function updateHealthBars() {
  p1HealthBar.style.width = `${player1.health * 3}px`;
  p2HealthBar.style.width = `${player2.health * 3}px`;
}


const player1 = new character(200, 350, 'white');
const player2 = new character(550, 350, 'red');

const keys = {
    a: false,
    d: false,
    w: false,
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false
};

/* ------------------- functions ------------------- */

// resize canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

let gameActive = true;

// draw platform
function gameLoop() {
    if (!gameActive) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'brown';
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

    player1.update(player2);
    player2.update(player1);
    player1.draw();
    player2.draw();

    updateHealthBars();

    requestAnimationFrame(gameLoop);
};

function endGame(winner) {
    gameActive = false;

    let loser = winner === player1 ? player2 : player1;

    gameOverText.style.display = 'block';
    gameOverText.innerHTML = `<h2>${winner.color.toUpperCase()} WINS!</h2>`;

    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);

    const restartButton = document.createElement('button');
    restartButton.id = 'restart-button';
    restartButton.innerHTML = 'Restart Game';
    document.body.appendChild(restartButton);

    restartButton.addEventListener('click', () => {
        window.location.reload();
    });
};

function handleKeyDown(event) {
    switch (event.key) {
      case "a":
        player1.velocityX = -playerSpeed;
        player1.faceDirection = -1;
        break;
      case "d":
        player1.velocityX = playerSpeed;
        player1.faceDirection = 1;
        break;
      case "w":
        if (player1.jumpsLeft > 0) {
            player1.velocityY = jumpSpeed;
            player1.jumpsLeft--;
        }
        break;
      case " ":
        player1.attack(player2);
        break;
      case "ArrowLeft":
        player2.velocityX = -playerSpeed;
        player2.faceDirection = -1;
        break;
      case "ArrowRight":
        player2.velocityX = playerSpeed;
        player2.faceDirection = 1;
        break;
      case "ArrowUp":
        if (player2.jumpsLeft > 0) {
          player2.velocityY = jumpSpeed;
          player2.jumpsLeft--;
        }
        break;
      case "Enter":
        player2.attack(player1);
        break;
    }
};

function handleKeyUp(event) {
    if (event.key === "a" || event.key === "d") player1.velocityX = 0;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") player2.velocityX = 0; 
};


gameLoop();

/* ------------------- event listeners ------------------- */

// resize screen
window.addEventListener('resize', resizeCanvas);

// movement controls
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);