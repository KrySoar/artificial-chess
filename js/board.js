import * as utils from './utils.js';
import {Piece, King, Queen, Bishop, Knight, Rook, Pawn} from './pieces.js';

export class Board {
    #canvas;
    #ctx;
    #isWhite;
    #pieces;
    draggedPiece;
    possibleMoves; 

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

    get canvas() {
        return this.#canvas;
    }

    #drawSquare([posX, posY], isColored = false) {
        let squareSize = this.#canvas.width / 8;
        this.#ctx.fillStyle = isColored ? "black" : "white";
        this.#ctx.fillStyle = isColored ? "#693e04" : "#ffc67a";
        //this.#ctx.fillStyle = isColored ? "#5c84bf" : "#e8e8e8";
        this.#ctx.fillRect((posX-1) * squareSize,(posY-1) * squareSize, this.#canvas.width / 8, this.#canvas.height / 8);
    }
    
    drawBoard() {

        //Squares
        for(let y = 1; y <= 8; y++)
        {
            for(let x = 1; x <= 8; x++)
            {
                this.#drawSquare([x,y], ((x+y)%2 == 1));
            }
        }

        //In-between

        //Pieces
        for(let i = 0;i < this.#pieces.length; i++) {
            
            if(this.#pieces[i] != null && this.#pieces[i] instanceof Piece) {
                this.#pieces[i].draw(this.#canvas, this.#ctx);
            }
        }

        
        if(this.possibleMoves) {
            for(let i = 0; i < this.possibleMoves.length; i++) {
                let [[squareX, squareY], isAttacking] = this.possibleMoves[i];
                //let color = "rgba(0, 100, 200, 0.3)";
                let color = "rgba(66, 135, 245, 0.3)";
                color = "rgba(151, 94, 20, 0.5)";
                if(!isAttacking) {
                    this.moveCircle([squareX, squareY], color);
                } else {
                    this.highlightSquare([squareX, squareY], "rgba(200, 50, 50, 0.5)");
                }
            }
        }
    }

    highlightIndex(index, color) {
        let x = index%8;
        let y = Math.floor(index/8) +1;

        if (x ==  0) {
            x = 8;
            y -= 1;
        }

        this.highlightSquare([x, y], color);
    }
    
    highlightSquare([squareX, squareY], color) {
        this.#ctx.fillStyle = color;
        let [posX, posY] = utils.squareToPos(this.#canvas.width / 8, [squareX,squareY]);
        this.#ctx.fillRect(posX, posY, this.#canvas.width / 8, this.#canvas.height / 8);
    }

    moveCircle([squareX, squareY], color) {
        this.#ctx.fillStyle = color;
        let [posX, posY] = utils.squareToPos(this.#canvas.width / 8, [squareX,squareY]);
        this.#ctx.beginPath();
        let ratio  = 10;
        let radius = this.#canvas.width / 8 / ratio;
        this.#ctx.arc(posX+(radius*ratio/2), posY+(radius*ratio/2), radius, 0, 180);
        this.#ctx.fill();
    }
    mouseMoveEvent(e) {
        let posX = (e.clientX - this.#canvas.getBoundingClientRect().x);
        let posY = (e.clientY - this.#canvas.getBoundingClientRect().y);
    
        //real square size
        let squareSize = this.#canvas.getBoundingClientRect().width / 8;
    
        //If the mouse is over the board
        if(this.#posIsOver([e.clientX, e.clientY]))
        {
            this.drawBoard();

            if(this.draggedPiece) {

                let ratio = (this.#canvas.getBoundingClientRect().width / 8) / (this.#canvas.width / 8 );
                this.draggedPiece.setPosition([(posX / ratio) - (squareSize/ratio)/2,
                                               (posY / ratio) - (squareSize/ratio)/2]);
                                               
                this.draggedPiece.draw(this.#canvas, this.#ctx);
            }

        } else {
            this.drawBoard();
        }        
    }

    mouseDownEvent(e) {
        let posX = (e.clientX - this.#canvas.getBoundingClientRect().x);
        let posY = (e.clientY - this.#canvas.getBoundingClientRect().y);

        let squareSize = this.#canvas.getBoundingClientRect().width / 8;

        //Right-click
        if(e.button == 2 && this.draggedPiece){
            this.cancelMove();
        }
        //If the mouse is over the board
        if(this.#posIsOver([e.clientX, e.clientY]))
        {

            let caseClicked = utils.coordsToNotation(squareSize, [posX,posY], this.#isWhite)
            this.draggedPiece = this.pieceAt(caseClicked);

            this.#computeMoves(caseClicked);
            this.drawBoard();
        }
    }

    mouseUpEvent(e) {
        let posX = (e.clientX - this.#canvas.getBoundingClientRect().x);
        let posY = (e.clientY - this.#canvas.getBoundingClientRect().y);

        let squareSize = this.#canvas.getBoundingClientRect().width / 8;
    
        //If the mouse is over the board
        if(this.#posIsOver([e.clientX, e.clientY]))
        {
            let caseReleased = utils.coordsToNotation(squareSize, [posX,posY], this.#isWhite)

            this.movePiece(this.draggedPiece, caseReleased);
            delete this.draggedPiece;

            // console.log(this.toString());
            // console.log(this.#pieces);

            this.drawBoard();
        } else {
            this.cancelMove();
        }

        delete this.possibleMoves;
    }

    #posIsOver([posX, posY]) {
        return (posX >= this.#canvas.getBoundingClientRect().x && posX <= this.#canvas.getBoundingClientRect().right
            && posY >= this.#canvas.getBoundingClientRect().y && posY <= this.#canvas.getBoundingClientRect().bottom)
    }

    importFEN(FEN, tileset) {
        //https://www.chess.com/terms/fen-chess
        //example starting game FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

        const pieceMap = {
            'K': King,
            'Q': Queen,
            'B': Bishop,
            'N': Knight,
            'R': Rook,
            'P': Pawn,
        }

        let [position, trait, castling,
            enPassant, halfmoveNb, fullmoveNb] = FEN.split(' ');

            if(!this.#isWhite) {
                position = position.split('').reverse().join('');
            }
        
        let x = 1;
        let y = 1;
        for(let c = 0; c <= position.length; c++)
        {
            let char = position[c];
            let nb = parseInt(char);

            if(nb != NaN && (nb >=1 && nb <= 8) ) {
                x += nb;
            }

            if(['K', 'Q', 'B', 'N', 'R', 'P', 'k', 'q', 'b', 'n', 'r', 'p'].includes(char)) {
                this.#pieces[(y-1) * 8 + (x-1)] = new pieceMap[char.toUpperCase()](
                    utils.squareToNotation([x,y], this.#isWhite),(char==char.toUpperCase()),tileset, this)
                x++;
            } else if(char == '/') {
                y++;
                x = 1;
            }
        }

    }

    // exportFEN() {
    //     let FEN;

    //     return FEN
    // }

    toString() {

        let str = "";

        const pieceMap = {
            "Piece": 'P',
            "King": 'K',
            "Queen": 'Q',
            "Bishop": 'B',
            "Knight": 'N',
            "Rook": 'R',
            "Pawn": 'P',
        };
        

        for(let i = 0; i < this.#pieces.length; i++)
        {
            let piece = this.#pieces[i];
            let colorChar = '';
            let pieceString = "";
            
            if(piece) {
                colorChar = piece.isWhite ? 'w' : 'b';
                pieceString = colorChar + pieceMap[piece.name];
            } else {
                pieceString = "  ";
            }

            str += `[${pieceString}]`;

            if((i+1)%8 == 0) {
                str += '\n';
            }
        }

        return str;
    }

    pieceAt(notation) {
        let squareSize = this.#canvas.getBoundingClientRect().width / 8; 
        let [x, y] = utils.posToSquare(squareSize, utils.notationToCoords(squareSize,notation,this.#isWhite));

        return this.#pieces[(y - 1) * 8 + (x - 1)];
    }

    pieceAtSquare([squareX, squareY]) {
        return this.#pieces[(squareY - 1) * 8 + (squareX - 1)];
    }

    removeAt(notation) {
        let squareSize = this.#canvas.getBoundingClientRect().width / 8; 
        let [x, y] = utils.posToSquare(squareSize, utils.notationToCoords(squareSize,notation,this.#isWhite));
        delete this.#pieces[(y - 1) * 8 + (x - 1)];
    }

    movePiece(piece, notation) {
        let squareSize = this.#canvas.getBoundingClientRect().width / 8; 
        let [x, y] = utils.posToSquare(squareSize, utils.notationToCoords(squareSize,notation,this.#isWhite));

        let moveIsLegal = true;

        for(let i = 0; i < this.possibleMoves.length; i++) {
            let [moveX, moveY] = this.possibleMoves[i][0];
            if(moveX >= 1 && moveX <= 8 && moveY >= 1 && moveY <= 8) {
                if(notation == utils.squareToNotation([moveX, moveY],this.#isWhite)) {
                    moveIsLegal = true;
                }
            }
        }

        if(moveIsLegal && ((this.pieceAt(notation) && this.pieceAt(notation).isWhite != piece.isWhite)
            || !this.pieceAt(notation)) ) {
        
            //Eat
            this.removeAt(notation);

            let oldNotation = piece.notation;
            this.removeAt(oldNotation);

            piece.setNotationPos(notation);
            this.#pieces[(y - 1) * 8 + (x - 1)] = piece;

            piece._hasMoved = true;
        } else {
            this.cancelMove();
        }
       
    }

    cancelMove() {
        if(this.draggedPiece) {
            this.draggedPiece.setNotationPos(this.draggedPiece.notation);
            delete this.draggedPiece;
            this.drawBoard();
        }
    }

    #computeMoves(caseClicked) {
        let squareSize = this.#canvas.getBoundingClientRect().width / 8;
        let legalMoves = this.pieceAt(caseClicked).legalMoves

        let [squareX, squareY] = utils.posToSquare(squareSize,utils.notationToCoords(
                                squareSize,caseClicked,this.#isWhite),this.#isWhite);

        this.possibleMoves = new Array();
        for(let i = 0; i < legalMoves.length; i++) {
            let [[moveX, moveY], isAttacking] = legalMoves[i];

            let pMove = [squareX + moveX, squareY + moveY];
            this.possibleMoves.push([pMove,isAttacking]);
        }
    }

}