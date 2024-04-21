let gameStatus = true;
let rows, cols, MineCount;//initialised rows,columns and minecount for different levels
let cellsClicked = 0;
let flags = 0;
let timerInterval;
let highscores = {
    easy: [],
    medium: [],
    hard: []
};
function nameSetter() {//stores the username
    let name = prompt("enter your name:");
    return name;
}
function setDifficulty(level) {//to set the difficulty level and define the structure of the grid
    switch (level) {
        case 'easy':
            stopTimer();
            clearInterval(timerInterval);
            rows = 10;
            cols = 10;
            MineCount = 15;
            document.getElementById('grid-container').style.height = 380 + "px";
            document.getElementById('grid-container').style.width = 342 + "px";
            break;
        case 'medium':
            stopTimer();
            clearInterval(timerInterval);
            rows = 20;
            cols = 20;
            MineCount = 55;
            document.getElementById('grid-container').style.height = 705 + "px";
            document.getElementById('grid-container').style.width = 676 + "px";
            break;
        case 'hard':
            stopTimer();
            clearInterval(timerInterval);
            rows = 30;
            cols = 30;
            MineCount = 99;
            document.getElementById('grid-container').style.height = 1027 + "px";
            document.getElementById('grid-container').style.width = 1000 + "px";
            break;
        default:
            stopTimer();
            clearInterval(timerInterval);
            rows = 10;
            cols = 10;
            MineCount = 15;
            break;
    }
    totalCells = rows * cols;
    restart();
}
let totalCells = rows * cols;
function createGrid() {//creates grid
    let grid = document.getElementById('grid');
    let image = document.getElementById('image');
    image.style.backgroundImage = "url('smiley.png')";
    image.style.backgroundSize = "cover";
    for (let i = 0; i < rows; i++) {
        let row = document.createElement('div');
        row.classList.add('row');
        for (let j = 0; j < cols; j++) {
            let cell = document.createElement('div');
            cell.classList.add('cell', `cell-${i}-${j}`, 'hidden');

            cell.addEventListener('click', function (event) {//on click it calls the checkmine function which reveals the mines adjacent to the clicked cell
                changeCellColor(event);
                CheckMine(event);
            });
            row.appendChild(cell);
        }
        grid.appendChild(row);
    }
}
function PlaceMines() {
    let cells = document.querySelectorAll('.cell');
    let minesPlaced = 0;
    while (minesPlaced < MineCount) {
        let index = Math.floor(Math.random() * cells.length);//to place mines randomly
        if (!cells[index].classList.contains('mine')) {
            cells[index].classList.add('mine');
            minesPlaced++;
        }
    }
    console.log("mines placed:", minesPlaced);
}
function restart() {//to restart the game using the smiley image
    stopTimer();
    clearInterval(timerInterval);
    let grid = document.getElementById('grid');
    grid.innerHTML = '';
    gameStatus = true;
    flags = 0;
    cellsClicked = 0;
    remainingFlags = MineCount;
    createGrid();
    PlaceMines();
    displayMenu();
    let cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.addEventListener('contextmenu', function (event) {
            event.preventDefault();
            handleRightClick(event);
            flags++;
        });
    });
    cells.forEach(cell => {
        cell.addEventListener('click', function (event) {
            changeCellColor(event);
            CheckMine(event);
        });
    });
}
function changeCellColor(event) {//to change the color of the clicked or revealed cell
    if (!gameStatus) return;
    let clickedCell = event.target;
    clickedCell.style.backgroundColor = "#c0c0c0";
}
function CheckMine(event) {
    if (!gameStatus) return;
    document.addEventListener('mousedown', function () {//changes the smiley image to surprised
        let image = document.getElementById('image');
        image.style.backgroundImage = "url('click.png')";
        image.style.backgroundSize = "cover";
    });

    document.addEventListener('mouseup', function () {//changes the surprised image back to smiley
        let image = document.getElementById('image');
        image.style.backgroundImage = "url('smiley.png')";
        image.style.backgroundSize = "cover";
    });

    let clickedCell = event.target;// get the cell that was clicked
    let classes = clickedCell.classList;
    if (classes.length > 1) {
        let className = classes[1];
        let position = className.split('-');
        let i = parseInt(position[1]);
        let j = parseInt(position[2]);

        let cell = document.querySelector(`.${className}`);
        if (cell.classList.contains('flagged')) {
            return;
        }
        if (cell.classList.contains('mine')) {
            gameOver();
        } else {
            let mineCount = countAdjacentMines(i, j);
            if (!cell.classList.contains('revealed')) {
                cell.classList.add('revealed');
                cell.innerText = mineCount;
                if (mineCount === 0) {//to recursively open cells that have zero adjacent mines
                    revealAdjacentMines(i, j);
                }

            }
            cellsClicked++;
            if (checkWin()) {//checks for win everytime
                Win();
                gameStatus = false;
            }
        }

    }
}
function revealAdjacentMines(row, col) {//to recursively open cells that have zero adjacent mines
    for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
            if (r === row && c === col) continue;
            if (r >= 0 && r < rows && c >= 0 && c < cols) {
                let cell = document.querySelector(`.cell-${r}-${c}`);
                if (!cell.classList.contains('revealed') && !cell.classList.contains('flagged')) {
                    let mineCount = countAdjacentMines(r, c);
                    if (mineCount === 0) {
                        cell.classList.add('revealed');
                        cell.innerText = '';
                        revealAdjacentMines(r, c);
                    } else {
                        cell.classList.add('revealed');
                        cell.innerText = mineCount;
                    }
                    cell.style.backgroundColor = "#c0c0c0";
                }
            }
        }
    }
}

