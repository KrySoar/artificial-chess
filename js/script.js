import {Board} from './board.js';

function init() {
    const canvas = document.querySelector("#board");
    const ctx = canvas.getContext("2d");

    const chessboard = new Board(canvas, ctx, true);

    window.addEventListener("resize", (e) => {
        chessboard.refreshSquareSize();
    });

    window.addEventListener("mousemove", (e) => {
        chessboard.mouseMoveEvent(e);        
    });

    window.addEventListener("mousedown", (e) => {
        chessboard.mouseDownEvent(e);
    });

    window.addEventListener("mouseup", (e) => {
        chessboard.mouseUpEvent(e);
    });

    chessboard.draw();

    ///
    const piecesImg = new Image();
    
    piecesImg.addEventListener("load", () => {
        //"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        let FEN = "r2qk1nr/ppp2ppp/2np4/4p2b/2B1P3/2NPPN1P/PPP3P1/R2QK2R b KQkq - 0 8";
        //FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        //FEN = "rnbqkbnr/p1ppp1p1/8/P2P1P2/2p2p1p/8/1PP2PPP/RNBQKBNR w KQkq - 0 1";
        FEN = "1R1rk1nr/ppp2ppp/2npq3/7b/2B1N3/2NP3P/PPP3P1/R2QK3 b Qk - 0 8";
        chessboard.importFEN(FEN, piecesImg);
        chessboard.draw();
        
        
    }, false);



    piecesImg.src = "../assets/imgs/chesspieces.png";

}

window.onload = init();
