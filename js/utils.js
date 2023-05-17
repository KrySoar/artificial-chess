export function posToSquare(squareSize, [posX, posY]) {

    let squareX = Math.floor(posX / squareSize) + 1;
    let squareY = Math.floor(posY / squareSize) + 1;

    return [squareX, squareY];
}

export function squareToPos(squareSize, [squareX, squareY]) {

    let posX = (squareX - 1) * squareSize;
    let posY = (squareY - 1) * squareSize;

    return [posX, posY];
}

export function coordsToNotation(squareSize, [posX, posY], isWhite) {

    return squareToNotation(posToSquare(squareSize, [posX, posY]), isWhite);
}

export function notationToCoords(squareSize, notation, isWhite) {
    
    if(notation.length != 2)
    {
        throw new Error("Invalid notation. Please enter a valid chess notation such as 'e4'.")
    }

    const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    let [squareX, squareY] = notation;
    squareX = letters.indexOf(squareX) + 1;

    if(!isWhite) {
        squareX = 9 - squareX;
    } else {
        squareY = 9 - squareY;
    }

    let [posX, posY] = squareToPos(squareSize, [squareX, squareY]);
    
    return [posX, posY];
}

export function squareToNotation([squareX, squareY], isWhite) {

    const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    if(!isWhite) {
        squareX = 9 - squareX;
    } else {
        squareY = 9 - squareY;
    }

    return letters[squareX - 1].concat(squareY);

}

// export function notationToSquare(notation, isWhite) {

// }

export function indexFromSquare([squareX, squareY], isWhite) {

    let index = (squareY - 1) * 8 + (squareX);

    if(!isWhite) {
        index = 65 - index; 
    }

    return index;
}

export function squareFromIndex(index, isWhite) {

    if(!isWhite) {
        index = 65 - index; 
    }

    let squareX = index%8;
    let squareY = Math.floor(index/8) +1;

    if (squareX ==  0) {
        squareX = 8;
        squareY -= 1;
    }

    return [squareX, squareY];
}