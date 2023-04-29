var rows = 4;
var columns = 7;
var board =[[-1, -1, -1, 0, -1, -1, -1],
            [-1, -1, 0, 0, 0, -1, -1],
            [-1, 0, 0, 0, 0, 0, -1],
            [0, 0, 0, 0, 0, 0, 0]];
var gameScore = 0;
window.onload = function () { setGame(); }
function setGame() {
    board =[[-1, -1, -1, 0, -1, -1, -1],
            [-1, -1, 0, 0, 0, -1, -1],
            [-1, 0, 0, 0, 0, 0, -1],
            [0, 0, 0, 0, 0, 0, 0]];
    /* testing
    board =[[-1, -1, -1, 96, -1, -1, -1],
            [-1, -1, 24, 48, 24, -1, -1],
            [-1, 3, 12, 3, 12, 3, -1],
            [3, 6, 3, 192, 3, 6, 3]];*/
    
    
    gameScore = 0;
    let temp = document.getElementById("board");
    while (temp.firstChild) {
        temp.removeChild(temp.firstChild);
    }
    updateScore();
    closePopup();
    boardUpdate();
    setNewTile();
    setNewTile();
    setNewTile();
}
function boardUpdate() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            let num = board[r][c];
            updateTile(tile, num);
            document.getElementById("board").append(tile);
        }
    }
}

function updateScore() {
    let tempScore = document.getElementById("score");
    while (tempScore.firstChild) {
        tempScore.removeChild(tempScore.firstChild);
    }
    document.getElementById("score").append(gameScore);
}
function addScore(point) {
    gameScore = gameScore + point;
    updateScore();
}

function gameOverChack() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if(board[r][c] >= 0){
                if((r == 1 && c == 3)
                || (r == 2 && c == 2)
                || (r == 2 && c == 4)
                || (r == 3 && c == 1)
                || (r == 3 && c == 3)
                || (r == 3 && c == 5)){
                    if(board[r][c] == board[r-1][c] || board[r][c] == board[r][c-1] ||board[r][c] == board[r][c+1]){
                        return false;
                    }
                    else{
                        if(r == 3 && c == 0 &&(board[r][c] == board[r][c+1])){return false;}
                        else if(r == 3 && c == 6 &&(board[r][c] == board[r][c-1])){}
                        else if(r == 3 &&(board[r][c] == board[r][c-1] || board[r][c] == board[r][c+1])){return false;}
                        else if(board[r][c] == board[r-1][c] || board[r][c] == board[r][c-1] ||board[r][c] == board[r][c+1]){return false;}
                    }
                }
            }
        }
    }

    let temp = document.getElementById("endScore");
    while (temp.firstChild) {
        temp.removeChild(temp.firstChild);
    }
    document.getElementById("endScore").append(gameScore);

    openPopup();
}


function openPopup() {
    document.querySelector(".background").className = "background show";
}
function closePopup() {
    document.querySelector(".background").className = "background";
}

function questionGame(){
    document.querySelector(".backgroundQuestion").className = "backgroundQuestion showQuestion";
}
function closePopupQuestion() {
    document.querySelector(".backgroundQuestion").className = "backgroundQuestion";
}

function SettingMenu(){

}

function Sharing() {
    var text = "     \n";
  
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        if (board[r][c] >= 0) {
            if(board[r][c] <= 6){
                text += "⬜️" // 흰색
            }
            else if(board[r][c] <= 12){
                text += "🟫"; //갈색
            }
            else if (board[r][c] <= 48) {
                text += "🟧"; //주황색  
            }
            else if (board[r][c] <= 96) {
                text += "🟥"; //빨간색
            }
            else {
                text += "🟨"; //노란색
            }
        } else {
          text += "◼️";
        }
        text += " ";
      }
      text += "\n";
    }
  
    text += "Score : " + gameScore.toString() + "\n";
    text += "max tiles : ";

    let maxTile = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if(maxTile < board[r][c]){maxTile = board[r][c]}
        }
    }
    text += maxTile + "\n";

    var url = "3072.app";
  
    var twitter_url =
      "https://twitter.com/intent/tweet?text=" +
      encodeURIComponent(text) +
      "&url=" +
      url;
  
    window.open(twitter_url, "_blank");
}

