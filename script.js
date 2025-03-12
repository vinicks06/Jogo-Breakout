
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