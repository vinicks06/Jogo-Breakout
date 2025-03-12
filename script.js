
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