function updateTile(tile, num) {
    tile.innerText = "";
    tile.classList.value = "";
    let r = tile.id[0];
    let c = tile.id[tile.id.length - 1];
    document.getElementById("board").append(tile);
    if (num == -1) { tile.classList.add("tileLess"); }
    else {
        if (num == 0) {
            if ((r == 1 && c == 3)
                || (r == 2 && c == 2)
                || (r == 2 && c == 4)
                || (r == 3 && c == 1)
                || (r == 3 && c == 3)
                || (r == 3 && c == 5)) {
                tile.classList.add("tD");
            }
            else {
                tile.classList.add("tU");
            }
        }
        else if (num < 3072) {
            if ((r == 1 && c == 3)
                || (r == 2 && c == 2)
                || (r == 2 && c == 4)
                || (r == 3 && c == 1)
                || (r == 3 && c == 3)
                || (r == 3 && c == 5)) {
                tile.classList.remove();
                tile.classList.add("t" + num.toString() + "D");
            }
            else {
                tile.classList.remove();
                tile.classList.add("t" + num.toString() + "U");
            }
        }
        else {
            if ((r == 1 && c == 3) || (r == 2 && c == 2) || (r == 2 && c == 4) || (r == 3 && c == 1) || (r == 3 && c == 3) || (r == 3 && c == 5)) {
                tile.classList.add("t" + 3072 + "D");
            }
            else {
                tile.classList.add("t" + 3072 + "U");
            }
        }

        if (num != 0) {
            let numData = document.createElement("div");
            numData.innerText = num;
            if ((r == 1 && c == 3) || (r == 2 && c == 2) || (r == 2 && c == 4) || (r == 3 && c == 1) || (r == 3 && c == 3) || (r == 3 && c == 5)) {
                numData.classList.add("textD");
            }
            else {
                numData.classList.add("textU");
            }
            document.getElementById(tile.id).append(numData);
        }
    }
}
function device_checking() {
    document.addEventListener("keyup", (e) => {
        // Q W E    movedLeftUp   movedVerticalUp   movedRightUp
        // A S D    movedLeftDown movedVerticalDown movedRightDown

        if (e.keyCode == 81) { movedLeftUp(); } // Q
        else if (e.keyCode == 87) { movedUp(); } // W
        else if (e.keyCode == 69) { movedRightUp(); } // E
        else if (e.keyCode == 65) { movedLeftDown(); } // A
        else if (e.keyCode == 83) { movedDown(); } // S
        else if (e.keyCode == 68) { movedRightDown(); } // D
        else if (e.keyCode == 82) { setGame(); } // R
    });
}


function movedLeftUp() {    slideLeftUp();    setNewTile(); if (hasEmptyTile()) { addScore(1); } }
function movedUp() {        slideUp();        setNewTile(); if (hasEmptyTile()) { addScore(1); } }
function movedRightUp() {   slideRightUp();   setNewTile(); if (hasEmptyTile()) { addScore(1); } }
function movedLeftDown() {  slideLeftDown();  setNewTile(); if (hasEmptyTile()) { addScore(1); } }
function movedDown() {      slideDown();      setNewTile(); if (hasEmptyTile()) { addScore(1); } }
function movedRightDown() { slideRightDown(); setNewTile(); if (hasEmptyTile()) { addScore(1); } }

