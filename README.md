/**
 * NIGHTFALL ATELIER - GAME ENGINE
 * Desenvolvido por: Luiz Maranhão
 * * Este arquivo gerencia o loop principal, física de colisões
 * e renderização em camadas no HTML5 Canvas.
 */

// --- CONFIGURAÇÕES TÉCNICAS ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ajusta o tamanho do canvas para ocupar a tela inteira
function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// --- ESTADO DO JOGO ---
let gameActive = false;
const enemies = [];
const projectiles = [];

// --- CLASSE DO JOGADOR ---
const player = {
    x: 0, 
    y: 0,
    hp: 100,
    maxHp: 100,
    speed: 5,
    level: 1,
    class: null,
    size: 30
};

/**
 * Sistema de Seleção de Classe
 * Define os atributos iniciais baseados na escolha
 */
function selectClass(className) {
    player.class = className;
    
    // Balanceamento simples por classe
    if (className === 'paladino') {
        player.maxHp = 150;
        player.hp = 150;
        player.speed = 4;
    } else if (className === 'mago') {
        player.maxHp = 80;
        player.hp = 80;
        player.speed = 5;
    }

    // Esconde o menu e inicia o motor
    document.getElementById('selection-screen').style.display = 'none';
    gameActive = true;
    gameLoop();
}

/**
 * Lógica de Atualização (Física e Regras)
 */
function updateLogic() {
    if (!gameActive) return;

    // Aqui entrará a lógica de movimentação (WASD)
    // E a IA básica dos inimigos que vimos antes
}

/**
 * Renderização Gráfica (Desenho)
 */
function renderGraphics() {
    // Limpa a tela para o próximo frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameActive) return;

    // Desenha o Jogador com um efeito de sombra (Glow)
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#4fc3f7";
    ctx.fillStyle = "#4fc3f7";
    ctx.fillRect(
        canvas.width / 2 - player.size / 2, 
        canvas.height / 2 - player.size / 2, 
        player.size, 
        player.size
    );
    
    // Reseta sombra para não afetar outros elementos
    ctx.shadowBlur = 0;

    // Exemplo de desenho de inimigos (os quadrados coloridos da sua print)
    // No futuro, podemos substituir por Sprites de imagem
}

/**
 * Loop Principal (60 FPS)
 */
function gameLoop() {
    updateLogic();
    renderGraphics();
    if (gameActive) {
        requestAnimationFrame(gameLoop);
    }
}

// Inicialização ao carregar a página
window.addEventListener('load', () => {
    setupCanvas();
});

// Garante que o jogo não quebre ao redimensionar a janela
window.addEventListener('resize', setupCanvas);
