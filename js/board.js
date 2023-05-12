
export class Board {

    constructor(canvas, ctx, isWhite = true) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.isWhite = isWhite;
    }

    drawSquare([posX, posY], isColored = false) {
        let squareSize = this.canvas.width / 8;
        this.ctx.fillStyle = isColored ? "#593300" : "#ffc67a"
        this.ctx.fillRect((posX-1) * squareSize,(posY-1) * squareSize, this.canvas.width / 8, this.canvas.height / 8);
    }
    
    drawBoard(canvas, ctx) {

        for(let y = 1; y <= 8; y++)
        {
            for(let x = 1; x <= 8; x++)
            {
                this.drawSquare([x,y], ((x+y)%2 == 1));
            }
        }
    }

    screenToSquare(squareSize, [posX, posY]) {

        let squareX = Math.floor(posX / squareSize) + 1;
        let squareY = Math.floor(posY / squareSize) + 1;
    
        return [squareX, squareY];
    }
    
    squareToScreen(squareSize, [squareX, squareY]) {

        let posX = (squareX - 1) * squareSize;
        let posY = (squareY - 1) * squareSize;
    
        return [posX, posY];
    }
    
    hovering([squareX, squareY]) {
        this.drawBoard();
        this.ctx.fillStyle = "rgba(150, 200, 255, 0.5)";
        let pos = this.squareToScreen(this.canvas.width / 8, [squareX,squareY]);
        this.ctx.fillRect(pos[0], pos[1], this.canvas.width / 8, this.canvas.height / 8);
    }

    mouseMoveEvent(e) {
        let posX = (e.clientX - this.canvas.getBoundingClientRect().x);
        let posY = (e.clientY - this.canvas.getBoundingClientRect().y);
    
        //real square size
        let squareSize = this.canvas.getBoundingClientRect().width / 8;
    
        let [squareX, squareY] = this.screenToSquare(squareSize, [posX, posY]);
    
        let coordsText = "squareX: " + squareX + ", squareY: " + squareY;
        console.log("posX: " + posX + ", posY: " + posY);
    
        document.getElementById("position").innerHTML = coordsText;
    
        //If the mouse is over the board
        if(this.posIsOver([posX, posY]))
        {
            this.hovering( this.screenToSquare(squareSize,[posX,posY]) );
        } else {
            console.log('outside');
            this.drawBoard();
        }
    }

    mouseClickEvent(e) {
        let posX = (e.clientX - this.canvas.getBoundingClientRect().x);
        let posY = (e.clientY - this.canvas.getBoundingClientRect().y);
    
    
        //If the mouse is over the board
        if(this.posIsOver([posX, posY]))
        {
            alert(this.coordsToNotation([posX,posY]));
        }
    }

    coordsToNotation([posX, posY]) {
        let squareSize = this.canvas.getBoundingClientRect().width / 8;
        let [squareX, squareY] = this.screenToSquare(squareSize, [posX, posY]);
        let letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

        if(!this.isWhite) {
            squareX = 9 - squareX;
        } else {
            squareY = 9 - squareY;
        }

        return letters[squareX - 1].concat(squareY);
    }

    posIsOver([posX, posY]) {
        return (posX >= this.canvas.getBoundingClientRect().x && posX <= this.canvas.getBoundingClientRect().right
            && posY >= this.canvas.getBoundingClientRect().y && posY <= this.canvas.getBoundingClientRect().bottom)
    }
}