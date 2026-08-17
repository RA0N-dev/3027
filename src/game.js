window.onload = function () { setGame(); }

const toggleList = document.querySelectorAll('.toggleSwitch');

toggleList.forEach((toggle) => {
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
  });
});

// 판 모양. -1은 판 바깥이라 타일이 놓이지 않는 칸이다.
const BOARD_SHAPE = [[-1, -1, -1, 0, -1, -1, -1],
[-1, -1, 0, 0, 0, -1, -1],
[-1, 0, 0, 0, 0, 0, -1],
[0, 0, 0, 0, 0, 0, 0]];

// 역삼각형(뒤집힌 삼각형)이 놓이는 칸.
const REVERSE_TILES = ["1-3", "2-2", "2-4", "3-1", "3-3", "3-5"];

// Q W E    왼쪽 위   위     오른쪽 위
// A S D    왼쪽 아래 아래   오른쪽 아래
// 각 방향은 "어느 칸으로 옮기는지(dr, dc)"와 "어느 방향 삼각형이 움직이는지(reverse)"로만 다르다.
const SLIDE_DIRECTIONS = {
    81: { dr: 0, dc: -1, reverse: false }, // Q
    87: { dr: -1, dc: 0, reverse: true },  // W
    69: { dr: 0, dc: 1, reverse: false },  // E
    65: { dr: 0, dc: -1, reverse: true },  // A
    83: { dr: 1, dc: 0, reverse: false },  // S
    68: { dr: 0, dc: 1, reverse: true },   // D
};
const RESET_KEY = 82; // R

// 점수 구간이 오르면 가장 낮은 타일을 판에서 지우고 그다음 타일이 나오기 시작한다.
// [기준 점수, 새로 나올 타일, 판에서 지울 타일]
const TILE_STEPS_NORMAL = [[10000, 24, 12], [1000, 12, 6], [100, 6, 3]];
const TILE_STEPS_HARD = [[1000, 12, 6], [100, 6, 3]];
const FIRST_TILE = 3;
const WIN_TILE = 3072;

var rows = 4;
var columns = 7;
var board = BOARD_SHAPE.map((row) => row.slice());
var gameScore = 0;
var hardMode = false;
var darkMode = false;
var gameWon = false;
var gameContinue = false;


function setGame() {
    gameWon = false;
    gameContinue = false;
    board = BOARD_SHAPE.map((row) => row.slice());
    gameScore = 0;
    if (darkMode) { document.body.classList.add("dark"); }
    else { document.body.classList.remove("dark"); }
    buildBoard();
    updateScore();
    closePopup();
    render();
    for (let i = 0; i < 3; i++) {
        setNewTile();
    }
}

function chackReverseTriangle(r, c) {
    return REVERSE_TILES.includes(r + "-" + c);
}


/* ===== 렌더링 =====
   board 배열이 유일한 진실이고, DOM은 여기서만 만든다. */

function deldteChild(Id) {
    let temp = document.getElementById(Id);
    while (temp.firstChild) {
        temp.removeChild(temp.firstChild);
    }
}

function setText(id, value) {
    deldteChild(id);
    document.getElementById(id).append(value);
}

// 타일 칸을 한 번만 만들어 두고, 이후에는 renderTile()로 내용만 갈아끼운다.
function buildBoard() {
    let boardElement = document.getElementById("board");
    deldteChild("board");
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("div");
            tile.id = r + "-" + c;
            boardElement.append(tile);
        }
    }
}

function renderTile(r, c) {
    let tile = document.getElementById(r + "-" + c);
    let num = board[r][c];

    deldteChild(tile.id);
    tile.classList.value = "";

    if (num < 0) {
        tile.classList.add("tileLess");
        return tile;
    }

    let facing = chackReverseTriangle(r, c) ? "D" : "U";
    tile.classList.add("t" + facing);

    if (num > 0) {
        tile.classList.add("t" + Math.min(num, WIN_TILE) + facing);
        let numData = document.createElement("div");
        numData.innerText = num;
        numData.classList.add("text" + facing);
        tile.append(numData);
    }
    return tile;
}

