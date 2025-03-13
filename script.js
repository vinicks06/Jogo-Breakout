
// Configurações iniciais
const canvas = document.getElementById('JogoCanvas');
const ctx = canvas.getContext('2d');
let gameOver = false;
let pontuacao = 0;
let vidas = 3;
let multiplayerAtivo = false;

// Objeto para rastrear teclas pressionadas
const teclasPressionadas = {
    ArrowRight: false,
    ArrowLeft: false,
    KeyD: false,
    KeyA: false
};

// Classe base para todas as entidades do jogo
class Entidade {
    constructor(posx, posy, largura, altura, velocidadex = 0, velocidadey = 0) {
        this.posx = posx;
        this.posy = posy;
        this.largura = largura;
        this.altura = altura;
        this.velocidadex = velocidadex;
        this.velocidadey = velocidadey;
    }

    desenhar() {
        ctx.fillStyle = this.cor || 'white';
        ctx.fillRect(this.posx, this.posy, this.largura, this.altura);
    }

    atualizar() {
        this.posx += this.velocidadex;
        this.posy += this.velocidadey;
    }

    verificarColisao(outraEntidade) {
        return (
            this.posx < outraEntidade.posx + outraEntidade.largura &&
            this.posx + this.largura > outraEntidade.posx &&
            this.posy < outraEntidade.posy + outraEntidade.altura &&
            this.posy + this.altura > outraEntidade.posy
        );
    }
}

// Classe Raquete
class Raquete extends Entidade {
    constructor(posx, posy, largura, altura) {
        super(posx, posy, largura, altura);
        this.cor = 'white';
    }

    atualizar() {
        super.atualizar();
        if (this.posx < 0) this.posx = 0;
        if (this.posx + this.largura > canvas.width) this.posx = canvas.width - this.largura;
    }
}

// Classe Bola
class Bola extends Entidade {
    constructor(posx, posy, raio, velocidadex, velocidadey) {
        super(posx, posy, raio * 2, raio * 2, velocidadex, velocidadey);
        this.raio = raio;
        this.cor = 'red';
    }

    desenhar() {
        ctx.beginPath();
        ctx.arc(this.posx + this.raio, this.posy + this.raio, this.raio, 0, Math.PI * 2);
        ctx.fillStyle = this.cor;
        ctx.fill();
        ctx.closePath();
    }

    atualizar() {
        super.atualizar();

        // Colisão com as paredes laterais
        if (this.posx + this.raio * 2 > canvas.width || this.posx < 0) {
            this.velocidadex = -this.velocidadex;
        }


        // Colisão com o topo e a base
        if (this.posy < 0 || this.posy + this.raio * 2 > canvas.height) {
            this.velocidadey = -this.velocidadey;
        }

        // Colisão com a raquete do jogador 1 (inferior)
        if (
            this.posy + this.raio * 2 > raqueteJogador1.posy &&
            this.posx + this.raio * 2 > raqueteJogador1.posx &&
            this.posx < raqueteJogador1.posx + raqueteJogador1.largura
        ) {
            this.velocidadey = -this.velocidadey;
        }

        // Colisão com a raquete do jogador 2 (inferior, ao lado da primeira)
        if (
            multiplayerAtivo &&
            this.posy + this.raio * 2 > raqueteJogador2.posy &&
            this.posx + this.raio * 2 > raqueteJogador2.posx &&
            this.posx < raqueteJogador2.posx + raqueteJogador2.largura
        ) {
            this.velocidadey = -this.velocidadey;
        }

        // Verifica se a bola caiu

        if (this.posy + this.raio * 2 > canvas.height || this.posy < 0) {

            vidas -= 1;
            if (vidas === 0) {
                gameOver = true;
            } else {

                // Reinicia a posição da bola

                this.posx = canvas.width / 2;
                this.posy = canvas.height / 2;
            }
        }
    }
}

// Classe Bloco
class Bloco extends Entidade {
    constructor(posx, posy, largura, altura, cor) {
        super(posx, posy, largura, altura);
        this.cor = cor;
        this.visivel = true;
    }

