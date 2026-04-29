let ritualStep = 0, ritualSeq = [2,9,0,4], gameActive = false, currentGame = "", highestZ = 1000;
let snake = [], dir = {x:0, y:0}, food = {}, blocks = [], paddle = {}, ball = {};

// RITUAL
function initRitual() {
    const flash = document.getElementById('flashlight');
    const update = (e) => {
        let x = e.clientX || (e.touches && e.touches[0].clientX);
        let y = e.clientY || (e.touches && e.touches[0].clientY);
        flash.style.setProperty('--x', x+'px'); flash.style.setProperty('--y', y+'px');
    };
    window.addEventListener('mousemove', update);
    window.addEventListener('touchmove', update);
    spawnNum();
}

function spawnNum() {
    if(ritualStep >= 4) { 
        document.getElementById('ritual-container').style.opacity = 0;
        setTimeout(() => {
            document.getElementById('ritual-container').style.display='none';
            document.getElementById('invite-win').style.display='block';
        }, 1000);
        return; 
    }
    const area = document.getElementById('ritual-game-area');
    const n = document.createElement('div');
    n.className = 'ritual-number'; n.innerText = ritualSeq[ritualStep];
    n.style.left = Math.random()*70 + 15 + '%'; n.style.top = Math.random()*70 + 15 + '%';
    n.onmousedown = n.ontouchstart = (e) => {
        e.preventDefault();
        document.getElementById('rs'+ritualStep).innerText = ritualSeq[ritualStep];
        n.remove(); ritualStep++; spawnNum();
    };
    area.appendChild(n);
}

// OS CORE
function toggleMenu() {
    let m = document.getElementById('start-menu');
    m.style.display = m.style.display === 'flex' ? 'none' : 'flex';
}

function openApp(app) {
    toggleMenu();
    document.getElementById('app-win').style.display = 'block';
    document.getElementById('app-win').style.zIndex = ++highestZ;
    document.getElementById('app-title').innerText = app.toUpperCase() + ".EXE";
    currentGame = app; gameActive = true;

    // Reset UI
    document.getElementById('gameCanvas').style.display = 'none';
    document.getElementById('mines-ui').style.display = 'none';
    document.getElementById('mobile-controls').style.display = (app === 'snake') ? 'flex' : 'none';
    
    if(app === 'snake') { document.getElementById('gameCanvas').style.display = 'block'; initSnake(); }
    if(app === 'blocks') { document.getElementById('gameCanvas').style.display = 'block'; initBlocks(); }
    if(app === 'mines') { document.getElementById('mines-ui').style.display = 'block'; initMines(); }
}

function closeApp() { gameActive = false; document.getElementById('app-win').style.display = 'none'; }

// GAMES
function setDir(x, y) { dir = {x, y}; }

function initSnake() {
    snake = [{x:10, y:10}]; dir = {x:1, y:0};
    food = {x: Math.floor(Math.random()*14), y: Math.floor(Math.random()*14)};
    runSnake();
}

function runSnake() {
    if(!gameActive || currentGame !== 'snake') return;
    const ctx = document.getElementById('gameCanvas').getContext('2d');
    ctx.fillStyle = "#000"; ctx.fillRect(0,0,300,300);
    
    let head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
    if(head.x === food.x && head.y === food.y) {
        food = {x: Math.floor(Math.random()*14), y: Math.floor(Math.random()*14)};
    } else { snake.pop(); }

    if(head.x < 0 || head.x > 14 || head.y < 0 || head.y > 14) { initSnake(); return; }
    snake.unshift(head);

    ctx.fillStyle = "lime"; snake.forEach(s => ctx.fillRect(s.x*20, s.y*20, 18, 18));
    ctx.fillStyle = "red"; ctx.fillRect(food.x*20, food.y*20, 18, 18);
    setTimeout(runSnake, 150);
}

function initBlocks() {
    paddle = {x: 125, w: 50}; ball = {x: 150, y: 150, dx: 2, dy: -2};
    blocks = [];
    for(let i=0; i<5; i++) for(let j=0; j<3; j++) blocks.push({x: i*60+5, y: j*20+10, active: true});
    runBlocks();
}

function runBlocks() {
    if(!gameActive || currentGame !== 'blocks') return;
    const ctx = document.getElementById('gameCanvas').getContext('2d');
    ctx.clearRect(0,0,300,300); ctx.fillStyle = "#000"; ctx.fillRect(0,0,300,300);

    ball.x += ball.dx; ball.y += ball.dy;
    if(ball.x <= 0 || ball.x >= 290) ball.dx *= -1;
    if(ball.y <= 0) ball.dy *= -1;
    if(ball.y >= 290) { initBlocks(); return; }

    // Colisão Paddle (simplificada para touch: segue a bola um pouco ou use o mouse)
    if(ball.y > 270 && ball.x > paddle.x && ball.x < paddle.x + paddle.w) ball.dy *= -1;
    
    // Mouse segue paddle
    document.getElementById('gameCanvas').onmousemove = (e) => {
        let rect = e.target.getBoundingClientRect();
        paddle.x = e.clientX - rect.left - 25;
    };

    ctx.fillStyle = "white"; ctx.fillRect(paddle.x, 280, paddle.w, 10);
    ctx.fillStyle = "yellow"; ctx.beginPath(); ctx.arc(ball.x, ball.y, 5, 0, Math.PI*2); ctx.fill();

    blocks.forEach(b => {
        if(b.active) {
            ctx.fillStyle = "orange"; ctx.fillRect(b.x, b.y, 50, 15);
            if(ball.x > b.x && ball.x < b.x+50 && ball.y > b.y && ball.y < b.y+15) {
                b.active = false; ball.dy *= -1;
            }
        }
    });
    requestAnimationFrame(runBlocks);
}

function initMines() {
    const grid = document.getElementById('mines-grid'); grid.innerHTML = '';
    const mines = Array(64).fill(0).map(() => Math.random() < 0.15);
    for(let i=0; i<64; i++) {
        const c = document.createElement('div'); c.className = 'cell';
        c.onclick = () => {
            if(mines[i]) { c.innerText = '💣'; c.style.background = 'red'; alert('BOOM!'); initMines(); }
            else { c.innerText = '0'; c.classList.add('revealed'); }
        };
        grid.appendChild(c);
    }
}

function confirmarPresenca() {
    document.getElementById('invite-win').style.display='none';
    confetti({ particleCount: 150, spread: 70 });
    document.getElementById('confetti-sound').play();
}

window.onload = () => { 
    initRitual(); 
    setInterval(() => {
        document.getElementById('relogio').innerText = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    }, 1000);
};