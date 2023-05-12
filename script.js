function screenToSquare([posX, posY]) {

    let squareX = Math.floor(posX / 128) + 1;
    let squareY = Math.floor(posY / 128) + 1;

    return [squareX, squareY];
}

function squareToScreen([squareX, squareY]) {

    let posX = (squareX - 1) * 128;
    let posY = (squareY - 1) * 128;

    return [posX, posY];
}

function draw() {
    const canvas = document.querySelector("#board");
    const ctx = canvas.getContext("2d");

    window.addEventListener("mousemove", (e) => {
        let posX = (e.clientX - canvas.getBoundingClientRect().x);
        let posY = (e.clientY - canvas.getBoundingClientRect().y);

        let squarePos = screenToSquare([posX, posY]);

        let coordsText = "squareX: " + squarePos[0] + ", squareY: " + squarePos[1];
        //console.log("posX: " + posX + ", posY: " + posY);

        document.getElementById("position").innerHTML = coordsText;

        //If the mouse is over the board
        if(posX >= canvas.getBoundingClientRect().x && posX <= canvas.getBoundingClientRect().x + 1024
            && posY >= canvas.getBoundingClientRect().y && posY <= canvas.getBoundingClientRect().y + 1024)
        {
            drawBoard(canvas, ctx);

            ctx.fillStyle = "rgba(150, 200, 255, 0.5)";
            let pos = squareToScreen([squarePos[0],squarePos[1]]);
            ctx.fillRect(pos[0], pos[1], canvas.width / 8, canvas.height / 8);
        } else {
            console.log('outside');
            drawBoard(canvas, ctx);
        }
    });

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