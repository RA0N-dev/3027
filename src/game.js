// 저장된 판이 있으면 그대로 이어하고, 없으면 새 판을 깐다.
// onload 가 아니라 DOMContentLoaded 인 이유: onload 는 사운드 파일까지 다 받은 뒤에야
// 돌아서, 그동안 판이 비어 있는 채로 기다리게 된다. 판을 그리는 데는 DOM 만 있으면 된다.
document.addEventListener("DOMContentLoaded", function () {
    if (loadGame()) { resumeGame(); }
    else { setGame(); }

    // 첫 그림이 끝난 뒤에 테마 전환 연출을 다시 켠다. 프레임을 두 번 기다리는 것은
    // 한 번만 기다리면 아직 그리기 전이라 전환이 그대로 재생되기 때문이다.
    requestAnimationFrame(() => {
        requestAnimationFrame(() => { document.body.classList.remove("preload"); });
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
const UNDO_KEY = 90; // Z
const UNDO_LIMIT = 50;

// 화면의 버튼은 onclick 으로 위 번호를 그대로 넘기고, 키보드는 물리 키 이름으로 들어온다.
const CODE_TO_KEY = { KeyQ: 81, KeyW: 87, KeyE: 69, KeyA: 65, KeyS: 83, KeyD: 68, KeyZ: UNDO_KEY };

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
var bestScore = 0;
var hardMode = false;
var darkMode = false;
var soundOn = true;
var gameWon = false;
var gameContinue = false;
var scoreGain = 0; // 이번 입력으로 오른 점수. 떠오르는 "+n" 표시에 쓴다.
var scorePlusElement = null; // 지금 떠오르고 있는 "+n" 요소
var moveHistory = []; // 실행취소용 이전 상태 스택


/* ===== 애니메이션 =====
   CSS 키프레임에 클래스를 붙였다 떼는 것이 전부라 별도 라이브러리가 필요 없다.
   각 값은 src/style.css 의 animation 재생 시간과 맞춰야 한다. */

const ANIM_MS = {
    tileSlide: 140,
    tileSlideMerge: 340,
    tileSpawn: 280,
    boardShake: 320,
    boardIn: 420,
    bump: 340,
    pressed: 140,
    spin: 500,
};
const COUNT_UP_MS = 600;
const KEY_BUTTONS = { 81: "qKey", 87: "wKey", 69: "eKey", 65: "aKey", 83: "sKey", 68: "dKey" };

const reduceMotion = window.matchMedia
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const animTimers = new WeakMap();

function playAnim(element, name) {
    if (!element || reduceMotion) { return; }

    let timers = animTimers.get(element);
    if (!timers) { timers = {}; animTimers.set(element, timers); }
    // 앞선 재생에 걸어둔 타이머를 취소한다. 그대로 두면 재생 중인 이번 애니메이션을
    // 도중에 끊어버려서, 빠르게 연속으로 움직일 때 타일이 미끄러지다 툭 멈춘다.
    clearTimeout(timers[name]);

    element.classList.remove(name);
    void element.offsetWidth; // 같은 프레임에 다시 붙여도 처음부터 재생되도록 리플로우를 강제한다
    element.classList.add(name);
    timers[name] = setTimeout(() => { element.classList.remove(name); }, ANIM_MS[name]);
}

// 옮겨간 칸에서 원래 칸까지의 거리를 CSS 변수로 넘겨, 출발 지점에서 미끄러져 오게 한다.
function playMoveAnim(element, name, dx, dy) {
    if (reduceMotion) { return; }
    element.style.setProperty("--dx", dx + "px");
    element.style.setProperty("--dy", dy + "px");
    playAnim(element, name);
}

function playScoreGain() {
    if (scoreGain <= 0) { return; }
    playAnim(document.getElementById("score"), "bump");

    if (!reduceMotion) {
        // 빠르게 연속으로 움직이면 같은 자리에 겹쳐 쌓이므로 앞의 것을 먼저 치운다.
        if (scorePlusElement) { scorePlusElement.remove(); }

        let plus = document.createElement("div");
        plus.className = "scorePlus";
        plus.innerText = "+" + scoreGain;
        document.getElementById("scoreCell").append(plus);
        scorePlusElement = plus;
        setTimeout(() => {
            plus.remove();
            if (scorePlusElement === plus) { scorePlusElement = null; }
        }, 900);
    }
    scoreGain = 0;
}

function countUp(id, value) {
    if (reduceMotion || value <= 0) { setText(id, value); return; }

    setText(id, 0); // 돌고 있던 카운트업이 있으면 취소하고 0에서 다시 시작한다
    let element = document.getElementById(id);
    let token = countTokens[id];
    let start = performance.now();

    let step = function (now) {
        if (countTokens[id] !== token) { return; }
        let progress = Math.min((now - start) / COUNT_UP_MS, 1);
        element.innerText = Math.round(value * (1 - Math.pow(1 - progress, 3)));
        if (progress < 1) { requestAnimationFrame(step); }
    };
    requestAnimationFrame(step);
}


/* ===== 저장 =====
   새로고침하거나 탭을 잘못 닫아도 하던 판이 그대로 남아 있게 한다.
   localStorage 는 사생활 보호 모드처럼 막히는 환경이 있어서, 실패해도 게임은 그냥 굴러가게 둔다. */

const SAVE_KEY = "3072";

function saveGame() {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify({
            board, gameScore, bestScore, gameWon, gameContinue, hardMode, darkMode, soundOn,
        }));
    } catch (e) { /* 저장이 막혀도 진행에는 지장이 없다 */ }
}

// 이어할 판을 되살렸으면 true. 설정과 최고 점수는 판을 못 이어받아도 그대로 가져온다.
function loadGame() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { }
    if (!saved) { return false; }

    bestScore = saved.bestScore || 0;
    hardMode = !!saved.hardMode;
    darkMode = !!saved.darkMode;
    soundOn = saved.soundOn !== false; // 소리 설정이 없던 시절의 저장본은 켠 것으로 본다

    // 남의 손을 탔거나 판 모양이 바뀐 뒤의 저장본을 그대로 믿으면 렌더링이 깨진다.
    if (!Array.isArray(saved.board) || saved.board.length != rows) { return false; }
    if (saved.board.some((row) => !Array.isArray(row) || row.length != columns)) { return false; }

    board = saved.board;
    gameScore = saved.gameScore || 0;
    gameWon = !!saved.gameWon;
    gameContinue = !!saved.gameContinue;
    return true;
}


function setGame() {
    gameWon = false;
    gameContinue = false;
    board = BOARD_SHAPE.map((row) => row.slice());
    gameScore = 0;
    scoreGain = 0;
    moveHistory = [];
    applyDarkMode();
    syncToggles();
    buildBoard();
    updateScore();
    closePopup();
    hideWinPopup(); // 승리 팝업의 다시 시작으로도 들어오므로 여기서 닫아준다
    render();
    for (let i = 0; i < 3; i++) {
        setNewTile();
    }
    updateKeyButtons();
    updateUndoButton();
    playAnim(document.getElementById("board"), "boardIn");
    playAnim(document.getElementById("resetButton"), "spin");
    saveGame();
}

// 저장된 판을 화면에 올린다. 새 타일을 놓지 않는 것 말고는 setGame() 과 같다.
function resumeGame() {
    moveHistory = [];
    applyDarkMode();
    syncToggles();
    buildBoard();
    updateScore();
    render();
    updateKeyButtons();
    updateUndoButton();
    playAnim(document.getElementById("board"), "boardIn");

    // 판이 끝난 상태로 저장됐다면 그 팝업까지 되살려야 한다.
    if (gameWon && !gameContinue) { countUp("winScore", gameScore); openWinPopup(); }
    else if (!canMove()) { showGameOver(); }
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

// 돌고 있는 countUp() 이 나중에 값을 덮어쓰지 않도록, 값을 바꿀 때마다 표를 올린다.
const countTokens = {};

function setText(id, value) {
    countTokens[id] = (countTokens[id] || 0) + 1;
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

// 점수가 바뀌는 길은 전부 여기로 모이므로, 최고 점수도 여기서만 갱신하면 된다.
function updateScore() {
    setText("score", gameScore);
    if (gameScore > bestScore) { bestScore = gameScore; }
    setText("best", bestScore);
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

// 그 방향으로 옮겨지는 타일이 하나라도 있는지 판정한다(판은 건드리지 않는다).
// slideBoard() 는 칸을 훑으면서 옮기지만, 칸이 비는 것은 타일이 빠져나갈 때뿐이라
// 처음에 아무것도 못 움직이면 도중에 상황이 바뀌는 일도 없다. 그래서 이 검사만으로
// slideBoard() 가 움직일지 아닐지를 정확히 알 수 있다.
function canSlide(direction) {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let targetR = r + direction.dr;
            let targetC = c + direction.dc;
            if (targetR < 0 || targetR >= rows || targetC < 0 || targetC >= columns) { continue; }
            if (chackReverseTriangle(r, c) != direction.reverse) { continue; }
            if (chackZeroMinus(board[r][c], board[targetR][targetC])) { return true; }
        }
    }
    return false;
}

// 여섯 방향 중 하나라도 움직일 수 있으면 게임이 계속된다.
// 버튼에 표시하는 판정과 같은 함수를 쓰므로 둘이 어긋날 수 없다.
function canMove() {
    for (let key of Object.keys(SLIDE_DIRECTIONS)) {
        if (canSlide(SLIDE_DIRECTIONS[key])) { return true; }
    }
    return false;
}

// 못 움직이는 방향의 버튼을 흐리게 표시한다.
function updateKeyButtons() {
    for (let key of Object.keys(SLIDE_DIRECTIONS)) {
        let button = document.getElementById(KEY_BUTTONS[key]);
        if (!button) { continue; }
        if (canSlide(SLIDE_DIRECTIONS[key])) { button.classList.remove("blocked"); }
        else { button.classList.add("blocked"); }
    }
}

// 되돌릴 수가 없으면 버튼을 흐리게 표시한다.
function updateUndoButton() {
    let button = document.getElementById("undoButton");
    if (!button) { return; }
    if (moveHistory.length > 0) { button.classList.remove("blocked"); }
    else { button.classList.add("blocked"); }
}

function gameWinchack() {
    if (gameContinue) { return false; }
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] == WIN_TILE) {
                gameWon = true;
                // 팝업을 여는 시점의 점수를 그때 넣는다. 승리 팝업은 여기서만 열린다.
                countUp("winScore", gameScore);
                openWinPopup();
                return true;
            }
        }
    }
    return false;
}

