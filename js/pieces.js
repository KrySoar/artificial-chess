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

}

export class King extends Piece {
    _tileX = 0;
    //_defMoves = [-9, -8, -7, -1, 1, 7, 8, 9];
    _defMoves = [
        [-1,-1], [0, -1], [1, -1],
        [-1,0],            [1, 0],
        [-1, 1], [0,  1], [1,  1],
    ];

    constructor(notationPos, isWhite, tileset, board) {
        super(notationPos, isWhite, tileset, board);
    }

}

export class Queen extends Piece {
    _tileX = 1;
    //_defMoves = [-9, -8, -7, -1, 1, 7, 8, 9];
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
    //_defMoves = [-9, -7, 7, 9];
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
    //_defMoves = [-17, -15, -10, -6, 6, 10, 15, 17];
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

            lMoves.push([moveX, moveY]);

            if((nMoveX) >=1  && (nMoveX) <= 8 && (nMoveY) >=1  && (nMoveY) <= 8) {  
                if(nMovePiece && nMovePiece.isWhite == this._isWhite ) {
                      lMoves.pop();  
                }
            }
        }

        return lMoves;
    }

}

export class Rook extends Piece {
    _tileX = 4;
    //_defMoves = [-8, -1, 1, 8];
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
    //_defMoves = [-8];
    _defMoves = [
        [0,-1], 
    ];

    constructor(notationPos, isWhite, tileset, board) {
        super(notationPos, isWhite, tileset, board);
    }

    get legalMoves() {
        let lMoves = [...this._defMoves];

        // let squareSize = this._board.canvas.getBoundingClientRect().width / 8;
        // let pieceIndex = utils.indexFromSquare(
        //     utils.posToSquare(squareSize,utils.notationToCoords(
        //         squareSize,this._notationPos,this._board.isWhite),this._board.isWhite),this._board.isWhite);

        // if(!this._hasMoved) {
        //     lMoves.push(-16);
        // }

        // if(this._board.pieceAt(-9) && this._board.pieceAt(-9).isWhite != this._isWhite) 
        // {
        //     lMoves.push(-9);
        // }

        return lMoves;
    }

}