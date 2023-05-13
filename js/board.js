import * as utils from './utils.js';
import {Piece, King, Queen, Bishop, Knight, Rook, Pawn} from './pieces.js';

export class Board {
    #canvas;
    #ctx;
    #isWhite;
    #pieces;
    

    constructor(canvas, ctx, isWhite = true) {
        this.#canvas    = canvas;
        this.#ctx       = ctx;
        this.#isWhite   = isWhite;
        this.#pieces    =  new Array();
        
    }

    get isWhite()
    {
        return this.#isWhite;
    }

    addPiece(piece)
    {
        if(this.#pieces.length >= 64) {
            throw new Error("Board is full !");
        }
        this.#pieces.push(piece)
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

        for(let i = 0;i < this.#pieces.length; i++) {
            
            if(this.#pieces[i] != null && this.#pieces[i] instanceof Piece) {
                this.#pieces[i].draw(this.#canvas, this.#ctx);
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

    importFEN(FEN, tileset) {
        //https://www.chess.com/terms/fen-chess
        //6 fields separated by spaces
        //lower are black upper are white
        //empty is a number 1-8
        //ranks are separated by slash
        //3rd field : The letter "k" indicates that kingside castling is available,
        //      while "q" means that a player may castle queenside. The symbol "-" designates that neither side may castle. 
        //4th field: square behind the pawn in algebraic notation .If no en passant targets available, the "-" symbol is used.
        //      Even though no pawns may capture the e4-pawn, the FEN string would still contain the en passant target square e3 in its fourth field.
        //5th field: Halfmove clock
        //6th field: Fullmove number

        //example starting game FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

        const [position, trait, castling,
            enPassant, halfmoveNb, fullmoveNb] = FEN.split(' ');
        
        let x = 1;
        let y = 1;
        for(let c = 0; c <= position.length; c++)
        {
            let char = position[c];
            let nb = parseInt(char);

            if(nb != NaN && (nb >=1 && nb <= 8) ) {
                x += nb;
            }

            switch(char) {
                case 'r':
                    this.addPiece(new Rook(utils.squareToNotation([x,y], this.#isWhite),false,tileset, this));
                    x++;
                    break;

                case 'n':
                    this.addPiece(new Knight(utils.squareToNotation([x,y], this.#isWhite),false,tileset, this));
                    x++;
                    break;

                case 'b':
                    this.addPiece(new Bishop(utils.squareToNotation([x,y], this.#isWhite),false,tileset, this));
                    x++;
                    break;

                case 'q':
                    this.addPiece(new Queen(utils.squareToNotation([x,y], this.#isWhite),false,tileset, this));
                    x++;
                    break;

                case 'k':
                    this.addPiece(new King(utils.squareToNotation([x,y], this.#isWhite),false,tileset, this));
                    x++;
                    break;

                case 'p':
                    this.addPiece(new Pawn(utils.squareToNotation([x,y], this.#isWhite),false,tileset, this));
                    x++;
                    break;


                case 'R':
                    this.addPiece(new Rook(utils.squareToNotation([x,y], this.#isWhite),true,tileset, this));
                    x++;
                    break;

                case 'N':
                    this.addPiece(new Knight(utils.squareToNotation([x,y], this.#isWhite),true,tileset, this));
                    x++;
                    break;

                case 'B':
                    this.addPiece(new Bishop(utils.squareToNotation([x,y], this.#isWhite),true,tileset, this));
                    x++;
                    break;

                case 'Q':
                    this.addPiece(new Queen(utils.squareToNotation([x,y], this.#isWhite),true,tileset, this));
                    x++;
                    break;

                case 'K':
                    this.addPiece(new King(utils.squareToNotation([x,y], this.#isWhite),true,tileset, this));
                    x++;
                    break;

                case 'P':
                    this.addPiece(new Pawn(utils.squareToNotation([x,y], this.#isWhite),true,tileset, this));
                    x++;
                    break;
                
                case '/':
                    y++;
                    x = 1;
                    break;
            }
            //console.log(position[i]);
            //console.log(utils.squareToNotation([x,y], this.#isWhite));
        }

    }

    // exportFEN() {
    //     let FEN;

    //     return FEN
    // }
}