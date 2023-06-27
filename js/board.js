import * as utils from './utils.js';
import {Piece, King, Queen, Bishop, Knight, Rook, Pawn} from './pieces.js';

export class Board {
    _canvas;
    _ctx;
    _isWhite;
    _defSquareSize;
    _pieces = [];
    
    _threatMap = [];

    realSquareSize;
    draggedPiece;
    possibleMoves = [];
    enPassantPawns = [];

    constructor(canvas, ctx, isWhite = true) {
        this._canvas    = canvas;
        this._ctx       = ctx;
        this._isWhite   = isWhite;
        this._pieces    =  new Array();
        this.enPassantPawns = new Array();
        
        this._defSquareSize = this._canvas.width / 8;
        this.refreshSquareSize();
    }

    get isWhite()
    {
        return this._isWhite;
    }

    get canvas() {
        return this._canvas;
    }


    _drawSquare([posX, posY], isColored = false) {
        //this._ctx.fillStyle = isColored ? "#693e04" : "#ffc67a";
        this._ctx.fillStyle = isColored ? "#5c84bf" : "#e8e8e8";
        this._ctx.fillRect((posX-1) * this._defSquareSize,(posY-1) * this._defSquareSize, this._defSquareSize, this._defSquareSize);
    }

    refreshSquareSize() {
        this.realSquareSize = this._canvas.getBoundingClientRect().width / 8;
    }
    _drawBackground() {
        for(let y = 1; y <= 8; y++)
        {
            for(let x = 1; x <= 8; x++)
            {
                this._drawSquare([x,y], ((x+y)%2 == 1));
            }
        }
    }

    _moveCircle([squareX, squareY], color) {
        this._ctx.fillStyle = color;
        let [posX, posY] = utils.squareToPos(this._canvas.width / 8, [squareX,squareY]);
        this._ctx.beginPath();
        let ratio = 10;
        let radius =  this._canvas.width / 8 / ratio;
        this._ctx.arc(posX+(radius*ratio/2), posY+(radius*ratio/2), radius, 0, 180);
        this._ctx.fill();
    }

    _highlightSquare([squareX, squareY], color) {
        this._ctx.fillStyle = color;
        let [posX, posY] = utils.squareToPos(this._canvas.width / 8, [squareX,squareY]);
        this._ctx.fillRect(posX, posY, this._canvas.width / 8, this._canvas.height / 8);
    }

    _drawPossibleMoves() {
        for(let i = 0; i < this.possibleMoves.length; i++) {
            let [[squareX, squareY], isAttacking] = this.possibleMoves[i];
            let color = "rgba(214, 155, 88, 0.7)";

            if(!isAttacking) {
                this._moveCircle([squareX, squareY], color);
            } else {
                this._ctx.globalAlpha = 0.4;
                this._highlightSquare([squareX, squareY], color);
                this._ctx.globalAlpha = 1;

            }
        }
    }

    _drawThreatMap() {
        let color = "rgba(255, 0, 255, 0.3)";
        for(let square of this._threatMap) {
            this._highlightSquare(square, color);
        }
    }

    _drawPieces() {
        for(let i = 0;i < this._pieces.length; i++) {
            
            if(this._pieces[i] != null && this._pieces[i] instanceof Piece) {
                this._pieces[i].draw(this._canvas, this._ctx);
            }
        }
    }

    _drawInCheck() {
        let squareX, squareY;
        for(let p of this._pieces) {
            if(p && p.name == "King" && p.isInCheck) {
                [squareX, squareY] = utils.posToSquare(this.realSquareSize,utils.notationToCoords(
                    this.realSquareSize,p.notation,this._isWhite),this._isWhite);

                    this._highlightSquare([squareX, squareY],"#ff3838");
            }
        }
    }
    
    draw() {
        this._drawBackground();
        this._drawPossibleMoves();
        //TODO draw selected square (with right click)
        //this._drawThreatMap();
        this._drawInCheck();
        this._drawPieces();
    }

    _posIsOver([posX, posY]) {
        return (posX >= this._canvas.getBoundingClientRect().x && posX <= this._canvas.getBoundingClientRect().right
            && posY >= this._canvas.getBoundingClientRect().y && posY <= this._canvas.getBoundingClientRect().bottom);
    }

    mouseMoveEvent(e) {
        let posX = (e.clientX - this._canvas.getBoundingClientRect().x);
        let posY = (e.clientY - this._canvas.getBoundingClientRect().y);

        //If the mouse is over the board
        if(this._posIsOver([e.clientX, e.clientY]))
        {
            this.draw();

            if(this.draggedPiece) {

                let ratio = this.realSquareSize / (this._canvas.width / 8 );
                this.draggedPiece.setPosition([(posX / ratio) - (this.realSquareSize/ratio)/2,
                                               (posY / ratio) - (this.realSquareSize/ratio)/2]);
                                               
                this.draggedPiece.draw(this._canvas, this._ctx);
            }

        } else {
            this.draw();
        }        
    }

