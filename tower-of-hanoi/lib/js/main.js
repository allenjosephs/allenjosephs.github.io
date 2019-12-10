const gameBoard = document.querySelector(".game-board");
const gameBoardContents = document.querySelector(".game-board-contents");

const tower1 = document.querySelector("#tower1");
const tower2 = document.querySelector("#tower2");
const tower3 = document.querySelector("#tower3");

const resetBtn = document.querySelector("#reset-button");
const solveMeBtn = document.querySelector("#solve-me-button");
const rulesBtn = document.querySelector("#rules-button");

const modal = document.querySelector("#modal");
const modalContent = document.querySelector("#modal-content");
const modalTitle = document.querySelector("#modal-title");
const modalMsg = document.querySelector("#modal-msg");
const modalFooter = document.querySelector("#modal-footer");

const rulesClose = document.querySelector("#close-rules");

const minMoveCount = document.querySelector("#min-moves");
const mCount = document.querySelector("#move-count");
const solveTime = document.querySelector("#time-to-solve");


let moveCount = 0;
let minMoves = 0;
let timeToSolve = 0;

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

  addBlock(block) {
    if (!this.blocks || (block.id < this.blocks[0].id)){
      this.blocks.push(block);
      return true;
    } else {
      return false;
    }
  }

  removeBlock() {
    console.log("in remove block");
    this.blocks.pop();
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

  t1 = new Tower(tower1.getAttribute("id"),
  [new Block(1),
      new Block(2),
      new Block(3)
      // new Block(4),
      // new Block(5),
      // new Block(6),
      // new Block(7),
      // new Block(8),
      // new Block(9),
      // new Block(10)
    ]);

    minMoves = 2 ** t1.blocks.length - 1;
    timeToSolve = Math.ceil(minMoves / 60);

    solveTime.innerText = "Time @ 1/sec: " + timeToSolve + " minutes";
    minMoveCount.innerText = "Min moves: " + minMoves;
    mCount.innerText = "Move count: " + moveCount;


    console.log("t1: ", t1);

  t2 = new Tower(tower2.getAttribute("id"));
  t3 = new Tower(tower3.getAttribute("id"));

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

///////////////// START DRAG-AND-DROP FUNCTIONS /////////////

gameBoardContents.addEventListener("drop", e => {

  console.log("drop: ", e)

  // data[0] = id of the div, data[1] = id of the tower this div is moving from
  let data = e.dataTransfer.getData("text").split("_");
  let divId = data[0];
  let fromTowerId = data[1];
  let toTowerId = e.target.id;

  if (e.target.classList.contains("tower") && dropAllowed(divId, fromTowerId, toTowerId)) {
    e.preventDefault();
    e.target.insertBefore(document.getElementById(divId), e.target.firstChild);
    moveBlock(parseInt(divId), fromTowerId, toTowerId);
    resetDraggable();
    e.dataTransfer.clearData();
    moveCount++;
  }
});

gameBoardContents.addEventListener("dragover", e => {
  e.preventDefault();
});

function drag(e) {

  console.log("drag e.target.id: ", e.target.id);
  console.log(e);
  //set the data to the div's ID + current tower location (e.path[1].id) for future use
  e.dataTransfer.setData("text", `${e.target.id}_${e.path[1].id}`);
  console.log(e.dataTransfer.getData("text"));
}

///////////////// END DRAG-AND-DROP FUNCTIONS /////////////

function dropAllowed(divId, fromTowerId, toTowerId) {
  let dropAllowed = false;
  let tower;

  //Determine which target tower we're working with
  switch (toTowerId) {
    case t1.id:
      tower = t1;
      break;
    case t2.id:
      tower = t2;
      break;
    case t3.id:
      tower = t3;
      break;
  }

  console.log("divId: ", divId, " fromTower: ", fromTowerId, " toTower: ", toTowerId);

  if (tower.blocks === undefined || tower.blocks.length === 0) {
    //No blocks in this tower: ok to drop!
    dropAllowed = true;
  } else if (divId < tower.blocks[0].id) {
    //Div being moved is of lower rank than the top block in this tower: ok to drop!
    dropAllowed = true;
  } else {
    //Nope!
    dropAllowed = false;
  }
  return dropAllowed;
}

function moveBlock(blockId, fromTowerId, toTowerId) {
  //removes a block from current tower and adds to the top of targetTower
  let removedBlock = removeBlock(fromTowerId);
  addBlock(removedBlock, toTowerId);
}

function removeBlock(fromTowerId) {
  //cycle through each tower and remove this block from whichever one it resides in
  let removedBlock;
  switch (fromTowerId) {
    case "tower1":
     console.log("tower1 remove");
     removedBlock = t1.blocks.shift();
     console.log(t1);
     break;
    case "tower2":
      console.log("tower2 remove");
      removedBlock = t2.blocks.shift();
      console.log(t2);
      break;
    case "tower3":
      console.log("tower3 remove");
      removedBlock = t3.blocks.shift();
      console.log(t3);
      break;
  }
  return removedBlock;
}

function addBlock(block, toTower) {
  switch (toTower) {
    case "tower1":
      console.log("tower1 add");
      t1.blocks.unshift(block);
      console.log(t1);
      break;
    case "tower2":
      console.log("tower2 add");
      t2.blocks.unshift(block);
      console.log(t2);
      break;
    case "tower3":
      console.log("tower3 add");
      t3.blocks.unshift(block);
      console.log(t3);
      break;
  }
}

function resetDraggable() {
  //Iterate through each tower and set draggable to the top element of each
  tower1.childNodes.forEach(node => {
    node.setAttribute("draggable", false);
    node.classList.remove("draggable");
    node.removeEventListener("dragstart", drag);
  });

  if (tower1.childElementCount > 0) {
    tower1.firstChild.setAttribute("draggable", true);
    tower1.firstChild.classList.add("draggable");
    tower1.firstChild.addEventListener("dragstart", drag);
  }

  tower2.childNodes.forEach(node => {
    node.setAttribute("draggable", false);
    node.classList.remove("draggable");
    node.removeEventListener("dragstart", drag);
  });
  if (tower2.childElementCount > 0) {
    tower2.firstChild.setAttribute("draggable", true);
    tower2.firstChild.classList.add("draggable");
    tower2.firstChild.addEventListener("dragstart", drag);
  }

  tower3.childNodes.forEach(node => {
    node.setAttribute("draggable", false);
    node.classList.remove("draggable");
    node.removeEventListener("dragstart", drag);
  });

  if (tower3.childElementCount > 0) {
    tower3.firstChild.setAttribute("draggable", true);
    tower3.firstChild.classList.add("draggable");
    tower3.firstChild.addEventListener("dragstart", drag);
  }
}


///// MODAL FUNCTIONS /////////////////////////////////////////////////

rulesBtn.addEventListener("click", e => {
  e.preventDefault();
  showModal("How to Play", "pick a block and move....");
});

rulesClose.addEventListener("click", e => {
  e.preventDefault();
  document.querySelector("#modal").style.display = 'none';
});

resetBtn.addEventListener("click", e => {
  e.preventDefault();
  initGame();
});

function showModal(title, msg) {
  modalTitle.innerText = title;
  modalMsg.innerText = msg;
  modal.style.display = 'flex';
}




