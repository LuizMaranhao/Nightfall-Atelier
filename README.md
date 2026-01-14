/**
 * NIGHTFALL ATELIER - GAME ENGINE
 * Desenvolvido por: Luiz Maranhão
 * * Este arquivo gerencia o loop principal, física de colisões
 * e renderização em camadas no HTML5 Canvas.
 */

// --- CONFIGURAÇÕES TÉCNICAS ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Gerencia o redimensionamento dinâmico da janela
function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// --- CLASSE DO JOGADOR ---
// Centralizamos as propriedades para facilitar a manutenção
const player = {
    x: 0, y: 0,         // Posição no mundo
    hp: 100,            // Vida atual
    maxHp: 100,         // Vida máxima (ajustada por classe)
    speed: 5,           // Velocidade de movimento
    level: 1,           // Progressão
    class: null         // Definida na tela de seleção
};

/**
 * Sistema de Seleção de Classe
 * @param {string} className - O tipo de herói escolhido
 */
function selectClass(className) {
    // Lógica de atribuição de status baseada na escolha do usuário
    console.log(`Iniciando jornada como ${className}`);
    // Oculta UI de seleção e inicia o game loop
    document.getElementById('selection-screen').classList.add('hidden');
    startGame();
}

// --- LOOP PRINCIPAL (60 FPS) ---
function gameLoop() {
    updateLogic();      // Processa movimento e colisões
    renderGraphics();   // Desenha os elementos na tela
    requestAnimationFrame(gameLoop);
}

// Inicialização
window.addEventListener('load', () => {
    setupCanvas();
    // O loop só inicia após a interação do usuário para poupar recursos
});