function slideLeftUp() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let sendTile = document.getElementById(r.toString() + "-" + c.toString());
            let targetTile = document.getElementById(r.toString() + "-" + (c - 1).toString());
            if (r >= 0 && c - 1 >= 0) {
                if (chackZeroMinus(board[r][c], board[r][c - 1]) &&
                    !((r == 1 && c == 3)
                        || (r == 2 && c == 2)
                        || (r == 2 && c == 4)
                        || (r == 3 && c == 1)
                        || (r == 3 && c == 3)
                        || (r == 3 && c == 5))) {
                    if (board[r][c - 1] == board[r][c]) { addScore(board[r][c - 1] * 2); }
                    board[r][c - 1] = board[r][c - 1] + board[r][c];
                    board[r][c] = 0;
                    if ((r == 1 && c == 3)
                        || (r == 2 && c == 2)
                        || (r == 2 && c == 4)
                        || (r == 3 && c == 1)
                        || (r == 3 && c == 3)
                        || (r == 3 && c == 5)) {
                        sendTile.classList.remove(...sendTile.classList);
                        sendTile.classList.add("tD");
                    }
                    else {
                        sendTile.classList.remove(...sendTile.classList);
                        sendTile.classList.add("tU");
                    }
                    while (sendTile.firstChild) {
                        sendTile.removeChild(sendTile.firstChild);
                    }
                    if ((r == 1 && c - 1 == 3)
                        || (r == 2 && c - 1 == 2)
                        || (r == 2 && c - 1 == 4)
                        || (r == 3 && c - 1 == 1)
                        || (r == 3 && c - 1 == 3)
                        || (r == 3 && c - 1 == 5)) {
                        targetTile.classList.remove(...targetTile.classList);
                        targetTile.classList.add("t" + board[r][c - 1] + "D");
                    }
                    else {
                        targetTile.classList.remove(...targetTile.classList);
                        targetTile.classList.add("t" + board[r][c - 1] + "U");
                    }
                    while (targetTile.firstChild) {
                        targetTile.removeChild(targetTile.firstChild);
                    }
                    let numData = document.createElement("div");
                    numData.innerText = board[r][c - 1];
                    if ((r == 1 && c - 1 == 3)
                        || (r == 2 && c - 1 == 2)
                        || (r == 2 && c - 1 == 4)
                        || (r == 3 && c - 1 == 1)
                        || (r == 3 && c - 1 == 3)
                        || (r == 3 && c - 1 == 5)) {
                        numData.classList.add("textD");
                    }
                    else {
                        numData.classList.add("textU");
                    }
                    document.getElementById(targetTile.id).append(numData);
                }
            }
        }
    }
}
function slideUp() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let sendTile = document.getElementById(r.toString() + "-" + c.toString());
            let targetTile = document.getElementById((r - 1).toString() + "-" + c.toString());
            if (r - 1 >= 0 && c >= 0) {
                if (chackZeroMinus(board[r][c], board[r - 1][c]) &&
                    ((r == 1 && c == 3)
                        || (r == 2 && c == 2)
                        || (r == 2 && c == 4)
                        || (r == 3 && c == 1)
                        || (r == 3 && c == 3)
                        || (r == 3 && c == 5))) {
                    if (board[r - 1][c] == board[r][c]) { addScore(board[r - 1][c] * 2); }
                    board[r - 1][c] = board[r - 1][c] + board[r][c];
                    board[r][c] = 0;
                    if ((r == 1 && c == 3)
                        || (r == 2 && c == 2)
                        || (r == 2 && c == 4)
                        || (r == 3 && c == 1)
                        || (r == 3 && c == 3)
                        || (r == 3 && c == 5)) {
                        sendTile.classList.remove(...sendTile.classList);
                        sendTile.classList.add("tD");
                    }
                    else {
                        sendTile.classList.remove(...sendTile.classList);
                        sendTile.classList.add("tU");
                    }
                    while (sendTile.firstChild) {
                        sendTile.removeChild(sendTile.firstChild);
                    }
                    if ((r - 1 == 1 && c == 3)
                        || (r - 1 == 2 && c == 2)
                        || (r - 1 == 2 && c == 4)
                        || (r - 1 == 3 && c == 1)
                        || (r - 1 == 3 && c == 3)
                        || (r - 1 == 3 && c == 5)) {
                        targetTile.classList.remove(...targetTile.classList);
                        targetTile.classList.add("t" + board[r - 1][c] + "D");
                    }
                    else {
                        targetTile.classList.remove(...targetTile.classList);
                        targetTile.classList.add("t" + board[r - 1][c] + "U");
                    }
                    while (targetTile.firstChild) {
                        targetTile.removeChild(targetTile.firstChild);
                    }
                    let numData = document.createElement("div");
                    numData.innerText = board[r - 1][c];
                    if ((r - 1 == 1 && c == 3)
                        || (r - 1 == 2 && c == 2)
                        || (r - 1 == 2 && c == 4)
                        || (r - 1 == 3 && c == 1)
                        || (r - 1 == 3 && c == 3)
                        || (r - 1 == 3 && c == 5)) {
                        numData.classList.add("textD");
                    }
                    else {
                        numData.classList.add("textU");
                    }
                    document.getElementById(targetTile.id).append(numData);
                }
            }
        }
    }
}
function slideRightUp() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let sendTile = document.getElementById(r.toString() + "-" + c.toString());
            let targetTile = document.getElementById(r.toString() + "-" + (c + 1).toString());
            if (chackZeroMinus(board[r][c], board[r][c + 1]) &&
                !((r == 1 && c == 3)
                    || (r == 2 && c == 2)
                    || (r == 2 && c == 4)
                    || (r == 3 && c == 1)
                    || (r == 3 && c == 3)
                    || (r == 3 && c == 5))) {
                if (board[r][c + 1] == board[r][c + 1]) { addScore(board[r][c + 1] * 2); }
                board[r][c + 1] = board[r][c + 1] + board[r][c];
                board[r][c] = 0;
                if ((r == 1 && c == 3)
                    || (r == 2 && c == 2)
                    || (r == 2 && c == 4)
                    || (r == 3 && c == 1)
                    || (r == 3 && c == 3)
                    || (r == 3 && c == 5)) {
                    sendTile.classList.remove(...sendTile.classList);
                    sendTile.classList.add("tD");
                }
                else {
                    sendTile.classList.remove(...sendTile.classList);
                    sendTile.classList.add("tU");
                }
                while (sendTile.firstChild) {
                    sendTile.removeChild(sendTile.firstChild);
                }
                if ((r == 1 && c + 1 == 3)
                    || (r == 2 && c + 1 == 2)
                    || (r == 2 && c + 1 == 4)
                    || (r == 3 && c + 1 == 1)
                    || (r == 3 && c + 1 == 3)
                    || (r == 3 && c + 1 == 5)) {
                    targetTile.classList.remove(...targetTile.classList);
                    targetTile.classList.add("t" + board[r][c + 1] + "D");
                }
                else {
                    targetTile.classList.remove(...targetTile.classList);
                    targetTile.classList.add("t" + board[r][c + 1] + "U");
                }
                while (targetTile.firstChild) {
                    targetTile.removeChild(targetTile.firstChild);
                }
                let numData = document.createElement("div");
                numData.innerText = board[r][c + 1];
                if ((r == 1 && c + 1 == 3)
                    || (r == 2 && c + 1 == 2)
                    || (r == 2 && c + 1 == 4)
                    || (r == 3 && c + 1 == 1)
                    || (r == 3 && c + 1 == 3)
                    || (r == 3 && c + 1 == 5)) {
                    numData.classList.add("textD");
                }
                else {
                    numData.classList.add("textU");
                }
                document.getElementById(targetTile.id).append(numData);
            }
        }
    }
}
function slideLeftDown() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let sendTile = document.getElementById(r.toString() + "-" + c.toString());
            let targetTile = document.getElementById(r.toString() + "-" + (c - 1).toString());
            if (r >= 0 && c - 1 >= 0) {
                if (chackZeroMinus(board[r][c], board[r][c - 1]) &&
                    ((r == 1 && c == 3)
                        || (r == 2 && c == 2)
                        || (r == 2 && c == 4)
                        || (r == 3 && c == 1)
                        || (r == 3 && c == 3)
                        || (r == 3 && c == 5))) {
                    if (board[1][c - 1] == board[r][c]) { addScore(board[r][c - 1] * 2); }
                    board[r][c - 1] = board[r][c - 1] + board[r][c];
                    board[r][c] = 0;
                    if ((r == 1 && c == 3)
                        || (r == 2 && c == 2)
                        || (r == 2 && c == 4)
                        || (r == 3 && c == 1)
                        || (r == 3 && c == 3)
                        || (r == 3 && c == 5)) {
                        sendTile.classList.remove(...sendTile.classList);
                        sendTile.classList.add("tD");
                    }
                    else {
                        sendTile.classList.remove(...sendTile.classList);
                        sendTile.classList.add("tU");
                    }
                    while (sendTile.firstChild) {
                        sendTile.removeChild(sendTile.firstChild);
                    }
                    if ((r == 1 && c - 1 == 3)
                        || (r == 2 && c - 1 == 2)
                        || (r == 2 && c - 1 == 4)
                        || (r == 3 && c - 1 == 1)
                        || (r == 3 && c - 1 == 3)
                        || (r == 3 && c - 1 == 5)) {
                        targetTile.classList.remove(...targetTile.classList);
                        targetTile.classList.add("t" + board[r][c - 1] + "D");
                    }
                    else {
                        targetTile.classList.remove(...targetTile.classList);
                        targetTile.classList.add("t" + board[r][c - 1] + "U");
                    }
                    while (targetTile.firstChild) {
                        targetTile.removeChild(targetTile.firstChild);
                    }
                    let numData = document.createElement("div");
                    numData.innerText = board[r][c - 1];
                    if ((r == 1 && c - 1 == 3)
                        || (r == 2 && c - 1 == 2)
                        || (r == 2 && c - 1 == 4)
                        || (r == 3 && c - 1 == 1)
                        || (r == 3 && c - 1 == 3)
                        || (r == 3 && c - 1 == 5)) {
                        numData.classList.add("textD");
                    }
                    else {
                        numData.classList.add("textU");
                    }
                    document.getElementById(targetTile.id).append(numData);
                }
            }
        }
    }
}
function slideDown() {
    for (let r = 0; r + 1 < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let sendTile = document.getElementById(r.toString() + "-" + c.toString());
            let targetTile = document.getElementById((r + 1).toString() + "-" + c.toString());
            if (chackZeroMinus(board[r][c], board[r + 1][c]) &&
                !((r == 1 && c == 3)
                    || (r == 2 && c == 2)
                    || (r == 2 && c == 4)
                    || (r == 3 && c == 1)
                    || (r == 3 && c == 3)
                    || (r == 3 && c == 5))) {
                if (board[r + 1][c] == board[r][c]) { addScore(board[r + 1][c] * 2); }
                board[r + 1][c] = board[r + 1][c] + board[r][c];
                board[r][c] = 0;
                if ((r == 1 && c == 3)
                    || (r == 2 && c == 2)
                    || (r == 2 && c == 4)
                    || (r == 3 && c == 1)
                    || (r == 3 && c == 3)
                    || (r == 3 && c == 5)) {
                    sendTile.classList.remove(...sendTile.classList);
                    sendTile.classList.add("tD");
                }
                else {
                    sendTile.classList.remove(...sendTile.classList);
                    sendTile.classList.add("tU");
                }
                while (sendTile.firstChild) {
                    sendTile.removeChild(sendTile.firstChild);
                }
                if ((r + 1 == 1 && c == 3)
                    || (r + 1 == 2 && c == 2)
                    || (r + 1 == 2 && c == 4)
                    || (r + 1 == 3 && c == 1)
                    || (r + 1 == 3 && c == 3)
                    || (r + 1 == 3 && c == 5)) {
                    targetTile.classList.remove(...targetTile.classList);
                    targetTile.classList.add("t" + board[r + 1][c] + "D");
                }
                else {
                    targetTile.classList.remove(...targetTile.classList);
                    targetTile.classList.add("t" + board[r + 1][c] + "U");
                }
                while (targetTile.firstChild) {
                    targetTile.removeChild(targetTile.firstChild);
                }
                let numData = document.createElement("div");
                numData.innerText = board[r + 1][c];
                if ((r + 1 == 1 && c == 3) || (r + 1 == 2 && c == 2) || (r + 1 == 2 && c == 4) || (r + 1 == 3 && c == 1) || (r + 1 == 3 && c == 3) || (r + 1 == 3 && c == 5)) {
                    numData.classList.add("textD");
                }
                else {
                    numData.classList.add("textU");
                }
                document.getElementById(targetTile.id).append(numData);
            }
        }
    }
}

