/**
 * CASTLE OF THE ANCIENTS - JOGO MEDIEVAL COMPLETO
 * Sistema de Áudio SIMPLIFICADO e Chão Simplificado
 */

// ========== CONFIGURAÇÕES ==========
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configurar canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ========== SISTEMA DE ÁUDIO SIMPLIFICADO ==========
const audio = {
    bgMusic: document.getElementById('bgMusic'),
    shootSound: document.getElementById('shootSound'),
    hitSound: document.getElementById('hitSound'),
    levelUpSound: document.getElementById('levelUpSound'),
    monsterDeathSound: document.getElementById('monsterDeathSound'),
    gameOverSound: document.getElementById('gameOverSound'),
    musicEnabled: true,
    sfxEnabled: true
};

// Configurar volumes
audio.bgMusic.volume = 0.3;
audio.shootSound.volume = 0.4;
audio.hitSound.volume = 0.5;
audio.levelUpSound.volume = 0.6;
audio.monsterDeathSound.volume = 0.5;
audio.gameOverSound.volume = 0.7;

// Variável para controlar interação inicial
let userInteracted = false;

// Controle de música - SIMPLIFICADO
window.toggleMusic = () => {
    audio.musicEnabled = !audio.musicEnabled;
    const control = document.querySelector('.music-control');
    
    if (audio.musicEnabled) {
        // Tenta tocar a música
        const playPromise = audio.bgMusic.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                console.log("Aguardando interação para música...");
            });
        }
        control.classList.remove('muted');
    } else {
        audio.bgMusic.pause();
        control.classList.add('muted');
    }
};

// Controle de efeitos sonoros
window.toggleSFX = () => {
    audio.sfxEnabled = !audio.sfxEnabled;
    const control = document.querySelector('.sfx-control');
    
    if (audio.sfxEnabled) {
        control.classList.remove('muted');
    } else {
        control.classList.add('muted');
    }
};

// Função para tocar sons de efeito - SIMPLIFICADA
function playSound(soundElement) {
    if (!audio.sfxEnabled || !soundElement) return;
    
    try {
        // Reset e tenta tocar
        soundElement.currentTime = 0;
        soundElement.play().catch(e => {
            // Ignora erros silenciosamente
        });
    } catch (e) {
        // Ignora erros silenciosamente
    }
}

// ========== VARIÁVEIS DO JOGO ==========
let gameStarted = false;
let isPaused = false;
let level = 1;
let xp = 0;
let nextLevelXp = 100;
let kills = 0;
let gold = 0;
let wave = 1;
let waveKills = 0;
let waveEnemies = 8;
let cameraX = 0;
let cameraY = 0;
let keys = {};
let mousePressed = false;
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;

// ========== CRIATURAS MEDIEVAIS ==========
const medievalMonsters = [
    { name: 'Goblin', color: '#4CAF50', hp: 40, speed: 1.8, size: 35, xp: 15, gold: 5 },
    { name: 'Esqueleto', color: '#F5F5F5', hp: 35, speed: 1.5, size: 38, xp: 18, gold: 8 },
    { name: 'Orc', color: '#795548', hp: 60, speed: 1.2, size: 48, xp: 25, gold: 12 },
    { name: 'Morto-Vivo', color: '#212121', hp: 45, speed: 1.3, size: 42, xp: 20, gold: 10 },
    { name: 'Aranha Gigante', color: '#9C27B0', hp: 30, speed: 2.0, size: 45, xp: 16, gold: 7 },
    { name: 'Lobisomem', color: '#FF9800', hp: 55, speed: 1.7, size: 50, xp: 22, gold: 15 },
    { name: 'Dragãozinho', color: '#F44336', hp: 70, speed: 1.0, size: 55, xp: 30, gold: 20 }
];

// ========== JOGADOR ==========
const player = {
    worldX: 0,
    worldY: 0,
    hp: 100,
    maxHp: 100,
    speed: 4.5,
    damage: 30,
    size: 50,
    class: '',
    projectileSpeed: 14,
    attackSpeed: 2.0,
    lastShot: 0,
    color: '#8B7355',
    weaponColor: '#D4AF37'
};

