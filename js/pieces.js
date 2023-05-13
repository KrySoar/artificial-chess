export class Piece {

    _notationPos;
    _isWhite;

    // _posX;
    // _posY;

    // _squareX;
    // _squareY;

    _tileset
    _tileSquareSize = 200;
    _tileX;
    _tileY;


    constructor(notationPos, isWhite, tileset) {
        this._notationPos = notationPos;
        this._isWhite = isWhite;
        this._tileY = !this._isWhite;

        this._tileset = tileset;
    }

    draw(canvas, ctx) {
        let squareSize = canvas.width / 8;

        //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        ctx.drawImage(this._tileset, this._tileX*this._tileSquareSize, this._tileY*this._tileSquareSize, this._tileSquareSize, this._tileSquareSize,
                        7*squareSize, 7*squareSize, squareSize, squareSize );
    }

}

export class Rook extends Piece {
    _tileX = 4;

    constructor(notationPos, isWhite, tileset) {
        super(notationPos, isWhite, tileset);
    }


}