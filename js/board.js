import * as utils from './utils.js';

export class Board {
    #canvas;
    #ctx;
    #isWhite;
    #pieces = []; //Array of pieces 
    

    constructor(canvas, ctx, isWhite = true) {
        this.#canvas    = canvas;
        this.#ctx       = ctx;
        this.#isWhite   = isWhite;
    }

    get isWhite()
    {
        return this.#isWhite;
    }

    drawSquare([posX, posY], isColored = false) {
        let squareSize = this.#canvas.width / 8;
        this.#ctx.fillStyle = isColored ? "#593300" : "#ffc67a"
        this.#ctx.fillRect((posX-1) * squareSize,(posY-1) * squareSize, this.#canvas.width / 8, this.#canvas.height / 8);
    }
    
    drawBoard() {

        for(let y = 1; y <= 8; y++)
        {
            for(let x = 1; x <= 8; x++)
            {
                this.drawSquare([x,y], ((x+y)%2 == 1));
            }
        }
    }
    
    #hovering([squareX, squareY]) {
        this.drawBoard();
        this.#ctx.fillStyle = "rgba(150, 200, 255, 0.5)";
        let pos = utils.squareToPos(this.#canvas.width / 8, [squareX,squareY]);
        this.#ctx.fillRect(pos[0], pos[1], this.#canvas.width / 8, this.#canvas.height / 8);
    }

    mouseMoveEvent(e) {
        let posX = (e.clientX - this.#canvas.getBoundingClientRect().x);
        let posY = (e.clientY - this.#canvas.getBoundingClientRect().y);
    
        //real square size
        let squareSize = this.#canvas.getBoundingClientRect().width / 8;
    
        let [squareX, squareY] = utils.posToSquare(squareSize, [posX, posY]);
    
        let coordsText = "squareX: " + squareX + ", squareY: " + squareY;
        //console.log("posX: " + posX + ", posY: " + posY);
    
        document.getElementById("position").innerHTML = coordsText;
    
        //If the mouse is over the board
        if(this.#posIsOver([posX, posY]))
        {
            this.#hovering( utils.posToSquare(squareSize,[posX,posY]) );
        } else {
            this.drawBoard();
        }
    }

    mouseClickEvent(e) {
        let posX = (e.clientX - this.#canvas.getBoundingClientRect().x);
        let posY = (e.clientY - this.#canvas.getBoundingClientRect().y);

        let squareSize = this.#canvas.getBoundingClientRect().width / 8;
    
        //If the mouse is over the board
        if(this.#posIsOver([posX, posY]))
        {
            alert(utils.coordsToNotation(squareSize, [posX,posY], this.#isWhite));
        }
    }

    #posIsOver([posX, posY]) {
        return (posX >= this.#canvas.getBoundingClientRect().x && posX <= this.#canvas.getBoundingClientRect().right
            && posY >= this.#canvas.getBoundingClientRect().y && posY <= this.#canvas.getBoundingClientRect().bottom)
    }
}