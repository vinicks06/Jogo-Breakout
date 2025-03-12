
const canvas = document.getElementById('JogoCanvas');
const ctx = canvas.getContext('2d');
let gameOver = false;
let pontuacao = 0;
let vidas = 3;


const teclasPressionadas = {
    ArrowRight: false,
    ArrowLeft: false,
};


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

        
        if (this.posx + this.raio * 2 > canvas.width || this.posx < 0) {
            this.velocidadex = -this.velocidadex;
        }

        
        if (this.posy < 0) {
            this.velocidadey = -this.velocidadey;
        }

        
        if (
            this.posy + this.raio * 2 > raquete.posy &&
            this.posx + this.raio * 2 > raquete.posx &&
            this.posx < raquete.posx + raquete.largura
        ) {
            this.velocidadey = -this.velocidadey;
        }

        
        if (this.posy + this.raio * 2 > canvas.height) {
            vidas -= 1;
            if (vidas === 0) {
                gameOver = true;
            } else {
                
                this.posx = canvas.width / 2;
                this.posy = canvas.height / 2;
                raquete.posx = canvas.width / 2 - 50;
            }
        }
    }
}


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

            
        }
    }
}


const raquete = new Raquete(canvas.width / 2 - 50, canvas.height - 30, 100, 10);
const bola = new Bola(canvas.width / 2, canvas.height / 2, 10, 2, -2); 
const blocos = [];


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


function reiniciarJogo() {
    gameOver = false;
    pontuacao = 0;
    vidas = 3;

    
    bola.posx = canvas.width / 2;
    bola.posy = canvas.height / 2;
    bola.velocidadex = 4; 
    bola.velocidadey = -4; 

    raquete.posx = canvas.width / 2 - 50;
    raquete.posy = canvas.height - 30;

    
    blocos.forEach(bloco => {
        bloco.visivel = true;
    });

    
    loop();
}


document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowRight') teclasPressionadas.ArrowRight = true;
    if (e.code === 'ArrowLeft') teclasPressionadas.ArrowLeft = true;
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowRight') teclasPressionadas.ArrowRight = false;
    if (e.code === 'ArrowLeft') teclasPressionadas.ArrowLeft = false;
});


document.addEventListener('keydown', (e) => {
    if (gameOver && e.key === 'r') {
        reiniciarJogo();
    }
});


function atualizarMovimentacao() {
    if (teclasPressionadas.ArrowRight && !teclasPressionadas.ArrowLeft) {
        raquete.velocidadex = 5;
    } else if (teclasPressionadas.ArrowLeft && !teclasPressionadas.ArrowRight) {
        raquete.velocidadex = -5;
    } else {
        raquete.velocidadex = 0;
    }
}


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

    raquete.atualizar();
    bola.atualizar();

    raquete.desenhar();
    bola.desenhar();

    blocos.forEach(bloco => {
        if (bloco.visivel) {
            bloco.desenhar();
            bloco.colidir(bola);
        }
    });

    desenharPontuacao();
    desenharVidas();
    verificarVitoria();

    requestAnimationFrame(loop);
}


loop();