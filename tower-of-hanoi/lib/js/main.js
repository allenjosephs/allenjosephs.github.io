const youWin = "Congrats on the big win!";

const gameBoard = document.querySelector(".game-board");
const gameBoardContents = document.querySelector(".game-board-contents");

const tower1 = document.querySelector("#tower1");
const tower2 = document.querySelector("#tower2");
const tower3 = document.querySelector("#tower3");

const resetBtn = document.querySelector("#reset-button");
const solveMeBtn = document.querySelector("#solve-me-button");
const difficultySelect = document.querySelector("#difficulty");

const rulesBtn = document.querySelector("#rules-button");

const rulesModal = document.querySelector("#rules-modal");
const rulesModalContent = document.querySelector("#rules-modal-content");
const rulesModalTitle = document.querySelector("#rules-modal-title");
const rulesModalMsg = document.querySelector("#rules-modal-msg");
const rulesModalFooter = document.querySelector("#rules-modal-footer");
const rulesClose = document.querySelector("#close-rules");

const winModal = document.querySelector("#win-modal");
const closeWin = document.querySelector("#close-win");

const minMoveCount = document.querySelector("#min");
const mCount = document.querySelector("#count");
// const solveTime = document.querySelector("#time");

let moveCount = 0;
let minMoves = 0;
let timeToSolve = 0;

// This will hold the object being dragged (a block).  In many cases drag
// events do not have access to the object being dragged; this is my workaround.
let draggedBlock;

class Block {
  constructor(id) {
    this.id = id
  }
}

class Tower {
  constructor(id, blocks = []) {
    this.id = id;
    // Sort the blocks array in ascending order by level
    if (blocks.length > 0) {
      blocks.sort((a, b) => {
        return a.level - b.level;
      });
    }
    this.blocks = blocks;
  }

  hasBlock(blockId) {
    this.blocks.forEach(b => {
      if (b.getId() === blockId) {
        return true;
      } else {
        return false;
      }
    });
  }

}

let t1;
let t2;
let t3;

initGame();

function initGame() {

  tower1.innerHTML = "";
  tower2.innerHTML = "";
  tower3.innerHTML = "";

  // This will enable the difficulty selector if the user
  // reset the game in the middle of playing
  if (difficultySelect.classList.contains("disabled")) {
    difficultySelect.classList.remove("disabled");
    difficultySelect.removeAttribute("disabled");
    difficultySelect.value = 0;
    resetBtn.innerText = "Start Game";
    moveCount = 0;
    mCount.innerText = moveCount;
    minMoveCount.innerText = 0;
    // solveTime.innerText = 0;
  }

  if (!(difficultySelect.value === "0")) {
    let blockArray = [];
    blockArray.push(new Block(1));
    blockArray.push(new Block(2));
    for (let i = 3; i <= parseInt(difficultySelect.value); i++){
      blockArray.push(new Block(i));
    }

    t1 = new Tower(tower1.getAttribute("id"), blockArray);
    t2 = new Tower(tower2.getAttribute("id"));
    t3 = new Tower(tower3.getAttribute("id"));

    minMoveCount.innerText = calcMinMoves(t1.blocks.length);
    // solveTime.innerText = calcTimeToSolve(t1.blocks.length);
    moveCount = 0;
    mCount.innerText = moveCount;
    resetBtn.innerText = "Reset Game";
    difficultySelect.setAttribute("disabled", true);
    difficultySelect.classList.add("disabled");

    let newBlock;
    for (let i = 0; i < t1.blocks.length; i++) {
      newBlock = document.createElement("div");
      newBlock.setAttribute("id", t1.blocks[i].id);
      newBlock.classList.add("block");
      newBlock.classList.add(`level${t1.blocks[i].id}`);
      tower1.appendChild(newBlock);
      tower1.firstChild.setAttribute("draggable", true);
      tower1.firstChild.classList.add("draggable");
      tower1.firstChild.addEventListener("dragstart", drag);
    }
  }
}

///////////////// START DRAG-AND-DROP FUNCTIONS /////////////

gameBoardContents.addEventListener("drop", e => {

  // data[0] = id of the div, data[1] = id of the tower this div is moving from
  let data = e.dataTransfer.getData("text").split("_");
  let divId = data[0];
  let fromTowerId = data[1];
  let toTowerId = e.target.id;

  e.target.classList.remove("valid-drop-zone");
  e.target.classList.remove("invalid-drop-zone");

  if (e.target.classList.contains("drop-zone") &&
        dropAllowed(divId, getTowerById(toTowerId))) {
    e.preventDefault();
    e.target.insertBefore(document.getElementById(divId), e.target.firstChild);
    moveBlock(getTowerById(fromTowerId), getTowerById(toTowerId));
    setDraggable();
    if (!(fromTowerId === toTowerId)) {
      updateMoveCount();
    }
    e.dataTransfer.clearData();
    if (checkForWin()) {
      showModal(winModal);
    };
  }
});

