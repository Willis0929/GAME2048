document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const size = 4;
    let board = [];
    let currentScore = 0;
    const currentScoreElem = document.getElementById('current-score');

    // 取得最高分，如果沒有找到則將其設為 0
    let highScore = localStorage.getItem('2048-highScore') || 0;
    const highScoreElem = document.getElementById('high-score');
    highScoreElem.textContent = highScore;

    const gameOverElem = document.getElementById('game-over');

    // 更新分數
    function updateScore(value) {
        currentScore += value;
        currentScoreElem.textContent = currentScore;
        if (currentScore > highScore) {
            highScore = currentScore;
            highScoreElem.textContent = highScore;
            localStorage.setItem('2048-highScore', highScore);
        }
    }

    // 重新啟動遊戲
    function restartGame() {
        currentScore = 0;
        currentScoreElem.textContent = '0';
        gameOverElem.style.display = 'none';
        initializeGame();
    }

    // 初始化遊戲
    function initializeGame() {
        board = [...Array(size)].map(e => Array(size).fill(0));
        placeRandom();
        placeRandom();
        renderBoard();
    }

    // UI介面
    function renderBoard() {
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                const prevValue = cell.dataset.value;
                const currentValue = board[i][j];
                if (currentValue !== 0) {
                    cell.dataset.value = currentValue;
                    cell.textContent = currentValue;
                    // 動畫處理
                    if (currentValue !== parseInt(prevValue) && !cell.classList.contains('new-tile')) {
                        cell.classList.add('merged-tile');
                    }
                } else {
                    cell.textContent = '';
                    delete cell.dataset.value;
                    cell.classList.remove('merged-tile', 'new-tile');
                }
            }
        }

        // 清理動畫
        setTimeout(() => {
            const cells = document.querySelectorAll('.grid-cell');
            cells.forEach(cell => {
                cell.classList.remove('merged-tile', 'new-tile');
            });
        }, 300);
    }

    // 隨機圖塊
    function placeRandom() {
        const available = [];
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (board[i][j] === 0) {
                    available.push({ x: i, y: j });
                }
            }
        }

        if (available.length > 0) {
            const randomCell = available[Math.floor(Math.random() * available.length)];
            board[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
            const cell = document.querySelector(`[data-row="${randomCell.x}"][data-col="${randomCell.y}"]`);
            cell.classList.add('new-tile'); // 新圖塊的動畫
        }
    }

    // 頭鍵輸入移動圖塊
    function move(direction) {
        let hasChanged = false;
        if (direction === 'ArrowUp' || direction === 'ArrowDown') {
            for (let j = 0; j < size; j++) {
                const column = [...Array(size)].map((_, i) => board[i][j]);
                const newColumn = transform(column, direction === 'ArrowUp');
                for (let i = 0; i < size; i++) {
                    if (board[i][j] !== newColumn[i]) {
                        hasChanged = true;
                        board[i][j] = newColumn[i];
                    }
                }
            }
        } else if (direction === 'ArrowLeft' || direction === 'ArrowRight') {
            for (let i = 0; i < size; i++) {
                const row = board[i];
                const newRow = transform(row, direction === 'ArrowLeft');
                if (row.join(',') !== newRow.join(',')) {
                    hasChanged = true;
                    board[i] = newRow;
                }
            }
        }
        if (hasChanged) {
            placeRandom();
            renderBoard();
            checkGameOver();
        }
    }

    // 變換行跟列
    function transform(line, moveTowardsStart) {
        let newLine = line.filter(cell => cell !== 0);
        if (!moveTowardsStart) {
            newLine.reverse();
        }
        for (let i = 0; i < newLine.length - 1; i++) {
            if (newLine[i] === newLine[i + 1]) {
                newLine[i] *= 2;
                updateScore(newLine[i]); // 更新分數
                newLine.splice(i + 1, 1);
            }
        }
        while (newLine.length < size) {
            newLine.push(0);
        }
        if (!moveTowardsStart) {
            newLine.reverse();
        }
        return newLine;
    }

    // 檢查遊戲是否結束
    function checkGameOver() {
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (board[i][j] === 0) {
                    return; // 遊戲未結束
                }
                if (j < size - 1 && board[i][j] === board[i][j + 1]) {
                    return; // 平行可移動
                }
                if (i < size - 1 && board[i][j] === board[i + 1][j]) {
                    return; // 垂直可移動
                }
            }
        }

        // 無法移動
        gameOverElem.style.display = 'flex';
    }

    // 監視器
    document.addEventListener('keydown', event => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            move(event.key);
        }
    });
    document.getElementById('restart-btn').addEventListener('click', restartGame);

    initializeGame();

});