    colidir(bola) {
        if (
            this.visivel &&
            bola.posx + bola.raio * 2 > this.posx &&
            bola.posx < this.posx + this.largura &&
            bola.posy + bola.raio * 2 > this.posy &&
            bola.posy < this.posy + this.altura
        ) {
            this.visivel = false;
            bola.velocidadey = -bola.velocidadey;
            pontuacao += 1;

            // Chance de gerar um Power-Up ao destruir um bloco
            if (Math.random() < 0.2) { // 20% de chance
                powerUps.push(new PowerUp(this.posx + this.largura / 2, this.posy + this.altura / 2));
            }
        }
    }
}

// Classe PowerUp
class PowerUp extends Entidade {
    constructor(posx, posy) {
        super(posx, posy, 20, 20, 0, 2); // Velocidade vertical para cair
        this.tipo = this.gerarTipo();
        this.cor = this.definirCor();
    }


    gerarTipo() {
        const tipos = ['raqueteGrande', 'vidaExtra', 'bolaLenta'];
        return tipos[Math.floor(Math.random() * tipos.length)];
    }

    definirCor() {
        switch (this.tipo) {
            case 'raqueteGrande':
                return 'yellow';
            case 'vidaExtra':
                return 'green';
            case 'bolaLenta':
                return 'blue';
            default:
                return 'white';
        }
    }

    aplicarEfeito() {
        switch (this.tipo) {
            case 'raqueteGrande':
                raqueteJogador1.largura *= 1.5; // Aumenta o tamanho da raquete
                setTimeout(() => {
                    raqueteJogador1.largura /= 1.5; // Volta ao tamanho original após 10 segundos
                }, 10000);
                break;
            case 'vidaExtra':
                vidas += 1; // Adiciona uma vida extra
                break;
            case 'bolaLenta':
                bola.velocidadex *= 0.5; // Diminui a velocidade da bola
                bola.velocidadey *= 0.5;
                setTimeout(() => {
                    bola.velocidadex /= 0.5; // Volta à velocidade original após 10 segundos
                    bola.velocidadey /= 0.5;
                }, 10000);
                break;
        }
    }
}

// Inicialização do jogo
const raqueteJogador1 = new Raquete(canvas.width / 2 - 50, canvas.height - 30, 100, 10);
const raqueteJogador2 = new Raquete(canvas.width / 2 + 100, canvas.height - 30, 100, 10); // Posicionada ao lado da primeira
const bola = new Bola(canvas.width / 2, canvas.height / 2, 10, 4, -4);
const blocos = [];
const powerUps = [];
// Cria os blocos
for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 7; col++) {
        blocos.push(
            new Bloco(
                col * (80 + 10) + 30,
                row * (20 + 10) + 30,
                80,
                20,
                '#0095DD'
            )
        );
    }
}

// Funções auxiliares
function desenharPontuacao() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Pontuação: ${pontuacao}`, 20, 30);
}

function desenharVidas() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Vidas: ${vidas}`, canvas.width - 120, 30);
}

function verificarVitoria() {
    if (blocos.every(bloco => !bloco.visivel)) {
        gameOver = true;
        ctx.fillStyle = 'green';
        ctx.fillRect((canvas.width / 2) - 200, (canvas.height / 2) - 50, 400, 100);
        ctx.fillStyle = 'black';
        ctx.font = '50px Arial';
        ctx.fillText("VITÓRIA!", (canvas.width / 2) - 120, (canvas.height / 2) + 20);
    }
}

// Reiniciar o jogo
function reiniciarJogo() {
    gameOver = false;
    pontuacao = 0;
    vidas = 3;


    // Reseta a posição da bola e das raquetes

    bola.posx = canvas.width / 2;
    bola.posy = canvas.height / 2;
    bola.velocidadex = 4;
    bola.velocidadey = -4;


    raqueteJogador1.posx = canvas.width / 2 - 50;
    raqueteJogador1.posy = canvas.height - 30;


    raqueteJogador2.posx = canvas.width / 2 + 100; // Posicionada ao lado da primeira
    raqueteJogador2.posy = canvas.height - 30;

    // Reseta os blocos
    blocos.forEach(bloco => {
        bloco.visivel = true;
    });

    // Limpa os Power-Ups
    powerUps.length = 0;

    // Reinicia o loop do jogo
    loop();
}