// ========== ARRAYS DO JOGO ==========
const enemies = [];
const projectiles = [];
const particles = [];
const decorativeParticles = [];

// ========== FUNÇÕES DO JOGO ==========

// Selecionar classe
window.selectClass = (type) => {
    player.class = type;
    
    switch(type) {
        case 'paladino':
            player.damage = 40;
            player.projectileSpeed = 12;
            player.attackSpeed = 1.8;
            player.maxHp = 120;
            player.hp = 120;
            player.color = '#4fc3f7';
            player.weaponColor = '#D4AF37';
            break;
        case 'arqueiro':
            player.damage = 35;
            player.attackSpeed = 2.5;
            player.projectileSpeed = 20;
            player.speed = 5.0;
            player.maxHp = 90;
            player.hp = 90;
            player.color = '#81c784';
            player.weaponColor = '#8BC34A';
            break;
        case 'mago':
            player.damage = 45;
            player.maxHp = 80;
            player.hp = 80;
            player.projectileSpeed = 16;
            player.attackSpeed = 2.2;
            player.speed = 4.0;
            player.color = '#ba68c8';
            player.weaponColor = '#E91E63';
            break;
    }
    
    // Atualizar UI
    document.getElementById('class-name').textContent = player.class.toUpperCase();
    document.getElementById('selection-screen').style.display = 'none';
    document.getElementById('crosshair').style.display = 'block';
    
    // Marcar que houve interação
    userInteracted = true;
    
    // Iniciar música após interação
    if (audio.musicEnabled) {
        audio.bgMusic.play().catch(e => {
            console.log("Música iniciada após seleção de classe");
        });
    }
    
    // Criar partículas decorativas
    createDecorativeParticles();
    
    gameStarted = true;
    updateUI();
};

// Pular upgrade
window.skipUpgrade = () => {
    document.getElementById('upgrade-screen').style.display = 'none';
    isPaused = false;
};

// Selecionar upgrade
window.selectUpgrade = (type) => {
    switch(type) {
        case 'vitality':
            player.maxHp += 25;
            player.hp = player.maxHp;
            break;
        case 'power':
            player.damage += 20;
            break;
        case 'celerity':
            player.speed += 0.8;
            break;
    }
    
    document.getElementById('upgrade-screen').style.display = 'none';
    isPaused = false;
    updateUI();
};

// Reiniciar jogo
window.restartGame = () => {
    location.reload();
};

// Atualizar UI
function updateUI() {
    document.getElementById('level').textContent = level.toString().padStart(2, '0');
    document.getElementById('hp-bar').style.width = `${(player.hp / player.maxHp) * 100}%`;
    document.getElementById('xp-bar').style.width = `${(xp / nextLevelXp) * 100}%`;
    document.getElementById('hp-text').textContent = `${Math.floor(player.hp)}/${player.maxHp}`;
    document.getElementById('xp-text').textContent = `${xp}/${nextLevelXp}`;
    document.getElementById('kill-count').textContent = kills;
    document.getElementById('gold-count').textContent = gold;
    document.getElementById('wave-count').textContent = wave;
}

// Subir de nível
function levelUp() {
    level++;
    xp = 0;
    nextLevelXp = Math.floor(nextLevelXp * 1.5);
    
    // Tocar som de level up
    playSound(audio.levelUpSound);
    
    // Atualizar tela de upgrade
    document.getElementById('current-level').textContent = level;
    
    // A cada 3 níveis, mostrar upgrade
    if (level % 3 === 0) {
        isPaused = true;
        document.getElementById('upgrade-screen').style.display = 'flex';
    }
    
    updateUI();
}

// Próxima onda
function nextWave() {
    wave++;
    waveKills = 0;
    waveEnemies = 8 + wave * 2;
}

