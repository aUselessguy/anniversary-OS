// --- ESTADO GLOBAL ---
let highestZ = 6000;
let ritualStep = 0;
const ritualSequence = [2, 9, 0, 4];
let gameActive = false;
let currentGame = "";

// --- LÓGICA DO RITUAL ---
function initRitual() {
    const flashlight = document.getElementById('flashlight');
    const container = document.getElementById('ritual-container');

    const moveLight = (e) => {
        const x = e.clientX || (e.touches && e.touches[0].clientX);
        const y = e.clientY || (e.touches && e.touches[0].clientY);
        if (x !== undefined) {
            flashlight.style.setProperty('--x', `${x}px`);
            flashlight.style.setProperty('--y', `${y}px`);
        }
    };

    window.addEventListener('mousemove', moveLight);
    window.addEventListener('touchmove', moveLight, { passive: false });
    window.addEventListener('touchstart', moveLight, { passive: false });

    spawnRitualNumber();
}

function spawnRitualNumber() {
    if (ritualStep >= ritualSequence.length) {
        finishRitual();
        return;
    }

    const area = document.getElementById('ritual-game-area');
    const num = document.createElement('div');
    num.className = 'ritual-number';
    num.innerText = ritualSequence[ritualStep];

    const x = Math.random() * (window.innerWidth - 100) + 50;
    const y = Math.random() * (window.innerHeight - 150) + 75;

    num.style.left = `${x}px`;
    num.style.top = `${y}px`;

    const capture = (e) => {
        e.preventDefault();
        document.getElementById(`rs${ritualStep}`).innerText = ritualSequence[ritualStep];
        num.remove();
        ritualStep++;
        spawnRitualNumber();
    };

    num.onclick = capture;
    num.ontouchstart = capture;
    area.appendChild(num);
}

function finishRitual() {
    const rc = document.getElementById('ritual-container');
    rc.style.opacity = '0';
    setTimeout(() => {
        rc.style.display = 'none';
        document.getElementById('invite-win').style.display = 'block';
    }, 2000);
}

// --- SISTEMA OPERATIVO ---
function toggleMenu() {
    const m = document.getElementById('start-menu');
    m.style.display = m.style.display === 'flex' ? 'none' : 'flex';
}

function updateClock() {
    const d = new Date();
    document.getElementById('relogio').innerText = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
setInterval(updateClock, 1000);

function openApp(type) {
    document.getElementById('start-menu').style.display = 'none';
    const win = document.getElementById('app-win');
    win.style.display = 'block';
    win.style.zIndex = ++highestZ;
    
    currentGame = type;
    gameActive = true;
    
    // Reset contents
    document.getElementById('gameCanvas').style.display = 'none';
    document.getElementById('mines-ui').style.display = 'none';
    document.getElementById('iframe-container').style.display = 'none';
    document.getElementById('app-title').innerText = type.toUpperCase() + ".EXE";

    if (type === 'mines') {
        document.getElementById('mines-ui').style.display = 'block';
        initMines();
    } else if (type === 'snake') {
        document.getElementById('gameCanvas').style.display = 'block';
        runSnake();
    } else if (type === 'dino') {
        document.getElementById('iframe-container').style.display = 'block';
        document.getElementById('dino-frame').src = "https://chromedino.com/";
    }
}

function closeApp() {
    document.getElementById('app-win').style.display = 'none';
    gameActive = false;
    document.getElementById('dino-frame').src = "";
}

// --- FESTA ---
function confirmarPresenca() {
    document.getElementById('invite-win').style.display = 'none';
    document.getElementById('confetti-sound').play().catch(()=>{});
    document.getElementById('yay-sound').play().catch(()=>{});
    document.getElementById('crowd-sound').play().catch(()=>{});
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
}

// --- SNAKE GAME ---
function runSnake() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    let snake = [{x:10, y:10}], dir = {x:1, y:0}, food = {x:5, y:5};
    
    function loop() {
        if (!gameActive || currentGame !== 'snake') return;
        ctx.fillStyle = "#000"; ctx.fillRect(0,0,400,300);
        
        let head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
        if (head.x === food.x && head.y === food.y) {
            food = {x: Math.floor(Math.random()*19), y: Math.floor(Math.random()*14)};
        } else {
            snake.pop();
        }
        
        if (head.x<0 || head.x>19 || head.y<0 || head.y>14) {
            alert("Game Over!");
            openApp('snake');
            return;
        }
        
        snake.unshift(head);
        ctx.fillStyle = "lime"; snake.forEach(p => ctx.fillRect(p.x*20, p.y*20, 18, 18));
        ctx.fillStyle = "red"; ctx.fillRect(food.x*20, food.y*20, 18, 18);
        setTimeout(() => requestAnimationFrame(loop), 100);
    }
    
    window.onkeydown = e => {
        if (e.key.includes("Up")) dir = {x:0, y:-1};
        if (e.key.includes("Down")) dir = {x:0, y:1};
        if (e.key.includes("Left")) dir = {x:-1, y:0};
        if (e.key.includes("Right")) dir = {x:1, y:0};
    };
    loop();
}

// --- MINESWEERPER ---
function initMines() {
    const grid = document.getElementById('mines-grid');
    grid.innerHTML = '';
    for(let i=0; i<100; i++) {
        const c = document.createElement('div');
        c.className = 'cell';
        c.onclick = () => {
            c.classList.add('revealed');
            if (Math.random() < 0.1) { c.innerText = '💣'; c.style.background = 'red'; }
            else { c.innerText = Math.floor(Math.random()*3); }
        };
        grid.appendChild(c);
    }
}

// --- ARRASTAR (DRAG) ---
function makeDraggable(el, handleSelector) {
    let p1 = 0, p2 = 0, p3 = 0, p4 = 0;
    const handle = handleSelector ? el.querySelector(handleSelector) : el;
    handle.onmousedown = (e) => {
        if (e.target.tagName === 'BUTTON') return;
        el.style.zIndex = ++highestZ;
        p3 = e.clientX; p4 = e.clientY;
        document.onmousemove = (e) => {
            p1 = p3 - e.clientX; p2 = p4 - e.clientY;
            p3 = e.clientX; p4 = e.clientY;
            el.style.top = (el.offsetTop - p2) + "px";
            el.style.left = (el.offsetLeft - p1) + "px";
            el.style.transform = "none";
        };
        document.onmouseup = () => { document.onmousemove = null; };
    };
}

// --- START ---
window.onload = () => {
    initRitual();
    updateClock();
    document.querySelectorAll('.draggable').forEach(e => makeDraggable(e));
    document.querySelectorAll('.draggable-win').forEach(e => makeDraggable(e, '.handle'));
};