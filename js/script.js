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
    
    piecesImg.addEventListener("load", () => {
        
        chessboard.addPiece(new Rook('b8', true, piecesImg, chessboard));
        chessboard.addPiece(new Queen('h4', false, piecesImg, chessboard));

    }, false);


    piecesImg.src = "../assets/imgs/chesspieces.png";
    


    
}

window.onload = init();