    mouseDownEvent(e) {
        let posX = (e.clientX - this._canvas.getBoundingClientRect().x);
        let posY = (e.clientY - this._canvas.getBoundingClientRect().y);
        
        //Right-click or middle
        if((e.button == 2 || e.button == 1) && this.draggedPiece){
            this.cancelMove();
        }
        //If the mouse is over the board and left-click
        if(this._posIsOver([e.clientX, e.clientY]) && e.button == 0)
        {

            let caseClicked = utils.coordsToNotation(this.realSquareSize, [posX,posY], this._isWhite)
            this.draggedPiece = this.pieceAt(caseClicked);

            if(this.draggedPiece) {
                this._threatMap = this._computeThreatMap(!this.draggedPiece.isWhite);
                this.possibleMoves = this._computeMoves(this.draggedPiece);

                ///////////////////Discovered Check////////////

                let [pSquareX, pSquareY] = utils.posToSquare(this.realSquareSize, 
                    utils.notationToCoords(this.realSquareSize, this.draggedPiece.notation, this.isWhite));
                
                let sameColorKing;

                for(let p of this._pieces) {
                    if(p && p.name == "King" && p.isWhite == this.draggedPiece.isWhite) {
                        sameColorKing = p;
                    }
                }

                for(let [[moveX, moveY], isAttacking] of this.draggedPiece.legalMoves) {
                    console.log([moveX + pSquareX, moveY + pSquareY])
                    let moveNotation = utils.squareToNotation([moveX + pSquareX, moveY + pSquareY],this.isWhite);
                    //console.log(moveNotation);
                    let threatMapAfter = this._computeThreatMapAfter(this.draggedPiece.isWhite, this.draggedPiece, moveNotation);
                    
                    if(this._isInThreatMap(sameColorKing, threatMapAfter)) {
                        console.log("OK");
                        //TODO remove move
                        //console.log(this.possibleMoves);
                        
                        for(let i = 0; i < this.possibleMoves.length; i++) {
                            if(this.possibleMoves[i][0][0] == (moveX + pSquareX)
                            && this.possibleMoves[i][0][1] == (moveY + pSquareY)) {

                                console.log(i);
                                //this.possibleMoves.splice(i,1);
                            }
                        }
                    }
                    
                }
                /////////////////////////////////////////////
            }

            this.draw();
        }
    }

    mouseUpEvent(e) {
        let posX = (e.clientX - this._canvas.getBoundingClientRect().x);
        let posY = (e.clientY - this._canvas.getBoundingClientRect().y);
    
        //If the mouse is over the board
        if(this._posIsOver([e.clientX, e.clientY]))
        {
            let caseReleased = utils.coordsToNotation(this.realSquareSize, [posX,posY], this._isWhite)

            if(this.draggedPiece) {
                this.movePiece(this.draggedPiece, caseReleased);
                delete this.draggedPiece;

                this._computeInCheck();
            }

            this.draw();
        } else {
            this.cancelMove();
        }

        this.possibleMoves = [];
    }

    //TODO Import PGN
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
        
        //TODO Finish importFEN
        let [position, trait, castling,
            enPassant, halfmoveNb, fullmoveNb] = FEN.split(' ');