function slideRightDown() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let sendTile = document.getElementById(r.toString() + "-" + c.toString());
            let targetTile = document.getElementById(r.toString() + "-" + (c + 1).toString());
            if (chackZeroMinus(board[r][c], board[r][c + 1]) &&
                ((r == 1 && c == 3)
                    || (r == 2 && c == 2)
                    || (r == 2 && c == 4)
                    || (r == 3 && c == 1)
                    || (r == 3 && c == 3)
                    || (r == 3 && c == 5))) {
                if (board[r][c + 1] == board[r][c]) { addScore(board[r][c + 1] * 2); }
                board[r][c + 1] = board[r][c + 1] + board[r][c];
                board[r][c] = 0;
                if ((r == 1 && c == 3)
                    || (r == 2 && c == 2)
                    || (r == 2 && c == 4)
                    || (r == 3 && c == 1)
                    || (r == 3 && c == 3)
                    || (r == 3 && c == 5)) {
                    sendTile.classList.remove(...sendTile.classList);
                    sendTile.classList.add("tD");
                }
                else {
                    sendTile.classList.remove(...sendTile.classList);
                    sendTile.classList.add("tU");
                }
                while (sendTile.firstChild) {
                    sendTile.removeChild(sendTile.firstChild);
                }
                if ((r == 1 && c + 1 == 3)
                    || (r == 2 && c + 1 == 2)
                    || (r == 2 && c + 1 == 4)
                    || (r == 3 && c + 1 == 1)
                    || (r == 3 && c + 1 == 3)
                    || (r == 3 && c + 1 == 5)) {
                    targetTile.classList.remove(...targetTile.classList);
                    targetTile.classList.add("t" + board[r][c + 1] + "D");
                }
                else {
                    targetTile.classList.remove(...targetTile.classList);
                    targetTile.classList.add("t" + board[r][c + 1] + "U");
                }
                while (targetTile.firstChild) {
                    targetTile.removeChild(targetTile.firstChild);
                }
                let numData = document.createElement("div");
                numData.innerText = board[r][c + 1];
                if ((r == 1 && c + 1 == 3)
                    || (r == 2 && c + 1 == 2)
                    || (r == 2 && c + 1 == 4)
                    || (r == 3 && c + 1 == 1)
                    || (r == 3 && c + 1 == 3)
                    || (r == 3 && c + 1 == 5)) {
                    numData.classList.add("textD");
                }
                else {
                    numData.classList.add("textU");
                }
                document.getElementById(targetTile.id).append(numData);
            }
        }
    }
}
function chackZeroMinus(sendTile, targetTile) {
    if (targetTile >= 0 && sendTile >= 3 && (sendTile == targetTile || targetTile == 0)) {
        return true;
    }
    return false;
}

