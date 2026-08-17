window.onload = function () { setGame(); }

const toggleList = document.querySelectorAll('.toggleSwitch');

toggleList.forEach((toggle) => {
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
  });
}); 

var rows = 4;
var columns = 7;
var board = [[-1, -1, -1, 0, -1, -1, -1],
[-1, -1, 0, 0, 0, -1, -1],
[-1, 0, 0, 0, 0, 0, -1],
[0, 0, 0, 0, 0, 0, 0]];
var gameScore = 0;
var hardMode = false;
var darkMode = false;
var gameWon = false;
var gameContinue = false;



function setGame() {
    gameWon = false;
    gameContinue = false;
    board = [[-1, -1, -1, 0, -1, -1, -1],
    [-1, -1, 0, 0, 0, -1, -1],
    [-1, 0, 0, 0, 0, 0, -1],
    [0, 0, 0, 0, 0, 0, 0]];
    gameScore = 0;
    let body = document.getElementsByTagName("body");
    if(darkMode){document.body.classList.add("dark");}
    else{document.body.classList.remove("dark");}
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

function gameWinchack(){
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] == 3072 && !gameContinue) {
                gameWon = true;
                openWinPopup();
                deldteChild("winScore");
                document.getElementById("winScore").append(gameScore);
                return true;
            }
        }
    }
    return false;
}

// 아직 움직일 수 있는지만 판정한다(DOM은 건드리지 않는다).
// 빈칸이 하나라도 있으면 그 칸과 맞닿은 타일이 반드시 존재하므로 움직일 수 있고,
// 삼각 격자의 모든 인접 변은 역삼각형 하나와 정삼각형 하나를 잇기 때문에
// 역삼각형 칸의 위/왼쪽/오른쪽만 검사해도 인접 쌍을 빠짐없이 확인한 것이 된다.
function canMove() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] < 0) { continue; }
            if (board[r][c] == 0) { return true; }
            if (chackReverseTriangle(r, c)) {
                if (board[r][c] == board[r - 1][c] || board[r][c] == board[r][c - 1] || board[r][c] == board[r][c + 1]) {
                    return true;
                }
            }
        }
    }
    return false;
}

function showGameOver() {
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


// 3072를 만든 뒤 이어서 플레이하다 막혔을 때도 승리 팝업이 아니라
// 점수와 최대 타일이 담긴 게임오버 팝업을 띄운다.
function openPopup() {
    document.getElementById("gameOverPopup").className = "background show";
}
function closePopup() {
    document.getElementById("gameOverPopup").className = "background";
}

function questionGame() {
    document.getElementById("questionPopup").className = "background show";
}
function closePopupQuestion() {
    document.getElementById("questionPopup").className = "background";
}

function settingPopup() {
    document.getElementById("settingPopup").className = "background show";
}
function closePopupSetting() {
    document.getElementById("settingPopup").className = "background";
}

function openRepositories(){
    window.open("https://github.com/RA0N-dev/3027", "_blank");
}

function openTwitter(){
    window.open("https://twitter.com/3072app", "_blank");
}

function openWinPopup() {
    document.getElementById("gameWinPopup").className = "background show";
}
function closeWinPopup() {
    document.getElementById("gameWinPopup").className = "background";
    gameContinue = true;
}

function sharing() {
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

    let maxTile = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (maxTile < board[r][c]) { maxTile = board[r][c] }
        }
    }
    text += "max tiles : " +  maxTile + "\n" + "play mode : ";

    text += (hardMode)?"HARD":"NORMAL" + "\n";

    text +="\n" + "3072.app";

    var twitter_url =
        "https://twitter.com/intent/tweet?text=" +
        encodeURIComponent(text);
    window.open(twitter_url, "_blank");
}

