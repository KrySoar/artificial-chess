import {Board} from './board.js';


function draw() {
    const canvas = document.querySelector("#board");
    const ctx = canvas.getContext("2d");

    const chessboard = new Board(canvas, ctx);

    window.addEventListener("mousemove", (e) => {
        chessboard.mouseMoveEvent(e);
    });

    chessboard.drawBoard();
}

window.onlonad = draw();