function render() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            renderTile(r, c);
        }
    }
}


/* ===== 점수 ===== */

function updateScore() {
    setText("score", gameScore);
}

function addScore(point) {
    gameScore = gameScore + point;
    updateScore();
}

function maxTile() {
    let max = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (max < board[r][c]) { max = board[r][c]; }
        }
    }
    return max;
}


/* ===== 판정 ===== */

function hasEmptyTile() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] == 0) { return true; }
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

function gameWinchack() {
    if (gameContinue) { return false; }
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] == WIN_TILE) {
                gameWon = true;
                setText("winScore", gameScore);
                openWinPopup();
                return true;
            }
        }
    }
    return false;
}

function showGameOver() {
    setText("endScore", gameScore);
    setText("maxTiles", maxTile());
    openPopup();
}


/* ===== 이동 ===== */

// Q W E    slideLeftUp   slideUp   slideRightUp
// A S D    slideLeftDown slideDown slideRightDown
function silde(num) {
    if (num == RESET_KEY) { setGame(); return; }

    // 승리 팝업이 떠 있는 동안(아직 이어하기를 고르지 않은 상태)에는 입력을 받지 않는다.
    if (gameWon && !gameContinue) { return; }

    let direction = SLIDE_DIRECTIONS[num];
    if (!direction) { return; }

    // 실제로 옮겨진 타일이 있을 때만 새 타일 생성/점수 추가/사운드 재생이 따라온다.
    if (slideBoard(direction)) {
        playSlideSound();
        setText("winScore", gameScore);

        if (gameWinchack()) { return; }

        if (hasEmptyTile()) { addScore(1); }
        setNewTile();
    }

    // 게임오버 판정은 새 타일이 놓인 뒤에, 그리고 이동이 실패한 입력에서도 해야 한다.
    // 성공한 이동은 항상 빈칸을 남기므로 이동 직후에만 검사하면 판정이 영영 성립하지 않고,
    // 반대로 이미 막힌 판에서는 어떤 이동도 성공하지 못하기 때문이다.
    if (!canMove()) { showGameOver(); }
}

function slideBoard(direction) {
    let moved = false;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (sildeTile(r, c, r + direction.dr, c + direction.dc, direction.reverse)) { moved = true; }
        }
    }
    return moved;
}

function sildeTile(sendR, sendC, targetR, targetC, reverse = false) {
    if (targetR < 0 || targetR >= rows || targetC < 0 || targetC >= columns) { return false; }
    // 한 번의 입력에서 같은 타일이 두 번 움직이지 않는 이유: 정삼각형 칸과 역삼각형 칸은
    // 서로 맞닿아 있어서, 옮겨간 칸은 항상 이번에 움직이는 방향과 반대 종류의 칸이 된다.
    if (chackReverseTriangle(sendR, sendC) != reverse) { return false; }
    if (!chackZeroMinus(board[sendR][sendC], board[targetR][targetC])) { return false; }

    if (board[targetR][targetC] == board[sendR][sendC]) { addScore(board[targetR][targetC] * 2); }
    board[targetR][targetC] = board[targetR][targetC] + board[sendR][sendC];
    board[sendR][sendC] = 0;

    renderTile(sendR, sendC);
    renderTile(targetR, targetC);
    return true;
}

// 빈칸으로 옮기거나(targetTile == 0), 같은 값끼리 합칠 때만 이동할 수 있다.
function chackZeroMinus(sendTile, targetTile) {
    if (targetTile >= 0 && sendTile >= FIRST_TILE && (sendTile == targetTile || targetTile == 0)) { return true; }
    return false;
}


/* ===== 새 타일 ===== */

function deldteTile(num) {
    if (num <= 0) { return false; }
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] == num) {
                board[r][c] = 0;
                renderTile(r, c);
            }
        }
    }
    return true;
}

