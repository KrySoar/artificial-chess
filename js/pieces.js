import * as utils from './utils.js';

export class Piece {

    _notationPos;
    _isWhite;
    _board;

    _posX;
    _posY;

    _name;

    _defMoves = [];

    _tileset
    _tileSquareSize = 200;
    _tileX;
    _tileY;
    
    _hasMoved = false;


    constructor(notationPos, isWhite, tileset, board) {
        let squareSize = board.canvas.width / 8;

        this._notationPos = notationPos;
        [this._posX, this._posY] = utils.notationToCoords(squareSize, notationPos, board.isWhite);

        this._isWhite = isWhite;
        this._board = board;
        this._tileY = !this._isWhite;
        this._name = this.constructor.name

        this._tileset = tileset;
    }

    draw(canvas, ctx) {
        let squareSize = canvas.width / 8;
        //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        ctx.drawImage(this._tileset, this._tileX*this._tileSquareSize,
                        this._tileY*this._tileSquareSize,
                        this._tileSquareSize, this._tileSquareSize,
                        this._posX, this._posY, squareSize, squareSize );
    }

    setNotationPos(notation) {
        let oldNotation = this.notation;

        let squareSize = this._board.canvas.width / 8;

        this._notationPos = notation;
        let [posX, posY] =  utils.notationToCoords(squareSize, this._notationPos, this._board.isWhite);

        this.setPosition([posX, posY]);

        if(oldNotation != notation) {
            this._board.removeEnPassants();
        }
    }

    setPosition([posX, posY]) {
        this._posX = posX;
        this._posY = posY;
    }

    toChar() {
        const pieceMap = {
            "Piece": 'P',
            "King": 'K',
            "Queen": 'Q',
            "Bishop": 'B',
            "Knight": 'N',
            "Rook": 'R',
            "Pawn": 'P',
        };

        return pieceMap[this._name];
    }

    toString() {
        return (this._isWhite ? 'w' : 'b')+this.toChar();
    }

    get isWhite() {
        return this._isWhite;
    }

    get name() {
        return this._name;
    }

    get notation() {
        return this._notationPos;
    }

    get legalMoves() {
        let lMoves = new Array();
        let squareSize = this._board.realSquareSize;
        let [pSquareX, pSquareY] = utils.posToSquare(squareSize,utils.notationToCoords(
            squareSize,this._notationPos,this._board.isWhite),this._board.isWhite);
            

        for(const [moveX, moveY] of this._defMoves) {
            for(let i = 0; i <= 7; i++) {
    
                let iX = 0;
                let iY = 0;

                if(moveX > 0) {
                    iX +=i;
                } else if (moveX < 0) {
                    iX -=i;
                }

                if(moveY > 0) {
                    iY +=i;
                } else if (moveY < 0) {
                    iY -=i;
                }

                let [nMoveX, nMoveY] = [pSquareX+moveX+iX, pSquareY+moveY+iY];
                let nMovePiece = this._board.pieceAtSquare([nMoveX, nMoveY]);
    
                let isAttacking = false;
                let add = true;
                
    
                if((nMoveX) >=1  && (nMoveX) <= 8 && (nMoveY) >=1  && (nMoveY) <= 8) {  
                    if(nMovePiece && nMovePiece.isWhite == this._isWhite ) {
                          add = false;  
                          i = 8;
                    } else if (nMovePiece && nMovePiece.isWhite != this._isWhite) {
                        isAttacking = true;
                        i = 7;
                    }
                }

                if(add){
                    lMoves.push([[moveX+iX, moveY+iY], isAttacking]);
                }
            }
        }
        

        return lMoves;
    }

    get attackSquares() {
        let squares = [];
        let squareSize = this._board.realSquareSize;
        let [pSquareX, pSquareY] = utils.posToSquare(squareSize,utils.notationToCoords(
            squareSize,this._notationPos,this._board.isWhite),this._board.isWhite);
            

        for(const [moveX, moveY] of this._defMoves) {
            for(let i = 0; i <= 7; i++) {
    
                let iX = 0;
                let iY = 0;

                if(moveX > 0) {
                    iX +=i;
                } else if (moveX < 0) {
                    iX -=i;
                }

                if(moveY > 0) {
                    iY +=i;
                } else if (moveY < 0) {
                    iY -=i;
                }

                let [nMoveX, nMoveY] = [pSquareX+moveX+iX, pSquareY+moveY+iY];
                let nMovePiece = this._board.pieceAtSquare([nMoveX, nMoveY]);
    
                if((nMoveX) >=1  && (nMoveX) <= 8 && (nMoveY) >=1  && (nMoveY) <= 8) {  
                    squares.push([nMoveX, nMoveY]);
                    
                    if(nMovePiece) {
                          i = 8;
                    }
                }
                    
            }
        }
    
        return squares;
    }

    get position() {
        return [this._posX, this._posY];
    }

    equalTo(piece) {
        let equality = false;

        if(piece) {
            equality = (piece._notationPos == this._notationPos
                && piece._isWhite == this._isWhite
                && piece._name == this._name);
        }

        return equality
    }

    clone(cloneBoard) {
        const pieceMap = {
            'King': King,
            'Queen': Queen,
            'Bishop': Bishop,
            'Knight': Knight,
            'Rook': Rook,
            'Pawn': Pawn,
        }

        let clonedPiece = new pieceMap[this._name](this._notationPos, this._isWhite, this._tileset, cloneBoard);
    
        clonedPiece._posX = this._posX;
        clonedPiece._posY = this._posY;

        clonedPiece._defMoves = Array.from(this._defMoves);

        clonedPiece._tileSquareSize = this._tileSquareSize;
        clonedPiece._tileX = this._tileX;
        clonedPiece._tileY = this._tileY;

        clonedPiece._hasMoved = this._hasMoved;

        if(this._name == 'King') {
            clonedPiece.isInCheck = this.isInCheck;
        } else if(this._name == 'Pawn') {
            clonedPiece.enPassantR = this.enPassantR;
            clonedPiece.enPassantL = this.enPassantL;
        }

        return clonedPiece;
    }

}