// Game Over
function gameOver() {
    gameStarted = false;
    
    // Tocar som de game over
    playSound(audio.gameOverSound);
    
    // Atualizar estatísticas finais
    document.getElementById('final-level').textContent = level;
    document.getElementById('final-kills').textContent = kills;
    document.getElementById('final-gold').textContent = gold;
    document.getElementById('final-wave').textContent = wave;
    document.getElementById('final-class').textContent = player.class.toUpperCase();
    
    // Mostrar tela de game over
    document.getElementById('gameover-screen').style.display = 'flex';
    document.getElementById('crosshair').style.display = 'none';
    
    // Parar música
    audio.bgMusic.pause();
    audio.bgMusic.currentTime = 0;
}

// ========== CONTROLES ==========

// Teclado
window.onkeydown = (e) => {
    keys[e.code] = true;
    if (e.code === 'Escape') isPaused = !isPaused;
    if (e.code === 'KeyM') toggleMusic();
    if (e.code === 'KeyN') toggleSFX();
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space'].includes(e.code)) {
        e.preventDefault();
    }
};

window.onkeyup = (e) => {
    keys[e.code] = false;
};

// Mouse
window.onmousemove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
};

window.onmousedown = () => {
    mousePressed = true;
};

window.onmouseup = () => {
    mousePressed = false;
};

// Redimensionar
window.onresize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};

// ========== SISTEMA DE PARTÍCULAS ==========

// Criar partículas
function createParticles(x, y, color, count = 8, size = 3) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 1.0,
            decay: 0.03 + Math.random() * 0.02,
            color: color,
            size: Math.random() * size + 2
        });
    }
}

// Criar partículas decorativas
function createDecorativeParticles() {
    for (let i = 0; i < 30; i++) {
        decorativeParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            life: Math.random() * 0.5 + 0.5,
            decay: 0.001,
            color: Math.random() > 0.7 ? 'rgba(212, 175, 55, 0.3)' : 'rgba(139, 115, 85, 0.2)',
            size: Math.random() * 2 + 1
        });
    }
}

// ========== DESENHO DO CENÁRIO SIMPLIFICADO ==========

// Desenhar piso do castelo SIMPLIFICADO
function drawCastleFloor() {
    const tileSize = 100; // Tiles maiores e menos detalhados
    const startX = Math.floor(-cameraX / tileSize) * tileSize;
    const startY = Math.floor(-cameraY / tileSize) * tileSize;
    
    for (let x = startX; x < canvas.width + cameraX + tileSize; x += tileSize) {
        for (let y = startY; y < canvas.height + cameraY + tileSize; y += tileSize) {
            const drawX = x - cameraX;
            const drawY = y - cameraY;
            
            // Cor de fundo suave
            ctx.fillStyle = '#5d4037'; // Marrom mais escuro e uniforme
            ctx.fillRect(drawX, drawY, tileSize, tileSize);
            
            // Borda sutil
            ctx.strokeStyle = '#3e2f2f';
            ctx.lineWidth = 1;
            ctx.strokeRect(drawX, drawY, tileSize, tileSize);
            
            // Apenas uma linha divisória central para dar sensação de pedra
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(drawX + tileSize/2, drawY);
            ctx.lineTo(drawX + tileSize/2, drawY + tileSize);
            ctx.moveTo(drawX, drawY + tileSize/2);
            ctx.lineTo(drawX + tileSize, drawY + tileSize/2);
            ctx.stroke();
        }
    }
    
    // Tapete central sutil
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const carpetSize = 200;
    
    ctx.fillStyle = 'rgba(198, 40, 40, 0.05)'; // Muito mais suave
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, carpetSize, carpetSize/2, 0, 0, Math.PI * 2);
    ctx.fill();
}

