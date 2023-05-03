window.onload = function () { setGame(); }

var rows = 4;
var columns = 7;
var board = [[-1, -1, -1, 0, -1, -1, -1],
[-1, -1, 0, 0, 0, -1, -1],
[-1, 0, 0, 0, 0, 0, -1],
[0, 0, 0, 0, 0, 0, 0]];
var gameScore = 0;

function setGame() {
    board = [[-1, -1, -1, 0, -1, -1, -1],
    [-1, -1, 0, 0, 0, -1, -1],
    [-1, 0, 0, 0, 0, 0, -1],
    [0, 0, 0, 0, 0, 0, 0]];
    /* testing
    board =[[-1, -1, -1, 96, -1, -1, -1],
            [-1, -1, 24, 48, 24, -1, -1],
            [-1, 3, 12, 3, 12, 3, -1],
            [3, 6, 3, 192, 3, 6, 3]];*/
    gameScore = 0;
    deldteChild("board");
    updateScore();
    closePopup();
    boardUpdate();
    for (let i = 0; i < 3; i++) {
        setNewTile();
    }
}

function deldteChild(Id) {
    let temp = document.getElementById(Id);
    while (temp.firstChild) {
        temp.removeChild(temp.firstChild);
    }
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
    deldteChild("score");
    document.getElementById("score").append(gameScore);
}

function addScore(point) {
    gameScore = gameScore + point;
    updateScore();
}

function chackReverseTriangle(r, c) {
    if ((r == 1 && c == 3)
        || (r == 2 && c == 2)
        || (r == 2 && c == 4)
        || (r == 3 && c == 1)
        || (r == 3 && c == 3)
        || (r == 3 && c == 5)) {
        return true;
    }
    else {
        return false
    }
}

function gameOverChack() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] >= 0) {
                if (chackReverseTriangle(r, c)) {
                    if (board[r][c] == board[r - 1][c] || board[r][c] == board[r][c - 1] || board[r][c] == board[r][c + 1]) {
                        return false;
                    }
                    else {
                        if (r == 3 && c == 0 && (board[r][c] == board[r][c + 1])) { return false; }
                        else if (r == 3 && c == 6 && (board[r][c] == board[r][c - 1])) { }
                        else if (r == 3 && (board[r][c] == board[r][c - 1] || board[r][c] == board[r][c + 1])) { return false; }
                        else if (board[r][c] == board[r - 1][c] || board[r][c] == board[r][c - 1] || board[r][c] == board[r][c + 1]) { return false; }
                    }
                }
            }
        }
    }

    deldteChild("endScore");
    document.getElementById("endScore").append(gameScore);


    let maxTile = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (maxTile < board[r][c]) { maxTile = board[r][c] }
        }
    }

    deldteChild("maxTiles");
    document.getElementById("maxTiles").append(maxTile);

    openPopup();
}


function openPopup() {
    document.querySelector(".background").className = "background show";
}
function closePopup() {
    document.querySelector(".background").className = "background";
}

function questionGame() {
    document.querySelector(".backgroundQuestion").className = "backgroundQuestion showQuestion";
}
function closePopupQuestion() {
    document.querySelector(".backgroundQuestion").className = "backgroundQuestion";
}

function settingPopup() {
    document.querySelector(".backgroundSetting").className = "backgroundSetting showSetting";
}
function closePopupSetting() {
    document.querySelector(".backgroundSetting").className = "backgroundSetting";
}

function openRepositories(){
    window.open("https://github.com/heojinhyuk/3027", "_blank");
}

function openTwitter(){
    window.open("https://twitter.com/3072app", "_blank");
}

function Sharing() {
    var text = "     \n";
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] >= 0) {
                if(board[r][c] == 0){
                    text += "0⃣" // 0블럭
                }
                else if (board[r][c] <= 6) {
                    text += "⬜️" // 흰색
                }
                else if (board[r][c] <= 12) {
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
            if (maxTile < board[r][c]) { maxTile = board[r][c] }
        }
    }
    text += maxTile + "\n" + "3072.app";

    var twitter_url =
        "https://twitter.com/intent/tweet?text=" +
        encodeURIComponent(text);
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
            if (chackReverseTriangle(r, c)) {
                tile.classList.add("tD");
            }
            else {
                tile.classList.add("tU");
            }
        }
        else if (num < 3072) {
            if (chackReverseTriangle(r, c)) {
                tile.classList.remove();
                tile.classList.add("t" + num.toString() + "D");
            }
            else {
                tile.classList.remove();
                tile.classList.add("t" + num.toString() + "U");
            }
        }
        else {
            if (chackReverseTriangle(r, c)) {
                tile.classList.add("t" + 3072 + "D");
            }
            else {
                tile.classList.add("t" + 3072 + "U");
            }
        }

        if (num != 0) {
            let numData = document.createElement("div");
            numData.innerText = num;
            if (chackReverseTriangle(r, c)) {
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
        if(e.keyCode == 82 || e.keyCode == 81 || e.keyCode == 87 || e.keyCode == 69 || e.keyCode == 65 || e.keyCode == 83 || e.keyCode == 68){
            silde(e.keyCode);
        }
    });
}