export class King extends Piece {
    _tileX = 0;
    _defMoves = [
        [-1,-1], [0, -1], [1, -1],
        [-1,0],            [1, 0],
        [-1, 1], [0,  1], [1,  1],
    ];


    isInCheck;

    constructor(notationPos, isWhite, tileset, board) {
        super(notationPos, isWhite, tileset, board);

        this.isInCheck = false;
    }

    get legalMoves() {
        let lMoves = new Array();
        let squareSize = this._board.realSquareSize;
        let [pSquareX, pSquareY] = utils.posToSquare(squareSize,utils.notationToCoords(
            squareSize,this._notationPos,this._board.isWhite),this._board.isWhite);

        
        for(const [moveX, moveY] of this._defMoves) {

            let [nMoveX, nMoveY] = [pSquareX+moveX, pSquareY+moveY];
            let nMovePiece = this._board.pieceAtSquare([nMoveX, nMoveY]);


            let add = true;
            let isAttacking =false;

            

            if((nMoveX) >=1  && (nMoveX) <= 8 && (nMoveY) >=1  && (nMoveY) <= 8) {  
                if(nMovePiece && nMovePiece.isWhite == this._isWhite ) {
                        add = false;
                } else if(nMovePiece && nMovePiece.isWhite != this._isWhite ) {
                    isAttacking = true;
            }
            }

            if(add) {
                lMoves.push([[moveX, moveY], isAttacking]);
            };
        }
        

        return lMoves;
    }

    get attackSquares() {
        let squares = [];
        let squareSize = this._board.realSquareSize;
        let [pSquareX, pSquareY] = utils.posToSquare(squareSize,utils.notationToCoords(
            squareSize,this._notationPos,this._board.isWhite),this._board.isWhite);

        for(const [moveX, moveY] of this._defMoves) {
            
            let [nMoveX, nMoveY] = [pSquareX+moveX, pSquareY+moveY];

            if((nMoveX) >=1  && (nMoveX) <= 8 && (nMoveY) >=1  && (nMoveY) <= 8) { 
                squares.push([nMoveX, nMoveY]);
            }
        }

        return squares;
    }

}

export class Queen extends Piece {
    _tileX = 1;
    _defMoves = [
        [-1,-1], [0, -1], [1, -1],
        [-1,0],            [1, 0],
        [-1, 1], [0,  1], [1,  1],
    ];

    constructor(notationPos, isWhite, tileset, board) {
        super(notationPos, isWhite, tileset, board);
    }
}

export class Bishop extends Piece {
    _tileX = 2;
    _defMoves = [
        [-1,-1], [1, -1],
        [-1, 1], [1,  1],
    ];

    constructor(notationPos, isWhite, tileset, board) {
        super(notationPos, isWhite, tileset, board);
    }
}

export class Knight extends Piece {
    _tileX = 3;
    _defMoves = [
        [-1,-2], [1,-2],
        [-2,-1], [2,-1],
        [-2, 1], [2, 1],
        [-1, 2], [1, 2]
    ];

    constructor(notationPos, isWhite, tileset, board) {
        super(notationPos, isWhite, tileset, board);
    }

    get legalMoves() {
        let lMoves = new Array();
        let squareSize = this._board.realSquareSize;
        let [pSquareX, pSquareY] = utils.posToSquare(squareSize,utils.notationToCoords(
            squareSize,this._notationPos,this._board.isWhite),this._board.isWhite);

        for(const [moveX, moveY] of this._defMoves) {
            
            let [nMoveX, nMoveY] = [pSquareX+moveX, pSquareY+moveY];
            let nMovePiece = this._board.pieceAtSquare([nMoveX, nMoveY]);

            let add = true;
            let isAttacking = false;

            if((nMoveX) >=1  && (nMoveX) <= 8 && (nMoveY) >=1  && (nMoveY) <= 8) {  
                if(nMovePiece && nMovePiece.isWhite == this._isWhite ) {
                    add = false;
                } else if(nMovePiece && nMovePiece.isWhite != this._isWhite ) {
                    isAttacking = true;
                }
            }

            if(add) {
                lMoves.push([[moveX, moveY], isAttacking]);
            }
        }

        return lMoves;
    }