function showGameOver() {
    countUp("endScore", gameScore);
    setText("maxTiles", maxTile());
    openPopup();
}


/* ===== 이동 ===== */

// Q W E    slideLeftUp   slideUp   slideRightUp
// A S D    slideLeftDown slideDown slideRightDown
function silde(num) {
    // 승리 팝업이 떠 있는 동안(아직 이어하기를 고르지 않은 상태)에는 입력을 받지 않는다.
    if (gameWon && !gameContinue) { return; }

    let direction = SLIDE_DIRECTIONS[num];
    if (!direction) { return; }
    playAnim(document.getElementById(KEY_BUTTONS[num]), "pressed");

    // 되돌릴 수 있게, 옮기기 전 상태를 미리 떠둔다. 움직이지 않은 입력은 되돌릴 것도 없으니
    // 실제로 옮겨졌을 때만 쌓는다.
    let beforeMove = snapshotState();

    // 실제로 옮겨진 타일이 있을 때만 새 타일 생성/점수 추가/사운드 재생이 따라온다.
    if (slideBoard(direction)) {
        moveHistory.push(beforeMove);
        // 한 판이 길어지면 되돌리기 기록이 끝없이 쌓인다. 몇 수씩 거슬러 올라갈 일은 없으니
        // 최근 것만 남긴다.
        if (moveHistory.length > UNDO_LIMIT) { moveHistory.shift(); }
        updateUndoButton();
        playSlideSound();

        if (gameWinchack()) { playScoreGain(); saveGame(); return; }

        addScore(1); // 옮겨진 타일이 있으면 출발 칸이 비므로 판이 꽉 찬 경우는 없다
        setNewTile();
        playScoreGain();
        // 저장은 판이 실제로 바뀐 이 자리에서만 한다. 막힌 방향을 눌렀을 때는 남길 것이
        // 없는데, 하필 판을 흔드는 그 순간에 쓰기가 끼어들면 애니메이션이 걸린다.
        saveGame();
    }
    else {
        // 그 방향으로는 이미 다 밀려 있다는 것을 판을 흔들어 알려준다.
        playAnim(document.getElementById("board"), "boardShake");
    }

    updateKeyButtons();

    // 게임오버 판정은 새 타일이 놓인 뒤에, 그리고 이동이 실패한 입력에서도 해야 한다.
    // 성공한 이동은 항상 빈칸을 남기므로 이동 직후에만 검사하면 판정이 영영 성립하지 않고,
    // 반대로 이미 막힌 판에서는 어떤 이동도 성공하지 못하기 때문이다.
    if (!canMove()) { showGameOver(); }
}