// Event Listeners para movimentação
document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowRight') teclasPressionadas.ArrowRight = true;
    if (e.code === 'ArrowLeft') teclasPressionadas.ArrowLeft = true;
    if (e.code === 'KeyD') teclasPressionadas.KeyD = true;
    if (e.code === 'KeyA') teclasPressionadas.KeyA = true;
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowRight') teclasPressionadas.ArrowRight = false;
    if (e.code === 'ArrowLeft') teclasPressionadas.ArrowLeft = false;
    if (e.code === 'KeyD') teclasPressionadas.KeyD = false;
    if (e.code === 'KeyA') teclasPressionadas.KeyA = false;
});

// Evento para reiniciar o jogo com a tecla "R"
document.addEventListener('keydown', (e) => {
    if (gameOver && e.key === 'r') {
        reiniciarJogo();
    }
});


// Atualiza a movimentação das raquetes

function atualizarMovimentacao() {
    // Movimentação da raquete do jogador 1 (setas)
    if (teclasPressionadas.ArrowRight && !teclasPressionadas.ArrowLeft) {
        raqueteJogador1.velocidadex = 5;
    } else if (teclasPressionadas.ArrowLeft && !teclasPressionadas.ArrowRight) {
        raqueteJogador1.velocidadex = -5;
    } else {
        raqueteJogador1.velocidadex = 0;
    }


    // Movimentação da raquete do jogador 2 (A e D)
    if (multiplayerAtivo) {
        if (teclasPressionadas.KeyD && !teclasPressionadas.KeyA) {
            raqueteJogador2.velocidadex = 5;
        } else if (teclasPressionadas.KeyA && !teclasPressionadas.KeyD) {
            raqueteJogador2.velocidadex = -5;
        } else {
            raqueteJogador2.velocidadex = 0;
        }
    }
}

// Loop do jogo
function loop() {
    if (gameOver) {
        ctx.fillStyle = 'red';
        ctx.fillRect((canvas.width / 2) - 200, (canvas.height / 2) - 50, 400, 100);
        ctx.fillStyle = 'black';
        ctx.font = '50px Arial';
        ctx.fillText("GAME OVER", (canvas.width / 2) - 150, (canvas.height / 2) + 10);
        ctx.fillText("Pressione R para reiniciar", (canvas.width / 2) - 250, (canvas.height / 2) + 60);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    atualizarMovimentacao();

    raqueteJogador1.atualizar();
    raqueteJogador1.desenhar();

    if (multiplayerAtivo) {
        raqueteJogador2.atualizar();
        raqueteJogador2.desenhar();
    }

    bola.atualizar();
    bola.desenhar();

    blocos.forEach(bloco => {
        if (bloco.visivel) {
            bloco.desenhar();
            bloco.colidir(bola);
        }
    });

    // Atualiza e desenha os Power-Ups
    powerUps.forEach((powerUp, index) => {
        powerUp.atualizar();
        powerUp.desenhar();


        // Verifica colisão com a raquete do jogador 1
        if (raqueteJogador1.verificarColisao(powerUp)) {

            powerUp.aplicarEfeito();
            powerUps.splice(index, 1); // Remove o Power-Up após a colisão
        }

        // Remove o Power-Up se cair fora da tela
        if (powerUp.posy > canvas.height) {
            powerUps.splice(index, 1);
        }
    });

    desenharPontuacao();
    desenharVidas();
    verificarVitoria();

    requestAnimationFrame(loop);
}

// Evento para ativar o multiplayer
document.getElementById('multiplayerBtn').addEventListener('click', () => {
    multiplayerAtivo = true;
});

// Inicia o jogo
loop();