// Desenhar jogador
function drawPlayer() {
    const drawX = player.worldX - cameraX;
    const drawY = player.worldY - cameraY;
    const s = player.size;
    
    ctx.save();
    
    // Sombra
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(drawX + s/2, drawY + s + 8, s/2, s/8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Corpo (armadura)
    ctx.fillStyle = player.color;
    ctx.fillRect(drawX + s*0.2, drawY + s*0.3, s*0.6, s*0.7);
    
    // Cabeça
    ctx.fillStyle = '#ffdbac';
    ctx.fillRect(drawX + s*0.25, drawY, s*0.5, s*0.3);
    
    // Detalhes faciais
    ctx.fillStyle = '#5d4037';
    // Olhos
    ctx.fillRect(drawX + s*0.35, drawY + s*0.1, s*0.08, s*0.08);
    ctx.fillRect(drawX + s*0.57, drawY + s*0.1, s*0.08, s*0.08);
    // Boca
    ctx.fillRect(drawX + s*0.4, drawY + s*0.2, s*0.2, s*0.04);
    
    // Detalhes por classe
    if (player.class === 'paladino') {
        // Capacete com crista
        ctx.fillStyle = '#D4AF37';
        ctx.fillRect(drawX + s*0.2, drawY - s*0.1, s*0.6, s*0.1);
        // Crista
        ctx.fillRect(drawX + s*0.3, drawY - s*0.2, s*0.4, s*0.1);
        // Escudo
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(drawX - s*0.3, drawY + s*0.4, s*0.3, s*0.5);
        ctx.fillStyle = '#D4AF37';
        ctx.fillRect(drawX - s*0.2, drawY + s*0.5, s*0.1, s*0.3);
    } else if (player.class === 'arqueiro') {
        // Capuz
        ctx.fillStyle = '#1B5E20';
        ctx.fillRect(drawX + s*0.2, drawY, s*0.6, s*0.15);
        // Arco
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(drawX + s*0.9, drawY + s*0.5, s*0.3, 0.2, Math.PI - 0.2);
        ctx.stroke();
    } else if (player.class === 'mago') {
        // Chapéu pontudo
        ctx.fillStyle = '#4A148C';
        ctx.beginPath();
        ctx.moveTo(drawX + s*0.1, drawY + s*0.1);
        ctx.lineTo(drawX + s*0.5, drawY - s*0.4);
        ctx.lineTo(drawX + s*0.9, drawY + s*0.1);
        ctx.fill();
        // Túnica longa
        ctx.fillStyle = player.color;
        ctx.fillRect(drawX + s*0.1, drawY + s*0.6, s*0.8, s*0.4);
    }
    
    // Arma principal
    ctx.fillStyle = player.weaponColor;
    if (player.class === 'paladino') {
        // Espada
        ctx.fillRect(drawX + s*0.85, drawY + s*0.3, s*0.15, s*0.4);
        // Guarda da espada
        ctx.fillRect(drawX + s*0.8, drawY + s*0.4, s*0.25, s*0.05);
    }
    
    ctx.restore();
}

// Desenhar monstro
function drawMonster(monster) {
    const drawX = monster.worldX - cameraX;
    const drawY = monster.worldY - cameraY;
    const s = monster.size;
    
    ctx.save();
    
    // Sombra
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(drawX + s/2, drawY + s + 8, s/2, s/8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Corpo do monstro
    ctx.fillStyle = monster.color;
    ctx.fillRect(drawX, drawY + s*0.2, s, s*0.8);
    
    // Cabeça
    ctx.fillStyle = monster.color;
    ctx.fillRect(drawX + s*0.2, drawY, s*0.6, s*0.2);
    
    // Detalhes
    ctx.fillStyle = '#000';
    if (monster.name.includes('Esqueleto')) {
        // Olhos vazios
        ctx.fillRect(drawX + s*0.3, drawY + s*0.05, s*0.1, s*0.1);
        ctx.fillRect(drawX + s*0.6, drawY + s*0.05, s*0.1, s*0.1);
    } else {
        // Olhos padrão
        ctx.fillRect(drawX + s*0.3, drawY + s*0.05, s*0.08, s*0.08);
        ctx.fillRect(drawX + s*0.62, drawY + s*0.05, s*0.08, s*0.08);
    }
    
    // Barra de HP
    if (monster.hp < monster.maxHp) {
        const hpPercent = monster.hp / monster.maxHp;
        ctx.fillStyle = '#2d1b1b';
        ctx.fillRect(drawX, drawY - 12, s, 8);
        ctx.fillStyle = hpPercent > 0.5 ? '#4CAF50' : hpPercent > 0.25 ? '#FF9800' : '#F44336';
        ctx.fillRect(drawX, drawY - 12, s * hpPercent, 8);
    }
    
    ctx.restore();
}

// Desenhar projétil
function drawProjectile(proj) {
    const drawX = proj.x - cameraX;
    const drawY = proj.y - cameraY;
    const size = 8;
    
    ctx.save();
    
    // Brilho principal
    ctx.fillStyle = proj.color;
    ctx.beginPath();
    ctx.arc(drawX, drawY, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Efeito de brilho
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(drawX, drawY, size + 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

// Desenhar partículas
function drawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        p.life -= p.decay;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        
        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }
        
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x - cameraX, p.y - cameraY, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Desenhar partículas decorativas
function drawDecorativeParticles() {
    for (let i = decorativeParticles.length - 1; i >= 0; i--) {
        const p = decorativeParticles[i];
        
        p.life -= p.decay;
        p.x += p.vx;
        p.y += p.vy;
        
        // Rebotar nas bordas
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        // Se a partícula morrer, criar uma nova
        if (p.life <= 0) {
            decorativeParticles.splice(i, 1);
            decorativeParticles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                life: Math.random() * 0.5 + 0.5,
                decay: 0.001,
                color: Math.random() > 0.7 ? 'rgba(212, 175, 55, 0.3)' : 'rgba(139, 115, 85, 0.2)',
                size: Math.random() * 2 + 1
            });
            continue;
        }
        
        // Desenhar partícula
        ctx.save();
        ctx.globalAlpha = p.life * 0.3;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Desenhar mira
function drawCrosshair() {
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    
    // Círculo externo
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 20, 0, Math.PI * 2);
    ctx.stroke();
    
    // Linhas cruzadas
    ctx.beginPath();
    ctx.moveTo(mouseX - 25, mouseY);
    ctx.lineTo(mouseX + 25, mouseY);
    ctx.moveTo(mouseX, mouseY - 25);
    ctx.lineTo(mouseX, mouseY + 25);
    ctx.stroke();
    
    // Ponto central
    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 3, 0, Math.PI * 2);
    ctx.fill();
}

// ========== LÓGICA DO JOGO ==========

// Atirar projétil
function shootProjectile() {
    const now = Date.now();
    if (now - player.lastShot < 1000 / player.attackSpeed) return;
    
    // Tocar som de tiro
    playSound(audio.shootSound);
    
    const targetX = mouseX + cameraX;
    const targetY = mouseY + cameraY;
    const angle = Math.atan2(targetY - player.worldY, targetX - player.worldX);
    
    // Cor do projétil baseada na classe
    let projColor;
    switch(player.class) {
        case 'paladino': projColor = '#4fc3f7'; break;
        case 'arqueiro': projColor = '#81c784'; break;
        case 'mago': projColor = '#ba68c8'; break;
        default: projColor = '#FFFFFF';
    }
    
    projectiles.push({
        x: player.worldX,
        y: player.worldY,
        vx: Math.cos(angle) * player.projectileSpeed,
        vy: Math.sin(angle) * player.projectileSpeed,
        damage: player.damage,
        color: projColor,
        size: 8,
        speed: player.projectileSpeed
    });
    
    player.lastShot = now;
}

// Atualizar jogo
function update() {
    if (!gameStarted || isPaused) return;
    
    // Movimentação do jogador
    const moveX = (keys['KeyD'] ? 1 : 0) - (keys['KeyA'] ? 1 : 0);
    const moveY = (keys['KeyS'] ? 1 : 0) - (keys['KeyW'] ? 1 : 0);
    
    if (moveX !== 0 || moveY !== 0) {
        const length = Math.sqrt(moveX * moveX + moveY * moveY);
        player.worldX += (moveX / length) * player.speed;
        player.worldY += (moveY / length) * player.speed;
    }
    
    // Atirar com mouse ou espaço
    if (mousePressed || keys['Space']) {
        shootProjectile();
    }
    
    // Atualizar câmera
    cameraX = player.worldX - canvas.width / 2;
    cameraY = player.worldY - canvas.height / 2;
    
    // Spawn de monstros por onda
    if (waveKills < waveEnemies && Math.random() < 0.02 + (wave * 0.002)) {
        const monsterType = medievalMonsters[Math.floor(Math.random() * medievalMonsters.length)];
        const angle = Math.random() * Math.PI * 2;
        const distance = 400 + Math.random() * 300;
        
        enemies.push({
            ...monsterType,
            worldX: player.worldX + Math.cos(angle) * distance,
            worldY: player.worldY + Math.sin(angle) * distance,
            maxHp: monsterType.hp * (1 + (wave * 0.1)),
            hp: monsterType.hp * (1 + (wave * 0.1))
        });
    }
    
    // Atualizar projéteis
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const proj = projectiles[i];
        proj.x += proj.vx;
        proj.y += proj.vy;
        
        // Remover projéteis muito longe
        const distance = Math.sqrt(
            Math.pow(proj.x - player.worldX, 2) + 
            Math.pow(proj.y - player.worldY, 2)
        );
        
        if (distance > 1200) {
            projectiles.splice(i, 1);
            continue;
        }
        
        // Checar colisão com monstros
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            const dx = proj.x - enemy.worldX;
            const dy = proj.y - enemy.worldY;
            const distanceToEnemy = Math.sqrt(dx * dx + dy * dy);
            
            if (distanceToEnemy < (proj.size + enemy.size/2)) {
                // Acertou o monstro
                enemy.hp -= proj.damage;
                createParticles(proj.x, proj.y, enemy.color, 10, 4);
                
                // Tocar som de acerto
                playSound(audio.hitSound);
                
                if (enemy.hp <= 0) {
                    // Monstro morreu
                    createParticles(enemy.worldX, enemy.worldY, enemy.color, 20, 5);
                    xp += enemy.xp;
                    gold += enemy.gold;
                    kills++;
                    waveKills++;
                    enemies.splice(j, 1);
                    
                    // Tocar som de morte
                    playSound(audio.monsterDeathSound);
                    
                    // Verificar level up
                    if (xp >= nextLevelXp) {
                        levelUp();
                    }
                    
                    // Verificar próxima onda
                    if (waveKills >= waveEnemies) {
                        nextWave();
                    }
                }
                
                // Remover projétil
                projectiles.splice(i, 1);
                break;
            }
        }
    }
    
    // Atualizar monstros
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        // Mover em direção ao jogador
        const dx = player.worldX - enemy.worldX;
        const dy = player.worldY - enemy.worldY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 20) {
            enemy.worldX += (dx / distance) * enemy.speed;
            enemy.worldY += (dy / distance) * enemy.speed;
        }
        
        // Dano ao jogador
        if (distance < 45) {
            player.hp -= 0.3 + (wave * 0.1);
            createParticles(player.worldX, player.worldY, '#F44336', 3, 2);
            
            // Tocar som de dano
            playSound(audio.hitSound);
        }
        
        // Remover monstros muito distantes
        if (distance > 2000) {
            enemies.splice(i, 1);
        }
    }
    
    // Game Over
    if (player.hp <= 0) {
        player.hp = 0;
        gameOver();
    }
    
    updateUI();
}

// ========== DESENHO PRINCIPAL ==========

function draw() {
    // Limpar canvas com cor mais suave
    ctx.fillStyle = '#2d1b1b'; // Cor de fundo mais suave
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (!gameStarted) return;
    
    // Desenhar cenário SIMPLIFICADO
    drawCastleFloor();
    
    // Desenhar partículas decorativas
    drawDecorativeParticles();
    
    // Desenhar partículas de jogo
    drawParticles();
    
    // Desenhar monstros
    enemies.forEach(monster => drawMonster(monster));
    
    // Desenhar projéteis
    projectiles.forEach(proj => drawProjectile(proj));
    
    // Desenhar jogador
    drawPlayer();
    
    // Desenhar mira
    drawCrosshair();
}

// ========== LOOP DO JOGO ==========

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Iniciar o jogo
gameLoop();