            if(!this._isWhite) {
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
                this._pieces[(y-1) * 8 + (x-1)] = new pieceMap[char.toUpperCase()](
                    utils.squareToNotation([x,y], this._isWhite),(char==char.toUpperCase()),tileset, this)
                x++;
            } else if(char == '/') {
                y++;
                x = 1;
            }
        }

    }

    //TODO  exportFEN() {
    //     let FEN;

    //     return FEN
    // }

    toString() {

        let str = "";

        for(let i = 0; i < this._pieces.length; i++)
        {
            let piece = this._pieces[i];

            str += (piece) ? `[${piece.toString()}]` : "[  ]";

            if((i+1)%8 == 0) {
                str += '\n';
            }
        }

        return str;
    }

    pieceAt(notation) {
        let [x, y] = utils.posToSquare(this.realSquareSize, utils.notationToCoords(this.realSquareSize,notation,this._isWhite));

        return this._pieces[(y - 1) * 8 + (x - 1)];
    }

    pieceAtSquare([squareX, squareY]) {
        return this._pieces[(squareY - 1) * 8 + (squareX - 1)];
    }

    removeAt(notation) {
        let [x, y] = utils.posToSquare(this.realSquareSize, utils.notationToCoords(this.realSquareSize,notation,this._isWhite));
        delete this._pieces[(y - 1) * 8 + (x - 1)];
    }

    //TODO make so that it checks the legalMoves for piece (this is not how it works, it depends on this.possibleMoves)
    _checkMoveLegal(piece, notation) {
        let moveIsLegal = false;
        let [x, y] = utils.posToSquare(this.realSquareSize, utils.notationToCoords(this.realSquareSize,notation,this._isWhite));

        for(let i = 0; i < this.possibleMoves.length; i++) {
            let [moveX, moveY] = this.possibleMoves[i][0];
            if(moveX >= 1 && moveX <= 8 && moveY >= 1 && moveY <= 8) {
                if(notation == utils.squareToNotation([moveX, moveY],this._isWhite)) {
                    moveIsLegal = true;
                }
            }
        }

        if(piece.notation == notation) {

            moveIsLegal = false;
        }

        return moveIsLegal;
    }

    movePiece(piece, notation, bypassLegal = false) {

        let [x, y] = utils.posToSquare(this.realSquareSize, utils.notationToCoords(this.realSquareSize,notation,this._isWhite));

        let moveIsLegal = bypassLegal ? true : this._checkMoveLegal(piece, notation);

        let victim = this.pieceAt(notation);
        if(moveIsLegal && ((victim && victim.isWhite != piece.isWhite) || !victim) ) {
            //Eat
            this.removeAt(notation);

            let oldNotation = piece.notation;
            this.removeAt(oldNotation);

            piece.setNotationPos(notation);
            this._pieces[(y - 1) * 8 + (x - 1)] = piece;

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

    _isInThreatMap(piece, threatMap = this._threatMap) {
        let [squareX, squareY] = utils.posToSquare(this.realSquareSize,utils.notationToCoords(
            this.realSquareSize,piece.notation,this._isWhite),this._isWhite);

        let isInIt = false;
        
        for(let [tX, tY] of threatMap) {
            if(squareX == tX && squareY == tY) {
                isInIt = true;
            }
        }

        return isInIt;
    }
    
    _computeMoves(piece) {
        let possibleMoves = [];

        if(piece) {
            let legalMoves = piece.legalMoves
    
            let [squareX, squareY] = utils.posToSquare(this.realSquareSize,utils.notationToCoords(
                                    this.realSquareSize,piece.notation,this._isWhite),this._isWhite);

            for(let i = 0; i < legalMoves.length; i++) {
                let [[moveX, moveY], isAttacking] = legalMoves[i];
    
                let pMove = [squareX + moveX, squareY + moveY];
                possibleMoves.push([pMove,isAttacking]);

                if(this.pieceAtSquare(pMove) && isAttacking
                && this.pieceAtSquare(pMove).name == "King" ) {
                    this.pieceAtSquare(pMove).isInCheck = true;
                }

                if(piece.name == "King" && this._isInThreatMap(piece)) {
                    possibleMoves.pop();
                }
            }
        }

        return possibleMoves;
    }

    _computeThreatMap(isWhite) {
        let threatMap = [];
        for(let piece of this._pieces) {
            if(piece && piece.isWhite == isWhite) {
                for(let square of piece.attackSquares) {
                        threatMap.push(square);
                }
            }
        }
        
        return threatMap;
    }
    
    _computeThreatMapAfter(isWhite, piece, notation) {
        //TODO Recreate a full board, pass the board in pieces so you can compute the moves
        let boardAfter = this.clone();

        for(let p of boardAfter._pieces) {
            if(p && p.equalTo(piece)) {
                boardAfter.movePiece(p, notation);
            }
        }

        return boardAfter._computeThreatMap(isWhite);
    }

    _computeInCheck() {
        for(let p of this._pieces) {
            if(p && p.name == "King") {

                if(this._isInThreatMap(p, this._computeThreatMap(!p.isWhite))) {
                    p.isInCheck = true;
                } else {
                    p.isInCheck = false;
                }
            }
        }
    }


    computeEnPassant(piece, notation) {
        let [squareX, squareY] = utils.posToSquare(this.realSquareSize,utils.notationToCoords(
            this.realSquareSize,notation,this._isWhite),this._isWhite);

        let pieceLeft = this.pieceAtSquare([squareX - 1, squareY]);
        let pieceRight = this.pieceAtSquare([squareX + 1, squareY]);

        if(!this._isWhite) {
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

    clone() {
        let clonedBoard = new  Board(this.canvas, this.ctx,this.isWhite);

        clonedBoard._defSquareSize = this._defSquareSize;

        clonedBoard._pieces = [];
        for(let piece of this._pieces) {
            if(piece) {
                clonedBoard._pieces.push(piece.clone(clonedBoard));
            } else {
                clonedBoard._pieces.push(undefined);
            }
        }
        clonedBoard._threatMap = Array.from(this._threatMap);

        clonedBoard.realSquareSize = this.realSquareSize;
        
        clonedBoard.draggedPiece = this.draggedPiece.clone(clonedBoard);
        for(let piece of clonedBoard._pieces) {
            if(piece && piece.equalTo(this.draggedPiece)) {
                clonedBoard.enPassantPawns.push(piece);
            }
        }

        clonedBoard.possibleMoves = Array.from(this.possibleMoves);

        clonedBoard.enPassantPawns = [];
        for(let piece of this.enPassantPawns) {
            for(let p of clonedBoard._pieces) {
                if(p && p.equalTo(piece)) {
                    clonedBoard.enPassantPawns.push(p);
                }
            }
        }

        return clonedBoard;
    }

}