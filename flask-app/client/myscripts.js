// Alle variabelen:
const locationImageTheseus = "/documents/images/Thes2.png";
const locationImageMinotaurus = "/documents/images/Mino.png";
let jsonData = {};
let numberOfSteps = 0;
let numberOfLevels = 0;
let currentPositionMino = null;
let currentPositionThes = null;
let currentLevel = 1;

/* ------------------------------------------------------------------------------------------------------------------ */
// Alle fetch-functies:
// Alle data juist één keer fetchen, daarna overal gebruiken!:
function fetchData(random = false) {
    let string = !random ? "http://127.0.0.1:3000/level/" + currentLevel : "http://127.0.0.1:3000/random_level";

    fetch(string)
        .then(response => response.json())
        .then(data => {
            jsonData = data;
            currentLevel = data['level'];
            currentPositionMino = data['game']['minotaur'];
            currentPositionThes = data['game']['theseus'];
            numberOfSteps = 0;
            loadLevel();
        })
        .catch(() => {
            loadErrorScreen();
        });
}

function fetchAantalLevels() {
    fetch("http://127.0.0.1:3000/levels")
        .then(response => response.json())
        .then(data => {
            numberOfLevels = data["aantal_levels"];
        })
        .catch(() => {
            loadErrorScreen();
        });
}