function sharingWin(){
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

    let maxTile = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (maxTile < board[r][c]) { maxTile = board[r][c] }
        }
    }
    text += "Made 3072 and won" + "\n" + "play mode : ";

    text += (hardMode)?"HARD":"NORMAL" + "\n";

    text +="\n" + "3072.app";

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
        if (chackReverseTriangle(r, c)) {
            tile.classList.add("tD");
        }
        else {
            tile.classList.add("tU");
        }

        if (num < 3072) {
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
    if (num == 82) { setGame(); return; } // R

    // 승리 팝업이 떠 있는 동안(아직 이어하기를 고르지 않은 상태)에는 입력을 받지 않는다.
    if (gameWon == true && gameContinue == false) { return; }

    let moved = false;
    if      (num == 81) { moved = slideLeftUp(); } // Q
    else if (num == 87) { moved = slideUp(); } // W
    else if (num == 69) { moved = slideRightUp(); } // E
    else if (num == 65) { moved = slideLeftDown(); } // A
    else if (num == 83) { moved = slideDown(); } // S
    else if (num == 68) { moved = slideRightDown(); } // D

    // 실제로 옮겨진 타일이 있을 때만 새 타일 생성/점수 추가/사운드 재생이 따라온다.
    if (moved) {
        slideSound.pause();
        slideSound.currentTime = 0;
        slideSound.play();

        deldteChild("winScore");
        document.getElementById("winScore").append(gameScore);

        if (gameWinchack()) { return; }

        if (hasEmptyTile()) { addScore(1); }
        setNewTile();
    }

    // 게임오버 판정은 새 타일이 놓인 뒤에, 그리고 이동이 실패한 입력에서도 해야 한다.
    // 성공한 이동은 항상 빈칸을 남기므로 이동 직후에만 검사하면 판정이 영영 성립하지 않고,
    // 반대로 이미 막힌 판에서는 어떤 이동도 성공하지 못하기 때문이다.
    if (!canMove()) { showGameOver(); }
}

function slideLeftUp() {
    let moved = false;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (sildeTile(r, c, r, c - 1)) { moved = true; }
        }
    }
    return moved;
}
function slideUp() {
    let moved = false;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (sildeTile(r, c, r - 1, c, true)) { moved = true; }
        }
    }
    return moved;
}
function slideRightUp() {
    let moved = false;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (sildeTile(r, c, r, c + 1)) { moved = true; }
        }
    }
    return moved;
}
function slideLeftDown() {
    let moved = false;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (sildeTile(r, c, r, c - 1, true)) { moved = true; }
        }
    }
    return moved;
}
function slideDown() {
    let moved = false;
    for (let r = 0; r + 1 < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (sildeTile(r, c, r + 1, c)) { moved = true; }
        }
    }
    return moved;
}
function slideRightDown() {
    let moved = false;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (sildeTile(r, c, r, c + 1, true)) { moved = true; }
        }
    }
    return moved;
}

function sildeTile(sendR, sendC, targetR, targetC, reverse = false) {
    if (sendR >= 0 && sendC >= 0 && targetR >= 0 && targetC >= 0) {
        let sendTile = document.getElementById(sendR.toString() + "-" + sendC.toString());
        let targetTile = document.getElementById(targetR.toString() + "-" + targetC.toString());

        if (chackZeroMinus(board[sendR][sendC], board[targetR][targetC]) &&
            (chackReverseTriangle(sendR, sendC) == reverse) && targetR >= 0 && targetC >= 0) {
            if (board[targetR][targetC] == board[sendR][sendC]) {
                addScore(board[targetR][targetC] * 2);
            }
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
                targetTile.classList.add("tD");
                targetTile.classList.add("t" + board[targetR][targetC] + "D");
            }
            else {
                targetTile.classList.remove(...targetTile.classList);
                targetTile.classList.add("tU");
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
            return true;
        }
    }
    return false;
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
    if (!hasEmptyTile() || (gameWon == true ^ gameContinue == true)) { return false; }
    let found = false;
    let newTileNum = 0;
    if(hardMode == true){
        if (gameScore >= 1000) { newTileNum = 12; deldteTile(6); }
        else if (gameScore >= 100) { newTileNum = 6; deldteTile(3); }
        else { newTileNum = 3; }
    }
    else{
        if (gameScore >= 10000) { newTileNum = 24; deldteTile(12); }
        else if (gameScore >= 1000) { newTileNum = 12; deldteTile(6); }
        else if (gameScore >= 100) { newTileNum = 6; deldteTile(3); }
        else { newTileNum = 3; }
    }
    
    while (!(found)) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        if (board[r][c] == 0) {
            board[r][c] = newTileNum;
            let tile = document.getElementById(r.toString() + "-" + c.toString());

            if (chackReverseTriangle(r, c)) {
                tile.classList.add("t" + newTileNum + "D");
            }
            else {
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
    return false;
}
function checkHardMode(){
    hardMode = hardMode?false:true;
    setGame();
}

function checkDarkMode(){
    darkMode = darkMode?false:true;
    setGame();
}