gameBoardContents.addEventListener("dragend", e => {
  e.target.classList.remove("dragging");
});

gameBoardContents.addEventListener("dragenter", e=> {
  // data[0] = id of the div, data[1] = id of the tower this div is moving from
  let data = e.dataTransfer.getData("text").split("_");
  let divId = data[0];
  let toTowerId = e.target.id;

  if (e.target.classList.contains("drop-zone")) {
    if (dropAllowed(parseInt(draggedBlock.id), getTowerById(toTowerId))) {      e.target.classList.add("valid-drop-zone");
    } else {
      e.target.classList.add("invalid-drop-zone");
    }
  }
});

gameBoardContents.addEventListener("dragleave", e => {
  if (e.target.classList.contains("drop-zone")) {
    e.target.classList.remove("valid-drop-zone");
    e.target.classList.remove("invalid-drop-zone");
  }
});

gameBoardContents.addEventListener("dragover", e => {
  e.preventDefault();
});

function drag(e) {
  //set the data to the div's ID + current tower location (e.path[1].id) for future use

  //certain drag events do not have access to the object being dragged.
  //thus, storing the dragged object into a global variable
  draggedBlock = document.getElementById(e.target.id);
  e.dataTransfer.setData("text", `${e.target.id}_${e.path[1].id}`);
  e.target.classList.add("dragging");
}

///////////////// END DRAG-AND-DROP FUNCTIONS /////////////

function dropAllowed(divId, toTower) {
  let dropAllowed = false;

  //console.log("divId: ", divId, " fromTower: ", fromTowerId, " toTower: ", toTowerId);
  if (toTower.blocks === undefined || toTower.blocks.length === 0) {
    //No blocks in this tower: ok to drop!
    dropAllowed = true;
  } else if (divId <= toTower.blocks[0].id) {
    // Div being moved is of lower or equal rank than the top block in this tower:
    // ok to drop!
    // Note that the only time the ids are equal is when the user starts a drag
    // event but then releases the block back onto the same tower from which the
    // block came.
    dropAllowed = true;
  } else {
    //Nope!
    dropAllowed = false;
  }
  return dropAllowed;
}

function calcTimeToSolve(blockCount) {
  return Math.ceil(calcMinMoves(blockCount) * 3 / 60);
}

function calcMinMoves(blockCount) {
  return (2 ** blockCount - 1);
}

function moveBlock(fromTower, toTower) {
  //removes a block from current tower and adds to the top of targetTower
  let removedBlock = removeBlock(fromTower);
  addBlock(removedBlock, toTower);
}

function removeBlock(fromTower) {
  return fromTower.blocks.shift();
}

function addBlock(block, toTower) {
  toTower.blocks.unshift(block);
}

function setDraggable() {
  //Iterate through each tower and set draggable to the top element of each
  gameBoardContents.childNodes.forEach(t => {
    t.childNodes.forEach(node => {
      removeDraggable(node);
    });
    if (t.childElementCount > 0) {
      addDraggable(t);
    }
  });
}

function removeDraggable(node) {
  node.setAttribute("draggable", false);
  node.classList.remove("draggable");
  node.removeEventListener("dragstart", drag);
}

function addDraggable(tower) {
  tower.firstChild.setAttribute("draggable", true);
  tower.firstChild.classList.add("draggable");
  tower.firstChild.addEventListener("dragstart", drag);
}

function updateMoveCount() {
  moveCount++;
  mCount.innerText = moveCount;
}

function getTowerById(id) {
  let tower;
  switch (id) {
    case "tower1":
      tower = t1;
      break;
    case "tower2":
      tower = t2;
      break;
    case "tower3":
      tower = t3;
      break;
  }
  return tower;
}

function checkForWin() {
  if ((tower1.childElementCount === 0) && (tower2.childElementCount === 0)) {
    return true;
  } else {
    return false;
  }

}

resetBtn.addEventListener("click", e => {
  e.preventDefault();
  initGame();
});

///// MODAL FUNCTIONS /////////////////////////////////////////////////

rulesBtn.addEventListener("click", e => {
  e.preventDefault();
  showModal(rulesModal);
});

rulesClose.addEventListener("click", e => {
  e.preventDefault();
  hideModal(rulesModal);
});

closeWin.addEventListener("click", e => {
  e.preventDefault();
  hideModal(winModal);
});

function showModal(modal) {
  modal.classList.add("modal-show");
}

function hideModal(modal) {
  modal.classList.remove("modal-show");
}




