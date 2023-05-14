import * as utils from './utils.js';

export class Piece {

    _notationPos;
    _isWhite;
    _board;

    _name;

    _tileset
    _tileSquareSize = 200;
    _tileX;
    _tileY;
    
    _hasMoved = false;


    constructor(notationPos, isWhite, tileset, board) {
        this._notationPos = notationPos;
        this._isWhite = isWhite;
        this._board = board;
        this._tileY = !this._isWhite;
        this._name = this.constructor.name

        this._tileset = tileset;
    }

    draw(canvas, ctx) {
        let squareSize = canvas.width / 8;

        let [posX, posY] =  utils.notationToCoords(squareSize, this._notationPos, this._board.isWhite);

        //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        ctx.drawImage(this._tileset, this._tileX*this._tileSquareSize,
                        this._tileY*this._tileSquareSize,
                        this._tileSquareSize, this._tileSquareSize,
                        posX, posY, squareSize, squareSize );
    }

    setPosition(notation) {
        this._notationPos = notation;
    }

    get isWhite() {
        return this._isWhite;
    }

    get name() {
        return this._name;
    }

}

export class King extends Piece {
    _tileX = 0;

    constructor(notationPos, isWhite, tileset, board) {
        super(notationPos, isWhite, tileset, board);
    }

}

export class Queen extends Piece {
    _tileX = 1;

    constructor(notationPos, isWhite, tileset, board) {
        super(notationPos, isWhite, tileset, board);
    }

}

export class Bishop extends Piece {
    _tileX = 2;

    constructor(notationPos, isWhite, tileset, board) {
        super(notationPos, isWhite, tileset, board);
    }

}

export class Knight extends Piece {
    _tileX = 3;

    constructor(notationPos, isWhite, tileset, board) {
        super(notationPos, isWhite, tileset, board);
    }

}

export class Rook extends Piece {
    _tileX = 4;

    constructor(notationPos, isWhite, tileset, board) {
        super(notationPos, isWhite, tileset, board);
    }

}

export class Pawn extends Piece {
    _tileX = 5;

    constructor(notationPos, isWhite, tileset, board) {
        super(notationPos, isWhite, tileset, board);
    }

}