function snapshotState() {
    return { board: board.map((row) => row.slice()), score: gameScore, gameWon, gameContinue };
}

// 되돌릴 상태가 남아있는 한 언제든(승리/게임오버 팝업이 떠 있어도) 되돌릴 수 있다.
function undoMove() {
    if (moveHistory.length == 0) { return; }
    let previous = moveHistory.pop();
    board = previous.board;
    gameScore = previous.score;
    gameWon = previous.gameWon;
    gameContinue = previous.gameContinue;
    scoreGain = 0;

    closePopup();
    hideWinPopup();
    updateScore();
    render();
    updateKeyButtons();
    updateUndoButton();
    saveGame();
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

    let merged = board[targetR][targetC] == board[sendR][sendC];
    // 두 칸의 실제 좌표 차이를 옮기기 전에 재둔다. 삼각형 칸은 서로 겹쳐 놓여 있어서
    // 가로/세로 간격을 값으로 고정해두면 어긋난다.
    let sendTile = document.getElementById(sendR + "-" + sendC);
    let targetTile = document.getElementById(targetR + "-" + targetC);
    let dx = sendTile.offsetLeft - targetTile.offsetLeft;
    let dy = sendTile.offsetTop - targetTile.offsetTop;

    if (merged) { addScore(board[targetR][targetC] * 2); }
    board[targetR][targetC] = board[targetR][targetC] + board[sendR][sendC];
    board[sendR][sendC] = 0;

    renderTile(sendR, sendC);
    renderTile(targetR, targetC);
    playMoveAnim(targetTile, merged ? "tileSlideMerge" : "tileSlide", dx, dy);
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
    playAnim(renderTile(r, c), "tileSpawn");
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
function hideWinPopup() { hidePopup("gameWinPopup"); }
function closeWinPopup() {
    hideWinPopup();
    gameContinue = true;
    updateKeyButtons(); // 이어하기를 고른 지금이 다시 조작을 넘겨받는 시점이다
    saveGame();
}

function applyDarkMode() {
    if (darkMode) { document.body.classList.add("dark"); }
    else { document.body.classList.remove("dark"); }
}

// 스위치 모양은 설정값을 그대로 따라간다. 저장된 설정을 불러왔을 때
// 스위치만 꺼진 채로 남는 일이 없도록, 값을 바꾼 자리마다 이걸 부른다.
function syncToggles() {
    document.getElementById("hardToggle").classList.toggle("active", hardMode);
    document.getElementById("darkToggle").classList.toggle("active", darkMode);
    document.getElementById("soundToggle").classList.toggle("active", soundOn);
}

// 하드 모드는 나오는 타일 규칙이 바뀌므로 판을 새로 시작해야 한다.
function checkHardMode() {
    hardMode = !hardMode;
    setGame(); // setGame() 안에서 syncToggles() 와 saveGame() 이 이어진다
}

// 다크 모드는 색만 바뀐다. 어두운 색은 모두 .dark 아래에 정의돼 있어서
// body 의 클래스만 바꾸면 되고, 진행 중이던 판을 버릴 이유가 없다.
function checkDarkMode() {
    darkMode = !darkMode;
    applyDarkMode();
    syncToggles();
    saveGame();
}

function checkSound() {
    soundOn = !soundOn;
    syncToggles();
    saveGame();
}

function openRepositories() {
    window.open("https://github.com/RA0N-dev/3027", "_blank");
}

function openBluesky() {
    window.open("https://bsky.app/profile/husua.com", "_blank");
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

// 공유할 곳. 둘 다 글 내용을 text 로 받는 작성 화면을 열어준다.
const SHARE_TARGETS = {
    twitter: "https://twitter.com/intent/tweet?text=",
    bluesky: "https://bsky.app/intent/compose?text=",
};

function openShare(target, text) {
    let url = SHARE_TARGETS[target] || SHARE_TARGETS.twitter;
    window.open(url + encodeURIComponent(text), "_blank");
}

function sharing(target) {
    openShare(target, shareText("max tiles : " + maxTile()));
}

function sharingWin(target) {
    openShare(target, shareText("Made 3072 and won"));
}


/* ===== 입력 / 사운드 ===== */

function playSlideSound() {
    if (!soundOn) { return; }
    let sound = document.getElementById("slideSound");
    sound.pause();
    sound.currentTime = 0;
    // 소리가 아직 재생 중일 때 다음 입력이 오면 위의 pause()가 앞선 play()를 끊는다.
    // 그때 돌아오는 거절은 무시해도 되는 것이라 여기서 받아둔다.
    let played = sound.play();
    if (played) { played.catch(() => { }); }
}

function device_checking() {
    document.addEventListener("keyup", (e) => {
        // e.code 는 눌린 물리 키를 가리켜서 한글 입력 상태나 다른 자판 배열에서도
        // 어긋나지 않는다. e.keyCode 는 폐기된 속성이라 지원하지 않는 경우에만 쓴다.
        let key = e.code ? CODE_TO_KEY[e.code] : e.keyCode;
        if (key == UNDO_KEY) { undoMove(); return; }
        if (SLIDE_DIRECTIONS[key]) {
            silde(key);
        }
    });
}
