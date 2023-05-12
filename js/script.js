import {Board} from './board.js';


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
}

window.onload = init();