    get attackSquares() {
        let squares = [];
        let squareSize = this._board.realSquareSize;
        let [pSquareX, pSquareY] = utils.posToSquare(squareSize,utils.notationToCoords(
            squareSize,this._notationPos,this._board.isWhite),this._board.isWhite);

        for(const [moveX, moveY] of this._defMoves) {
            
            let [nMoveX, nMoveY] = [pSquareX+moveX, pSquareY+moveY];

            if((nMoveX) >=1  && (nMoveX) <= 8 && (nMoveY) >=1  && (nMoveY) <= 8) { 
                squares.push([nMoveX, nMoveY]);
            }
        }
        
        return squares;
    }

}

export class Rook extends Piece {
    _tileX = 4;
    _defMoves = [
        [0, -1],[-1,0],
        [1, 0], [0,  1]
    ];

    constructor(notationPos, isWhite, tileset, board) {
        super(notationPos, isWhite, tileset, board);
    }
}

export class Pawn extends Piece {
    _tileX = 5;
    _defMoves = [
        [0,-1], 
    ];

    enPassantR = false;
    enPassantL = false;

    constructor(notationPos, isWhite, tileset, board) {
        super(notationPos, isWhite, tileset, board);
    }

    get legalMoves() {
        let lMoves = new Array();

        let squareSize = this._board.realSquareSize;
        let [pSquareX, pSquareY] = utils.posToSquare(squareSize,utils.notationToCoords(
            squareSize,this._notationPos,this._board.isWhite),this._board.isWhite);

        let i = this._isWhite ? 1 : -1;
        let firstRow = this._isWhite ? 7 : 2;

        if(!this._board.isWhite) {
            i = -i;
            firstRow = 9 - firstRow;
        }

        if(pSquareY == firstRow) {
            if(!this._board.pieceAtSquare([pSquareX, pSquareY - i])
            &&!this._board.pieceAtSquare([pSquareX, pSquareY - i*2])) {
                lMoves.push([[0, -i*2], false]);
            }
        }

        if(this.enPassantR) {
            lMoves.push([[i, -i], true]);
        }

        if(this.enPassantL) {
            lMoves.push([[-i, -i], true]);
        }

        let pieceA = this._board.pieceAtSquare([pSquareX - i, pSquareY - i]);
        if(pieceA && pieceA.isWhite != this._isWhite)
        {
            lMoves.push([[-i, -i], true]);
        }

        let pieceB = this._board.pieceAtSquare([pSquareX, pSquareY - i]);
        if(!pieceB)
        {
            lMoves.push([[0, -i], false]);
        }

        let pieceC = this._board.pieceAtSquare([pSquareX + i, pSquareY - i]);
        if(pieceC && pieceC.isWhite != this._isWhite)
        {
            lMoves.push([[i, -i], true]);
        }

        return lMoves;
    }

    get attackSquares() {
        let squares = [];
        let squareSize = this._board.realSquareSize;
        let [squareX, squareY] = utils.posToSquare(squareSize,utils.notationToCoords(
            squareSize,this.notation,this._board.isWhite),this._board.isWhite);

        let i = this._board.isWhite ? 1 : -1;
        if(!this.isWhite) {
            i = -i;
        }

        if(squareX - i > 0 && squareY - i > 0) {
            squares.push([squareX - i, squareY - i]);
        }

        if(squareX + i <= 8 && squareY - i > 0) {
            squares.push([squareX + i, squareY - i]);
        }

        return squares;
    }

    checkEatEnPassant(oldNotation) {
        let squareSize = this._board.realSquareSize; 

        let [squareX, squareY] = utils.posToSquare(squareSize,utils.notationToCoords(
            squareSize,oldNotation,this._board.isWhite),this._board.isWhite);
            
        let [newSquareX, newSquareY] = utils.posToSquare(squareSize,utils.notationToCoords(
            squareSize,this.notation,this._board.isWhite),this._board.isWhite);

        let i = this.isWhite ? 1 : -1;

        if(!this._board.isWhite) {
            i = -i;
        }

        let victim = this._board.pieceAtSquare([newSquareX, newSquareY + i]);

        if(this.enPassantR) {
            if(newSquareX - squareX == i &&  newSquareY - squareY == -i) {
                this._board.removeAt(victim.notation);
            }
        } 

        if(this.enPassantL) {
            if(newSquareX - squareX == -i &&  newSquareY - squareY == -i) {
                this._board.removeAt(victim.notation);
            }
        } 
    }

    setNotationPos(notation) {
        let oldNotation = this.notation;
        
        /// its own version because checkEatEnpassant() needs to be before removeEnPassants
        let squareSize = this._board.canvas.width / 8;

        this._notationPos = notation;
        let [posX, posY] =  utils.notationToCoords(squareSize, this._notationPos, this._board.isWhite);

        this.setPosition([posX, posY]);
        ///

        this.checkEatEnPassant(oldNotation);

        if(notation != oldNotation) {
            this._board.removeEnPassants();
        }

        if(Math.abs(oldNotation[1] - notation[1]) == 2 ) {
            this._board.computeEnPassant(this, notation);
        }
    }

}