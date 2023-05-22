import * as utils from './utils.js';
import {Piece, King, Queen, Bishop, Knight, Rook, Pawn} from './pieces.js';

export class Board {
    #canvas;
    #ctx;
    #isWhite;
    #defSquareSize;
    #pieces = [];

    //TODO array of bits instead of coordinates, better optimization
    #threatMap = [];

    realSquareSize;
    draggedPiece;
    possibleMoves = [];
    enPassantPawns = [];

    constructor(canvas, ctx, isWhite = true) {
        this.#canvas    = canvas;
        this.#ctx       = ctx;
        this.#isWhite   = isWhite;
        this.#pieces    =  new Array();
        this.enPassantPawns = new Array();
        
        this.#defSquareSize = this.#canvas.width / 8;
        this.refreshSquareSize();
    }

    get isWhite()
    {
        return this.#isWhite;
    }

    get canvas() {
        return this.#canvas;
    }

    #drawSquare([posX, posY], isColored = false) {
        //this.#ctx.fillStyle = isColored ? "#693e04" : "#ffc67a";
        this.#ctx.fillStyle = isColored ? "#5c84bf" : "#e8e8e8";
        this.#ctx.fillRect((posX-1) * this.#defSquareSize,(posY-1) * this.#defSquareSize, this.#defSquareSize, this.#defSquareSize);
    }

    refreshSquareSize() {
        this.realSquareSize = this.#canvas.getBoundingClientRect().width / 8;
    }
    #drawBackground() {
        for(let y = 1; y <= 8; y++)
        {
            for(let x = 1; x <= 8; x++)
            {
                this.#drawSquare([x,y], ((x+y)%2 == 1));
            }
        }
    }

    #moveCircle([squareX, squareY], color) {
        this.#ctx.fillStyle = color;
        let [posX, posY] = utils.squareToPos(this.#canvas.width / 8, [squareX,squareY]);
        this.#ctx.beginPath();
        let ratio = 10;
        let radius =  this.#canvas.width / 8 / ratio;
        this.#ctx.arc(posX+(radius*ratio/2), posY+(radius*ratio/2), radius, 0, 180);
        this.#ctx.fill();
    }

    #highlightSquare([squareX, squareY], color) {
        this.#ctx.fillStyle = color;
        let [posX, posY] = utils.squareToPos(this.#canvas.width / 8, [squareX,squareY]);
        this.#ctx.fillRect(posX, posY, this.#canvas.width / 8, this.#canvas.height / 8);
    }

    #drawPossibleMoves() {
        for(let i = 0; i < this.possibleMoves.length; i++) {
            let [[squareX, squareY], isAttacking] = this.possibleMoves[i];
            let color = "rgba(214, 155, 88, 0.7)";

            if(!isAttacking) {
                this.#moveCircle([squareX, squareY], color);
            } else {
                this.#ctx.globalAlpha = 0.4;
                this.#highlightSquare([squareX, squareY], color);
                this.#ctx.globalAlpha = 1;

            }
        }
    }

    #drawThreatMap() {
        let color = "rgba(214, 0, 0, 0.3)";
        for(let square of this.#threatMap) {
            this.#highlightSquare(square, color);
        }
    }

    #drawPieces() {
        for(let i = 0;i < this.#pieces.length; i++) {
            
            if(this.#pieces[i] != null && this.#pieces[i] instanceof Piece) {
                this.#pieces[i].draw(this.#canvas, this.#ctx);
            }
        }
    }
    
    draw() {
        this.#drawBackground();
        this.#drawPossibleMoves();
        //TODO draw selected square (with right click)
        this.#drawThreatMap();
        this.#drawPieces();
    }

    #posIsOver([posX, posY]) {
        return (posX >= this.#canvas.getBoundingClientRect().x && posX <= this.#canvas.getBoundingClientRect().right
            && posY >= this.#canvas.getBoundingClientRect().y && posY <= this.#canvas.getBoundingClientRect().bottom);
    }

    mouseMoveEvent(e) {
        let posX = (e.clientX - this.#canvas.getBoundingClientRect().x);
        let posY = (e.clientY - this.#canvas.getBoundingClientRect().y);

        //If the mouse is over the board
        if(this.#posIsOver([e.clientX, e.clientY]))
        {
            this.draw();

            if(this.draggedPiece) {

                let ratio = this.realSquareSize / (this.#canvas.width / 8 );
                this.draggedPiece.setPosition([(posX / ratio) - (this.realSquareSize/ratio)/2,
                                               (posY / ratio) - (this.realSquareSize/ratio)/2]);
                                               
                this.draggedPiece.draw(this.#canvas, this.#ctx);
            }

        } else {
            this.draw();
        }        
    }

    mouseDownEvent(e) {
        let posX = (e.clientX - this.#canvas.getBoundingClientRect().x);
        let posY = (e.clientY - this.#canvas.getBoundingClientRect().y);
        
        //Right-click or middle
        if((e.button == 2 || e.button == 1) && this.draggedPiece){
            this.cancelMove();
        }
        //If the mouse is over the board and left-click
        if(this.#posIsOver([e.clientX, e.clientY]) && e.button == 0)
        {

            let caseClicked = utils.coordsToNotation(this.realSquareSize, [posX,posY], this.#isWhite)
            this.draggedPiece = this.pieceAt(caseClicked);

            if(this.draggedPiece) {
                this.#threatMap = this.#computeThreatMap(!this.draggedPiece.isWhite);
            }
            console.log(this.#threatMap);

            this.possibleMoves = this.#computeMoves(caseClicked);
            this.draw();
        }
    }

    mouseUpEvent(e) {
        let posX = (e.clientX - this.#canvas.getBoundingClientRect().x);
        let posY = (e.clientY - this.#canvas.getBoundingClientRect().y);
    
        //If the mouse is over the board
        if(this.#posIsOver([e.clientX, e.clientY]))
        {
            let caseReleased = utils.coordsToNotation(this.realSquareSize, [posX,posY], this.#isWhite)

            if(this.draggedPiece) {
                this.movePiece(this.draggedPiece, caseReleased);
                delete this.draggedPiece;
            }

            this.draw();
        } else {
            this.cancelMove();
        }

        this.possibleMoves = [];
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

        for(let i = 0; i < this.#pieces.length; i++)
        {
            let piece = this.#pieces[i];

            str += (piece) ? `[${piece.toString()}]` : "[  ]";

            if((i+1)%8 == 0) {
                str += '\n';
            }
        }

        return str;
    }

    pieceAt(notation) {
        let [x, y] = utils.posToSquare(this.realSquareSize, utils.notationToCoords(this.realSquareSize,notation,this.#isWhite));

        return this.#pieces[(y - 1) * 8 + (x - 1)];
    }

    pieceAtSquare([squareX, squareY]) {
        return this.#pieces[(squareY - 1) * 8 + (squareX - 1)];
    }

    removeAt(notation) {
        let [x, y] = utils.posToSquare(this.realSquareSize, utils.notationToCoords(this.realSquareSize,notation,this.#isWhite));
        delete this.#pieces[(y - 1) * 8 + (x - 1)];
    }

    //TODO #checkMoveLegal(piece, notation)
    #checkMoveLegal(notation) {
        let moveIsLegal = false;
        //then Maybe we can do piece.legalMoves instead
        for(let i = 0; i < this.possibleMoves.length; i++) {
            let [moveX, moveY] = this.possibleMoves[i][0];
            if(moveX >= 1 && moveX <= 8 && moveY >= 1 && moveY <= 8) {
                if(notation == utils.squareToNotation([moveX, moveY],this.#isWhite)) {
                    moveIsLegal = true;
                }
            }
        }

        return moveIsLegal;
    }

    movePiece(piece, notation) {

        let [x, y] = utils.posToSquare(this.realSquareSize, utils.notationToCoords(this.realSquareSize,notation,this.#isWhite));

        let moveIsLegal = this.#checkMoveLegal(notation);

        console.log("Name: ", piece.name,"is IN :", this.#isInThreatMap([x, y]))
        if(piece.name == "King" && this.#isInThreatMap([x, y])) {
            moveIsLegal = false;
        }

        if(piece.notation == notation) {
            moveIsLegal = false;
        }

        let victim = this.pieceAt(notation);
        if(moveIsLegal && ((victim && victim.isWhite != piece.isWhite) || !victim) ) {
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
        }
    }

    #isInThreatMap([squareX, squareY]) {
        let isInIt = false;
        
        for(let [tX, tY] of this.#threatMap) {
            if(squareX == tX && squareY == tY) {
                isInIt = true;
            }
        }

        return isInIt;
    }
    //TODO pass the piece instead of the notation
    #computeMoves(caseClicked) {
        let possibleMoves = [];
        let piece = this.pieceAt(caseClicked);

        if(piece) {
            let legalMoves = piece.legalMoves
    
            let [squareX, squareY] = utils.posToSquare(this.realSquareSize,utils.notationToCoords(
                                    this.realSquareSize,caseClicked,this.#isWhite),this.#isWhite);

            for(let i = 0; i < legalMoves.length; i++) {
                let [[moveX, moveY], isAttacking] = legalMoves[i];
    
                let pMove = [squareX + moveX, squareY + moveY];
                possibleMoves.push([pMove,isAttacking]);
            }
        }

        return possibleMoves;
    }

    #computeThreatMap(isWhite) {
        let threatMap = [];
        for(let piece of this.#pieces) {
            if(piece && piece.isWhite == isWhite) {
                for(let square of piece.attackSquares) {
                        threatMap.push(square);
                }
            }
        }
        
        return threatMap;
    }

    computeEnPassant(piece, notation) {
        let [squareX, squareY] = utils.posToSquare(this.realSquareSize,utils.notationToCoords(
            this.realSquareSize,notation,this.#isWhite),this.#isWhite);

        let pieceLeft = this.pieceAtSquare([squareX - 1, squareY]);
        let pieceRight = this.pieceAtSquare([squareX + 1, squareY]);

        if(!this.#isWhite) {
            let pC = pieceLeft;
            pieceLeft = pieceRight;
            pieceRight = pC;
        }

        if(pieceRight) {
            if(pieceRight.isWhite) {
                pieceRight.enPassantL = !piece.isWhite;
            } else {
                pieceRight.enPassantR = piece.isWhite;
            }

            if(pieceRight.enPassantL || pieceRight.enPassantR) {
                this.enPassantPawns.push(pieceRight);
            }
        }

        if(pieceLeft) {
            if(pieceLeft.isWhite) {
                pieceLeft.enPassantR = !piece.isWhite;
            } else {
                pieceLeft.enPassantL = piece.isWhite;
            }

            if(pieceLeft.enPassantL || pieceLeft.enPassantR) {
                this.enPassantPawns.push(pieceLeft);
            }
        }
    }

    removeEnPassants() {
        if(this.enPassantPawns) {
            for(let i = 0; i < this.enPassantPawns.length; i++) {
                this.enPassantPawns[i].enPassantL = false;
                this.enPassantPawns[i].enPassantR = false;
            }
        }
    }

}