let remainingFlags = MineCount;

function handleRightClick(event) {//to flag cells
    event.preventDefault();//prevents opening context menu
    let clickedCell = event.target;
    if (!gameStatus) {
        return;
    }
    if (clickedCell.classList.contains('revealed')) {
        return;
    }
    if (remainingFlags > 0) {
        if (!clickedCell.classList.contains('flagged')) {
            clickedCell.style.backgroundImage = "url('flag.png')";
            clickedCell.style.backgroundSize = "cover";
            clickedCell.classList.add('flagged');
            updateMineCounter(-1);
            remainingFlags--;
        } else {
            clickedCell.style.backgroundImage = "";
            clickedCell.classList.remove('flagged');
            clickedCell.style.backgroundColor = "grey";
            updateMineCounter(1);
            remainingFlags++;
        }
    }
}
function updateMineCounter(change) {
    let minecounter = document.getElementById('minecounter');
    let currentCount = parseInt(minecounter.innerText);
    minecounter.innerText = currentCount + change;
}

function checkWin() {
    let revealedCells = document.querySelectorAll('.revealed');
    if (revealedCells.length === totalCells - MineCount) {
        // check if all revealed cells are not mines
        for (let cell of revealedCells) {
            if (cell.classList.contains('mine')) {
                return false; // if any revealed cell is a mine, game is not won
            }
        }
        return true; // all revealed cells are not mines, game is won
    }
    return false; // not all cells are revealed yet
}

function Win() {
    console.log("you won!");
    let timerValue = document.getElementById('secondscounter').innerText;
    stopTimer();
    let image = document.getElementById('image');
    image.style.backgroundImage = "url('win.png')";
    image.style.backgroundSize = "cover";
    alert(`you just beat minesweeper in ${timerValue} seconds!`);
    let difficultyLevel;
    if (rows === 10 && cols === 10 && MineCount === 15) {
        difficultyLevel = 'easy';
    } else if (rows === 20 && cols === 20 && MineCount === 55) {
        difficultyLevel = 'medium';
    } else if (rows === 30 && cols === 30 && MineCount === 99) {
        difficultyLevel = 'hard';
    } else {
        difficultyLevel = 'easy';
    }
    let userName = nameSetter();
    if (userName === null || userName.trim() === "") {
        userName = "Anonymous";
    }

    let score = {
        user: userName,
        time: timerValue
    };
    highscores[difficultyLevel].push(score);

    // Update the high score table
    highScore(difficultyLevel);

}
function gameOver() {
    gameStatus = false;
    stopTimer();
    let flaggedCells=document.querySelectorAll('.flagged');
    let mineCells = document.querySelectorAll('.mine');
    let image = document.getElementById('image');
    image.style.backgroundImage = "url('lose.png')";
    image.style.backgroundSize = "cover";
    mineCells.forEach(cell => {
        cell.style.backgroundColor = "red";
    })
    for (let i = 0; i < flaggedCells.length; i++) {
        let cell = flaggedCells[i];
        if (!cell.classList.contains('mine')) {
            cell.style.color = "red";
            cell.innerHTML="X";
        }
    }
}

function countAdjacentMines(row, col) {
    let mineCount = 0;
    for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
            if (r === row && c === col) continue;
            if (r >= 0 && r < rows && c >= 0 && c < cols) {
                let cell = document.querySelector(`.cell-${r}-${c}`);
                if (cell.classList.contains('mine')) {
                    mineCount++;
                }
            }
        }
    }
    return mineCount;
}

function displayMenu() {
    let mineCounter = document.getElementById('minecounter');
    mineCounter.innerText = MineCount;
    let secondscounter = document.getElementById('secondscounter');
    clearInterval(timerInterval);
    let time = 0;
    timerInterval = setInterval(() => {
        secondscounter.innerText = time;
        time++;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}
//highscore checker
function highScore(difficulty) {
    let highscoreTable = document.getElementById(difficulty);
    let scores = highscores[difficulty];

    for (let i = 0; i < scores.length; i++) {
        let score = scores[i];
        let row = `<tr>
                        <td>${i + 1}</td>
                        <td>${score.user}</td>
                        <td>${score.time}</td>
                    </tr>`;
        highscoreTable.innerHTML += row;
    }
}
// how to play modal
// get the modal and the button to open it
let modal = document.getElementById("howToPlayModal");
let btn = document.getElementById("howToPlayBtn");

// get the <span> element that closes the modal
let span = document.getElementsByClassName("close")[0];
btn.addEventListener("click", function() {
    modal.style.display = "block";
});

// close effect 
span.addEventListener("click", function() {
    modal.style.display = "none";
});

// close outside modal
window.addEventListener("click", function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
});

addEventListener('DOMContentLoaded', function () {
    setDifficulty('easy');
    displayMenu();
    var darkMode = document.getElementById('DarkMode');

    darkMode.addEventListener('change', function () {
        document.body.classList.toggle('dark-mode', darkMode.checked);//darkmode
    });
});