function updateHighscore() {
    const data = {
        "highscore": numberOfSteps
    };

    fetch(`http://localhost:3000/highscore/${currentLevel}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .catch(() => {
            loadErrorScreen();
        });
}

/* ------------------------------------------------------------------------------------------------------------------ */
// Alle event-listeners:
// level 1 inladen telkens als er gerefresht wordt!
document.addEventListener('DOMContentLoaded', function () {
    fetchAantalLevels();
    fetchData();
});

const keyActions = {
    "ArrowLeft": () => move('L'),
    "ArrowRight": () => move('R'),
    "ArrowUp": () => move('U'),
    "ArrowDown": () => move('D'),
    ' ': () => move("S"),
    'r': () => restart(),
    'n': () => nextLevel(),
    'p': () => prevLevel()
}

const buttonActions = {
    "random": () => fetchData(true),
    "next": () => nextLevel(),
    "prev": () => prevLevel(),
    "restart": () => restart()
};

// Event luisteraars voor het indrukken van van de knoppen:
document.addEventListener('keydown', function (event) {
    const action = keyActions[event.key];
    if (action) {
        action();
    }
});

// Event luisteraars voor de buttons:
Object.keys(buttonActions).forEach((buttonId) => {
    const button = document.getElementById(buttonId);
    // Dit is om een bug op te lossen, die voorkwam bij het indrukken van een knop:
    // Wanneer er op een knop (bv Herstel) werd gedrukt, en daarna op spatie, werd deze knop (Herstel) opnieuw
    // opgeroepen:
    button.addEventListener("keydown", function (event) {
        if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
        }
    });

    button.addEventListener("click", function () {
        const action = buttonActions[buttonId];
        if (action) {
            action();
        }
    });
});


/* ------------------------------------------------------------------------------------------------------------------ */

// Alle visualisaties:
function loadLevel() {
    // De main container moet eerst leeggemaakt worden:
    document.querySelector(".main").innerHTML = "<div id=\"gridContainer\">\n" + "</div><p id='message'></p>";
    // Voor elke level moeten de volgende element opnieuw ingeladen worden:
    loadLevelLabel(jsonData["level"]);
    loadHighscoreLabel(jsonData["highscore"]);
    loadAantalStappenLabel(numberOfSteps);
    loadTiles(jsonData["game"]["tiles"], jsonData["game"]["exit"]);
    loadPiece(currentPositionThes, locationImageTheseus);
    loadPiece(currentPositionMino, locationImageMinotaurus);
    // Iedere keer dat de level wordt ingeladen, moeten deze buttons gecheckt worden;
    document.getElementById("next").disabled = currentLevel === numberOfLevels;
    document.getElementById("prev").disabled = currentLevel === 1;
}

function loadLevelLabel(levelnummer) {
    const levelLabel = document.getElementById("level");
    levelLabel.innerText = `Level ${levelnummer}`;
}

function loadHighscoreLabel(highscore) {
    const levelLabel = document.getElementById("highscore");
    levelLabel.innerText = `Beste score: ${highscore}`;
}

function loadAantalStappenLabel(number) {
    const levelLabel = document.getElementById("aantalStappen");
    levelLabel.innerText = `Aantal Stappen: ${number}`;
}

function findDimension(jsonTiles) {
    let numRows = 0;
    let numCols = 0;
    jsonTiles.forEach(obj => {
        if (obj.y > numRows) {
            numRows = obj.y;
        }
        if (obj.x > numCols) {
            numCols = obj.x;
        }
    });
    return {numRows, numCols};
}

function loadTiles(jsonTiles, exit) {
    // Dimensie van grid bepalen:
    let {numRows, numCols} = findDimension(jsonTiles);

    // Om de grid op te maken heb ik met de border css style gewerkt:
    // Ik heb gezien dat het makkelijker is om alle cellen eerst een volledige border te geven (zie css file),
    // en dan voor elke cel de border uit te zetten aan die kant uitzetten als dit false is:
    const gridTable = document.createElement('table');
    gridTable.className = 'grid-table';
    for (let row = 0; row <= numRows; row++) {
        const rowElement = document.createElement('tr');
        rowElement.className = 'grid-row';
        for (let col = 0; col <= numCols; col++) {
            const cellData = jsonTiles.find(obj => obj.x === col && obj.y === row);
            const cell = document.createElement('td');
            cell.className = 'grid-cell';
            // Deze if is nodig doordat de exit niet in de grid ligt. Dus als ik een grid heb van 2x2, en de exit ligt
            // in de positie [3,1] (en dus buiten de grid zogezegd), dan maak ik een 3x3 grid aan,
            // maar hierdoor zullen sommige cellen geen cell data hebben en die cellen krijgen dan helemaal geen border:
            if (cellData) {
                const sides = ['bottom', 'left', 'right', 'top'];
                sides.forEach(side => {
                    if (!cellData[side]) {
                        cell.style[`border${side.charAt(0).toUpperCase()}${side.slice(1)}`] = 'none';
                    }
                });
                // De exit krijgt een speciale opmaak
                if (cellData.x === exit.x && cellData.y === exit.y) {
                    cell.textContent = 'EXIT';
                    cell.style.color = 'gray';
                }
            } else {
                cell.style.border = 'none';
            }
            rowElement.appendChild(cell);
        }
        gridTable.appendChild(rowElement);
    }
    const gridContainer = document.getElementById('gridContainer');
    gridContainer.innerHTML = ''; // Vorige grid eerst verwijderen!!!
    gridContainer.appendChild(gridTable);
}

// Om een "stuk" (= Theseus en Minotaurus) in te laden op de positie die is gegeven:
function loadPiece(position, imageSrc) {
    const gridTable = document.querySelector('.grid-table');
    const cell = gridTable.rows[position.y].cells[position.x];
    const image = document.createElement('img');
    image.src = imageSrc;

    image.style.width = '90%';
    image.style.height = '90%';

    cell.innerHTML = '';
    cell.appendChild(image);
}

function removePiece(position) {
    const gridTable = document.querySelector('.grid-table');
    const cell = gridTable.rows[position.y].cells[position.x];
    cell.innerHTML = '';
}

function loadEndScreen() {
    let messageDiv = document.getElementById("message");
    messageDiv.innerHTML = '<p id="message"></p>';
    let color = hasWon() ? "green" : "red";
    let message;
    if (hasWon()) {
        message = "Goed gedaan, je hebt gewonnen!"
    } else {
        message = "De Minotaurus heeft je kunnen pakken, probeer opnieuw!";
    }
    messageDiv.innerHTML += `<p style="color: ${color};">${message}</p>`;
}

function loadErrorScreen() {
    document.querySelector(".main").innerHTML = "<p style=\"color: red;\">Er is iets misgegaan bij het " +
        "laden van het level.</p>";
}

/* ------------------------------------------------------------------------------------------------------------------ */

function restart() {
    fetchData();
}

function nextLevel() {
    if (currentLevel + 1 <= numberOfLevels) {
        currentLevel++;
        fetchData();
    } else if (hasWon()) {
        loadEndScreen();
    }
}

function prevLevel() {
    if (currentLevel - 1 > 0) currentLevel--;
    fetchData();
}

/* ------------------------------------------------------------------------------------------------------------------ */
// Logica van het spel:

// Geeft terug of positie geldig is wanneer we bewegen in richting "direction"
function isValid(position, direction) {
    // Nieuwe positie (als we in de opgegeven direction gaan):
    const newPosition = getNewPosition(position, direction);

    // Huidige cel in de gemaakt grid:
    const currentCell = getCellData(position.x, position.y);
    const newCell = getCellData(newPosition.x, newPosition.y);

    const walls = {
        U: 'top',
        D: 'bottom',
        L: 'left',
        R: 'right'
    };

    const oppositeWall = {
        top: 'bottom',
        bottom: 'top',
        left: 'right',
        right: 'left'
    };
    // check als er in de huidige cel een muur is in de richting dat we willen bewegen,
    // OF er bestaat een muur in de nieuwe cel aan de zijde van huidige cell;
    const wallExists = currentCell[walls[direction]] || newCell[oppositeWall[walls[direction]]];
    return !wallExists;
}

// Geeft de juiste cell met zijn data uit de json terug:
function getCellData(x, y) {
    return jsonData["game"]["tiles"].find(cellData => cellData.x === x && cellData.y === y);
}

// Geeft terug of Theseus nog leeft:
function isDead() {
    return currentPositionMino.x === currentPositionThes.x && currentPositionMino.y === currentPositionThes.y;
}

// Geeft terug of Theseus is gewonnen:
function hasWon() {
    return currentPositionThes.x === jsonData["game"]["exit"].x && currentPositionThes.y === jsonData["game"]["exit"].y;
}

// Verplaats de Theseus en Minotaurus:
function move(direction) {
    if (isValid(currentPositionThes, direction) && !isDead() && !hasWon()) {
        moveTheseus(direction);
        if (hasWon()) {
            updateHighscore();
            nextLevel();
        } else {
            // Voor elke stap dat Theseus zet, mag de Minotaurus 2 zetten.
            moveMinotaurus();
            moveMinotaurus();
            // Als na het verplaatsen van de Minotaurus de Theseus dood is, dan:
            if (isDead()) {
                // Als Thes en Mino naast elkaar stonden, en Theseus bewoog naar Mino, kwam Theseus op Mino terecht,
                // en verdween Mino. Deze check vermijdt dat dit gebeurt.
                loadPiece(currentPositionMino, locationImageMinotaurus);
                loadEndScreen();
            }
        }
    }
}

// Verplaatst de Minotaurus op de juiste manier:
function moveMinotaurus() {
    // Beste mogelijke richting dat Minotaurus kan bewegen:
    const bestDirection = findBestDirection(currentPositionMino, currentPositionThes);

    // beweeg Minotaurus enkel wanneer beste positie niet "blijven staan" is.
    if (bestDirection !== 'S') {
        const newPosition = getNewPosition(currentPositionMino, bestDirection);

        removePiece(currentPositionMino);
        currentPositionMino = newPosition;
        loadPiece(currentPositionMino, "/documents/images/Mino.png");
    }
}

// Verplaatst de Theseus op de juiste manier:
function moveTheseus(direction) {
    const newPosition = getNewPosition(currentPositionThes, direction);

    if (isValid(currentPositionThes, direction)) {
        removePiece(currentPositionThes);
        currentPositionThes = newPosition;
        loadPiece(currentPositionThes, "/documents/images/Thes2.png");
        numberOfSteps++;
        loadAantalStappenLabel(numberOfSteps);
    }
}

// Berekent de Manhattan afstand tussen positie 1 en positie 2:
function calculateManhattanDistance(position1, position2) {
    return Math.abs(position1.x - position2.x) + Math.abs(position1.y - position2.y);
}

// Geeft de nieuwe positie terug als we ons in de opgegeven "direction" verplaatsen:
function getNewPosition(position, direction) {
    let richtingen = {'U': [-1, 0], 'D': [1, 0], 'L': [0, -1], 'R': [0, 1], 'S': [0, 0]}; // Up, Down, Left, Right, "Spatie"
    return {
        x: position.x + richtingen[direction][1],
        y: position.y + richtingen[direction][0]
    };
}

// Geeft de beste richting om te bewegen als Minotaurus terug:
function findBestDirection(fromPosition, toPosition) {
    const directions = ['L', 'R', 'U', 'D'];
    let minDistance = calculateManhattanDistance(fromPosition, toPosition);
    let bestDirection = 'S';

    // Kijken of er een betere (geldige) manier is om te verplaatsen naar de Theseus, anders gewoon blijven staan:
    for (const direction of directions) {
        const newPosition = getNewPosition(fromPosition, direction);

        if (isValid(fromPosition, direction)) {
            const newDistance = calculateManhattanDistance(newPosition, toPosition);
            if (newDistance < minDistance) {
                minDistance = newDistance;
                bestDirection = direction;
            }
        }
    }
    return bestDirection;
}