function deldteTile(num){
    if(num <= 0) return false;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if(num == board[r][c]){
                let deldteTargetTile = document.getElementById(r.toString() + "-" + c.toString());
                board[r][c] = 0;
                if ((r == 1 && c == 3)
                    || (r == 2 && c == 2)
                    || (r == 2 && c == 4)
                    || (r == 3 && c == 1)
                    || (r == 3 && c == 3)
                    || (r == 3 && c == 5)) {
                        deldteTargetTile.classList.remove(...deldteTargetTile.classList);
                        deldteTargetTile.classList.add("tD");
                }
                else {
                    deldteTargetTile.classList.remove(...deldteTargetTile.classList);
                    deldteTargetTile.classList.add("tU");
                }
                while (deldteTargetTile.firstChild) {
                    deldteTargetTile.removeChild(deldteTargetTile.firstChild);
                }
            }
        }
    }
    return true;
}

function setNewTile() {
    if (!(hasEmptyTile())) { return; }
    let found = false;
    let newTileNum = 0;
    if(gameScore >= 1000){ newTileNum = 12; deldteTile(6);}
    else if(gameScore >= 100){ newTileNum = 6; deldteTile(3);}
    else{ newTileNum = 3; }
    while (!(found)) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        if (board[r][c] == 0) {
            board[r][c] = newTileNum;
            let tile = document.getElementById(r.toString() + "-" + c.toString());

            if ((r == 1 && c == 3) || (r == 2 && c == 2) || (r == 2 && c == 4) || (r == 3 && c == 1) || (r == 3 && c == 3) || (r == 3 && c == 5)) {
                tile.classList.remove("tD");
                tile.classList.add("t" + newTileNum + "D");
            }
            else {
                tile.classList.remove("tU");
                tile.classList.add("t" + newTileNum + "U");
            }

            let numData = document.createElement("div");
            numData.innerText = newTileNum;
            if ((r == 1 && c == 3) || (r == 2 && c == 2) || (r == 2 && c == 4) || (r == 3 && c == 1) || (r == 3 && c == 3) || (r == 3 && c == 5)) {
                numData.classList.add("textD");
            }
            else {
                numData.classList.add("textU");
            }
            document.getElementById(tile.id).append(numData);
            found = true;
        }
    }
}

function hasEmptyTile() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] == 0) { return true; }
        }
    }
    gameOverChack();
    return false;
}