// Q W E    movedLeftUp   movedVerticalUp   movedRightUp
// A S D    movedLeftDown movedVerticalDown movedRightDown
function silde(num) {
    if (num == 82) { setGame(); } // R
    else {
        if (num == 81) { slideLeftUp(); } // Q
        else if (num == 87) { slideUp(); } // W
        else if (num == 69) { slideRightUp(); } // E
        else if (num == 65) { slideLeftDown(); } // A
        else if (num == 83) { slideDown(); } // S
        else if (num == 68) { slideRightDown(); } // D
        setNewTile();
        if (hasEmptyTile()) { addScore(1); }
    }
}

function slideLeftUp() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            sildeTile(r, c, r, c - 1);
        }
    }
}
function slideUp() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            sildeTile(r, c, r - 1, c, true);
        }
    }
}
function slideRightUp() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            sildeTile(r, c, r, c + 1);
        }
    }
}
function slideLeftDown() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            sildeTile(r, c, r, c - 1, true);
        }
    }
}
function slideDown() {
    for (let r = 0; r + 1 < rows; r++) {
        for (let c = 0; c < columns; c++) {
            sildeTile(r, c, r + 1, c);
        }
    }
}
function slideRightDown() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            sildeTile(r, c, r, c + 1, true);
        }
    }
}

function sildeTile(sendR, sendC, targetR, targetC, reverse = false) {
    if (sendR >= 0 && sendC >= 0 && targetR >= 0 && targetC >= 0) {
        let sendTile = document.getElementById(sendR.toString() + "-" + sendC.toString());
        let targetTile = document.getElementById(targetR.toString() + "-" + targetC.toString());

        if (chackZeroMinus(board[sendR][sendC], board[targetR][targetC]) &&
            (chackReverseTriangle(sendR, sendC) == reverse) && targetR >= 0 && targetC >= 0) {
            if (board[targetR][targetC] == board[sendR][sendC]) { addScore(board[targetR][targetC] * 2); }
            board[targetR][targetC] = board[targetR][targetC] + board[sendR][sendC];
            board[sendR][sendC] = 0;
            if (chackReverseTriangle(sendR, sendC)) {
                sendTile.classList.remove(...sendTile.classList);
                sendTile.classList.add("tD");
            }
            else {
                sendTile.classList.remove(...sendTile.classList);
                sendTile.classList.add("tU");
            }
            deldteChild(sendTile.id);
            if (chackReverseTriangle(targetR, targetC)) {
                targetTile.classList.remove(...targetTile.classList);
                targetTile.classList.add("t" + board[targetR][targetC] + "D");
            }
            else {
                targetTile.classList.remove(...targetTile.classList);
                targetTile.classList.add("t" + board[targetR][targetC] + "U");
            }
            deldteChild(targetTile.id);
            let numData = document.createElement("div");
            numData.innerText = board[targetR][targetC];
            if (chackReverseTriangle(targetR, targetC)) {
                numData.classList.add("textD");
            }
            else {
                numData.classList.add("textU");
            }
            document.getElementById(targetTile.id).append(numData);
        }

    }
}

function chackZeroMinus(sendTile, targetTile) {
    if (targetTile >= 0 && sendTile >= 3 && (sendTile == targetTile || targetTile == 0)) { return true; }
    return false;
}

function deldteTile(num) {
    if (num <= 0) return false;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (num == board[r][c]) {
                let deldteTargetTile = document.getElementById(r.toString() + "-" + c.toString());
                board[r][c] = 0;
                if (chackReverseTriangle(r, c)) {
                    deldteTargetTile.classList.remove(...deldteTargetTile.classList);
                    deldteTargetTile.classList.add("tD");
                }
                else {
                    deldteTargetTile.classList.remove(...deldteTargetTile.classList);
                    deldteTargetTile.classList.add("tU");
                }
                deldteChild(deldteTargetTile.id);
            }
        }
    }
    return true;
}

function setNewTile() {
    if (!(hasEmptyTile())) { return false; }
    let found = false;
    let newTileNum = 0;
    if (gameScore >= 1000) { newTileNum = 12; deldteTile(6); }
    else if (gameScore >= 100) { newTileNum = 6; deldteTile(3); }
    else { newTileNum = 3; }
    while (!(found)) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        if (board[r][c] == 0) {
            board[r][c] = newTileNum;
            let tile = document.getElementById(r.toString() + "-" + c.toString());

            if (chackReverseTriangle(r, c)) {
                tile.classList.remove("tD");
                tile.classList.add("t" + newTileNum + "D");
            }
            else {
                tile.classList.remove("tU");
                tile.classList.add("t" + newTileNum + "U");
            }

            let numData = document.createElement("div");
            numData.innerText = newTileNum;
            if (chackReverseTriangle(r, c)) {
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