// 점수 구간에 맞는 타일을 고르고, 한 단계 낮은 타일은 판에서 지운다.
function nextTileNumber() {
    let steps = hardMode ? TILE_STEPS_HARD : TILE_STEPS_NORMAL;
    for (let [score, spawn, removed] of steps) {
        if (gameScore >= score) {
            deldteTile(removed);
            return spawn;
        }
    }
    return FIRST_TILE;
}

function emptyTiles() {
    let empties = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] == 0) { empties.push([r, c]); }
        }
    }
    return empties;
}

function setNewTile() {
    if (!hasEmptyTile() || (gameWon && !gameContinue)) { return false; }

    let newTileNum = nextTileNumber();

    // nextTileNumber()가 낮은 타일을 지워 빈칸이 늘어날 수 있으니 그 뒤에 자리를 고른다.
    let empties = emptyTiles();
    if (empties.length == 0) { return false; }
    let [r, c] = empties[Math.floor(Math.random() * empties.length)];

    board[r][c] = newTileNum;
    renderTile(r, c);
    return true;
}


/* ===== 팝업 / 설정 ===== */

function showPopup(id) {
    document.getElementById(id).className = "background show";
}
function hidePopup(id) {
    document.getElementById(id).className = "background";
}

// 3072를 만든 뒤 이어서 플레이하다 막혔을 때도 승리 팝업이 아니라
// 점수와 최대 타일이 담긴 게임오버 팝업을 띄운다.
function openPopup() { showPopup("gameOverPopup"); }
function closePopup() { hidePopup("gameOverPopup"); }

function questionGame() { showPopup("questionPopup"); }
function closePopupQuestion() { hidePopup("questionPopup"); }

function settingPopup() { showPopup("settingPopup"); }
function closePopupSetting() { hidePopup("settingPopup"); }

function openWinPopup() { showPopup("gameWinPopup"); }
function closeWinPopup() {
    hidePopup("gameWinPopup");
    gameContinue = true;
}

function checkHardMode() {
    hardMode = !hardMode;
    setGame();
}

function checkDarkMode() {
    darkMode = !darkMode;
    setGame();
}

function openRepositories() {
    window.open("https://github.com/RA0N-dev/3027", "_blank");
}

function openTwitter() {
    window.open("https://twitter.com/3072app", "_blank");
}


/* ===== 공유 ===== */

function boardEmoji() {
    let text = "";
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] < 0) { text += "◼️"; }
            else if (board[r][c] == 0) { text += "0⃣"; }      // 0블럭
            else if (board[r][c] <= 6) { text += "⬜️"; }      // 흰색
            else if (board[r][c] <= 12) { text += "🟫"; }     // 갈색
            else if (board[r][c] <= 48) { text += "🟧"; }     // 주황색
            else if (board[r][c] <= 96) { text += "🟥"; }     // 빨간색
            else { text += "🟨"; }                            // 노란색
            text += " ";
        }
        text += "\n";
    }
    return text;
}

function shareText(resultLine) {
    let text = "     \n" + boardEmoji();
    text += "Score : " + gameScore.toString() + "\n";
    text += resultLine + "\n";
    text += "play mode : " + (hardMode ? "HARD" : "NORMAL") + "\n";
    text += "\n" + "3072.app";
    return text;
}

function openTweet(text) {
    window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(text), "_blank");
}

function sharing() {
    openTweet(shareText("max tiles : " + maxTile()));
}

function sharingWin() {
    openTweet(shareText("Made 3072 and won"));
}


/* ===== 입력 / 사운드 ===== */

function playSlideSound() {
    let sound = document.getElementById("slideSound");
    sound.pause();
    sound.currentTime = 0;
    sound.play();
}

function device_checking() {
    document.addEventListener("keyup", (e) => {
        if (e.keyCode == RESET_KEY || SLIDE_DIRECTIONS[e.keyCode]) {
            silde(e.keyCode);
        }
    });
}
