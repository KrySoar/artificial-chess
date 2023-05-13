import {Board} from './board.js';
import {King, Queen, Bishop, Knight, Rook} from './pieces.js';

function init() {
    const canvas = document.querySelector("#board");
    const ctx = canvas.getContext("2d");

    const chessboard = new Board(canvas, ctx, true);

    window.addEventListener("mousemove", (e) => {
        chessboard.mouseMoveEvent(e);
    });

    window.addEventListener("mousedown", (e) => {
        chessboard.mouseClickEvent(e);
    });

    chessboard.drawBoard();

    ///
    const piecesImg = new Image();

    let whiteRook = new Rook('e4', true, piecesImg, chessboard);

    let blackQueen = new Queen('f7', false, piecesImg, chessboard);
    
    piecesImg.addEventListener("load", () => {
        
        whiteRook.draw(canvas, ctx);
        blackQueen.draw(canvas, ctx);

    }, false);


    piecesImg.src = "../images/chesspieces.png";
    


    
}

window.onload = init();
