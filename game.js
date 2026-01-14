/** * NIGHTFALL ATELIER - CÓDIGO REVISADO 2026
 * Comentários detalhados para cada função.
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --- 1. BANCO DE DADOS DE CARTAS (Total 20 para Mago/Comum) ---
const allUpgrades = {
    comum: [
        { id: 'c1', name: 'Vida Extra', desc: '+20 HP Max', icon: '❤️', type: 'hp', val: 20 },
        { id: 'c2', name: 'Agilidade', desc: '+15% Velocidade', icon: '👟', type: 'spd', val: 1.15 },
        { id: 'c3', name: 'Regeneração', desc: 'Recupera 15 HP', icon: '🧪', type: 'heal', val: 15 },
        { id: 'c4', name: 'Pele Grossa', desc: 'Defesa +5', icon: '🛡️', type: 'def', val: 5 },
        { id: 'c5', name: 'Sorte', desc: '+10% XP', icon: '🍀', type: 'xp', val: 1.1 },
        { id: 'c6', name: 'Imã', desc: 'Atrai itens', icon: '🧲', type: 'mag', val: 1.5 }
    ],
    mago: [
        { id: 'm1', name: 'Mana Burst', desc: '+20% Dano', icon: '🔮', type: 'dmg', val: 1.2 },
        { id: 'm2', name: 'Mente Rápida', desc: '-20% Recarga', icon: '🌀', type: 'cd', val: 0.8 },
        { id: 'm3', name: 'Área Arcana', desc: '+25% Área', icon: '💥', type: 'area', val: 1.25 },
        { id: 'm4', name: 'Tiro Rápido', desc: '+30% Vel. Projétil', icon: '✨', type: 'pspd', val: 1.3 },
        { id: 'm5', name: 'Cajado Dourado', desc: '+1 Projétil', icon: '🦯', type: 'mult', val: 1 },
        { id: 'm6', name: 'Geada', desc: 'Lentidão nos inimigos', icon: '❄️', type: 'slow', val: 0.2 },
        { id: 'm7', name: 'Chama Viva', desc: 'Dano de Fogo', icon: '🔥', type: 'burn', val: 10 },
        { id: 'm8', name: 'Escudo Mágico', desc: 'Absorve dano', icon: '💠', type: 'shield', val: 1 },
        { id: 'm9', name: 'Crítico Místico', desc: '+15% Chance Crítica', icon: '⚡', type: 'crit', val: 0.15 },
        { id: 'm10', name: 'Drenagem', desc: 'Vida por abate', icon: '🧛', type: 'vamp', val: 2 },
        { id: 'm11', name: 'Eco Magico', desc: 'Chance de tiro extra', icon: '🔔', type: 'echo', val: 0.2 },
        { id: 'm12', name: 'Sabedoria', desc: '+2 Níveis de Magia', icon: '📖', type: 'wise', val: 2 },
        { id: 'm13', name: 'Nova Arcana', desc: 'Explosão ao nível', icon: '☀️', type: 'nova', val: 50 },
        { id: 'm14', name: 'Poder Puro', desc: '+50% Dano Total', icon: '💎', type: 'ult', val: 1.5 }
    ],
    arqueiro: [], guerreiro: [] 
};

// --- 2. ESTADO GLOBAL ---
let gameStarted = false, isPaused = false, isGameOver = false;
let playerClass = '', level = 1, xp = 0, nextLevelXp = 100;
let cameraX = 0, cameraY = 0, fireTimer = 0;

const player = { worldX: 0, worldY: 0, hp: 100, maxHp: 100, speed: 4.5, damage: 15, cooldown: 35, skin: '' };
const enemies = [], projectiles = [], keys = {};

// --- 3. CONTROLES E INÍCIO ---
window.onkeydown = (e) => keys[e.code] = true;
window.onkeyup = (e) => keys[e.code] = false;

window.selectClass = (type) => {
    playerClass = type;
    player.skin = (type === 'mago') ? '🧙‍♂️' : (type === 'arqueiro' ? '🏹' : '🛡️');
    document.getElementById('selection-screen').style.display = 'none';
    document.getElementById('bgMusic').play().catch(() => {}); // Toca a música
    gameStarted = true;
};

// --- 4. SISTEMA DE CARTAS (SORTEIO ÚNICO) ---
function showUpgrade() {
    isPaused = true;
    const cont = document.getElementById('upgrade-cards-container');
    cont.innerHTML = '';
    
    // Une comuns + classe
    let pool = [...allUpgrades.comum, ...allUpgrades[playerClass]];
    // Embaralha
    pool.sort(() => Math.random() - 0.5);
    // Pega 3 únicas
    let escolhas = pool.slice(0, 3);

    escolhas.forEach(up => {
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.innerHTML = `<span class="card-icon">${up.icon}</span><h3>${up.name}</h3><p>${up.desc}</p>`;
        card.onclick = () => { applyUpgrade(up); isPaused = false; document.getElementById('upgrade-screen').style.display = 'none'; };
        cont.appendChild(card);
    });
    document.getElementById('upgrade-screen').style.display = 'flex';
}

function applyUpgrade(up) {
    if(up.type === 'hp') { player.maxHp += up.val; player.hp += up.val; }
    if(up.type === 'spd') player.speed *= up.val;
    if(up.type === 'dmg') player.damage *= up.val;
    if(up.type === 'cd') player.cooldown *= up.val;
    if(up.type === 'heal') player.hp = Math.min(player.maxHp, player.hp + up.val);
}

// --- 5. DESENHO DO MAPA (SOLUÇÃO PARA O PRETO) ---
function drawMap() {
    const size = 100; // Tamanho do bloco de pedra
    const startX = Math.floor(cameraX / size) * size;
    const startY = Math.floor(cameraY / size) * size;

    for (let x = startX - size; x < startX + canvas.width + size; x += size) {
        for (let y = startY - size; y < startY + canvas.height + size; y += size) {
            // Desenha a "pedra"
            ctx.fillStyle = '#111113'; 
            ctx.fillRect(x - cameraX, y - cameraY, size - 2, size - 2);
            // Desenha o detalhe da pedra
            ctx.strokeStyle = '#1a1a1c';
            ctx.strokeRect(x - cameraX + 5, y - cameraY + 5, size - 10, size - 10);
        }
    }
}

// --- 6. LOOP PRINCIPAL ---
function update() {
    if (!gameStarted || isPaused || isGameOver) return;

    // Movimentação
    if (keys['KeyW']) player.worldY -= player.speed;
    if (keys['KeyS']) player.worldY += player.speed;
    if (keys['KeyA']) player.worldX -= player.speed;
    if (keys['KeyD']) player.worldX += player.speed;

    // Câmera
    cameraX = player.worldX - canvas.width / 2;
    cameraY = player.worldY - canvas.height / 2;

    // Tiro Automático
    fireTimer++;
    if (fireTimer >= player.cooldown && enemies.length > 0) {
        let target = enemies[0];
        let dx = target.worldX - player.worldX, dy = target.worldY - player.worldY;
        let d = Math.sqrt(dx*dx+dy*dy);
        projectiles.push({ worldX: player.worldX, worldY: player.worldY, vx: (dx/d)*12, vy: (dy/d)*12 });
        fireTimer = 0;
    }

    // Inimigos
    if (Math.random() < 0.03) {
        enemies.push({ worldX: player.worldX + (Math.random()-0.5)*1200, worldY: player.worldY + (Math.random()-0.5)*1000, hp: 30 });
    }
    enemies.forEach((e, i) => {
        let dx = player.worldX - e.worldX, dy = player.worldY - e.worldY, d = Math.sqrt(dx*dx+dy*dy);
        e.worldX += (dx/d)*2; e.worldY += (dy/d)*2;
        if(d < 25) player.hp -= 0.2;
    });

    // Colisão e XP
    projectiles.forEach((p, pi) => {
        p.worldX += p.vx; p.worldY += p.vy;
        enemies.forEach((e, ei) => {
            if(Math.sqrt((p.worldX-e.worldX)**2 + (p.worldY-e.worldY)**2) < 30) {
                e.hp -= player.damage; projectiles.splice(pi, 1);
                if(e.hp <= 0) { enemies.splice(ei, 1); xp += 25; }
            }
        });
    });

    if (xp >= nextLevelXp) { xp = 0; level++; showUpgrade(); }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!gameStarted) return;

    drawMap(); // Desenha o chão primeiro

    // Player
    ctx.font = "40px serif";
    ctx.fillText(player.skin, canvas.width/2 - 20, canvas.height/2 + 20);

    // Inimigos e Tiros
    enemies.forEach(e => ctx.fillText('🧟', e.worldX - cameraX - 15, e.worldY - cameraY + 15));
    projectiles.forEach(p => ctx.fillText('🔥', p.worldX - cameraX - 10, p.worldY - cameraY + 10));

    // UI
    document.getElementById('hp-bar').style.width = (player.hp/player.maxHp)*100+'%';
    document.getElementById('xp-bar').style.width = (xp/nextLevelXp)*100+'%';
}

function loop() { update(); draw(); requestAnimationFrame(loop); }
loop();



