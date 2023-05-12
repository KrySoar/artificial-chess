

function draw() {
    const canvas = document.querySelector("#board");

    const ctx = canvas.getContext("2d");


    drawBoard(canvas, ctx);
}

    
function drawSquare(canvas, ctx, [posX, posY], isColored = false) {
    let squareSize = canvas.width / 8;
    ctx.fillStyle = isColored ? "#593300" : "#ffc67a"
    ctx.fillRect((posX-1) * squareSize,(posY-1) * squareSize, canvas.width / 8, canvas.height / 8);
}

function drawBoard(canvas, ctx) {
    for(let y = 1; y <= 8; y++)
    {
        for(let x = 1; x <= 8; x++)
        {
            drawSquare(canvas, ctx, [x,y], ((x+y)%2 == 1));
        }
    }
}