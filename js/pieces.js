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
        let squareSize = this._board.canvas.width / 8;

        this._notationPos = notation;
        let [posX, posY] =  utils.notationToCoords(squareSize, this._notationPos, this._board.isWhite);

        this.setPosition([posX, posY]);
    }

    setPosition([posX, posY]) {
        this._posX = posX;
        this._posY = posY;
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
        return this._defMoves;
    }

    get position() {
        return [this._posX, this._posY];
    }

}

export class King extends Piece {
    _tileX = 0;
    _defMoves = [
        [-1,-1], [0, -1], [1, -1],
        [-1,0],            [1, 0],
        [-1, 1], [0,  1], [1,  1],
    ];

    constructor(notationPos, isWhite, tileset, board) {
        super(notationPos, isWhite, tileset, board);
    }

    get legalMoves() {
        let lMoves = new Array();
        let squareSize = this._board.canvas.getBoundingClientRect().width / 8;
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

    get legalMoves() {
        let lMoves = new Array();
        let squareSize = this._board.canvas.getBoundingClientRect().width / 8;
        let [pSquareX, pSquareY] = utils.posToSquare(squareSize,utils.notationToCoords(
            squareSize,this._notationPos,this._board.isWhite),this._board.isWhite);

        //TODO a function for the tree ray-moving pieces
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

    get legalMoves() {
        let lMoves = new Array();
        let squareSize = this._board.canvas.getBoundingClientRect().width / 8;
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
        let squareSize = this._board.canvas.getBoundingClientRect().width / 8;
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

    get legalMoves() {
        let lMoves = new Array();
        let squareSize = this._board.canvas.getBoundingClientRect().width / 8;
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

        let squareSize = this._board.canvas.getBoundingClientRect().width / 8;
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

    checkEatEnPassant(oldNotation) {
        let squareSize = this._board.canvas.getBoundingClientRect().width / 8; 

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
        super.setNotationPos(notation);
        
        this.checkEatEnPassant(oldNotation);
        this._board.removeEnPassants();

        if(Math.abs(oldNotation[1] - notation[1]) == 2 ) {
            this._board.computeEnPassant(this, notation);
        }
    }

}