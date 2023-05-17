import {Board} from './board.js';

function init() {
    const canvas = document.querySelector("#board");
    const ctx = canvas.getContext("2d");

    const chessboard = new Board(canvas, ctx, true);

    window.addEventListener("mousemove", (e) => {
        chessboard.mouseMoveEvent(e);

        
    });

    window.addEventListener("mousedown", (e) => {
        chessboard.mouseDownEvent(e);

    });

    window.addEventListener("mouseup", (e) => {
        chessboard.mouseUpEvent(e);
    });

    chessboard.drawBoard();

    ///
    const piecesImg = new Image();
    
    piecesImg.addEventListener("load", () => {
        //"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        let FEN = "r2qk1nr/ppp2ppp/2np4/4p2b/2B1P3/2NPPN1P/PPP3P1/R2QK2R b KQkq - 0 8"
        //FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        chessboard.importFEN(FEN, piecesImg);
        chessboard.drawBoard();
        
        
    }, false);



    piecesImg.src = "../assets/imgs/libra2.png";

}

window.onload = init();
