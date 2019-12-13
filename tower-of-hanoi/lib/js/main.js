const scrnGameBoardContents = document.querySelector(".game-board-contents");

const scrnTower1 = document.querySelector("#tower1");
const scrnTower2 = document.querySelector("#tower2");
const scrnTower3 = document.querySelector("#tower3");

const scrnDifficultySelect = document.querySelector("#difficulty");
const scrnDifficultyDiv = document.querySelector(".difficulty");

const scrnResetBtn = document.querySelector("#reset-button");

const scrnRulesBtn = document.querySelector("#rules-button");
const scrnRulesModal = document.querySelector("#rules-modal");
const scrnRulesCloseBtn = document.querySelector("#close-rules");

const scrnWinModal = document.querySelector("#win-modal");
const scrnWinCloseBtn = document.querySelector("#close-win");

const scrnMinMoveCount = document.querySelector("#min");
const scrnMoveCount = document.querySelector("#count");
const scrnSolveBtn = document.querySelector("#solve-me"); // <-- possible future enhancement

let moveCount = 0;
let minMoves = 0;
let timeToSolve = 0;

// This will hold the object being dragged (a block).  In many cases drag
// events do not have access to the object being dragged; this is my workaround.
let scrnDraggedBlock;

class Block {
  constructor(id) {
    this.id = id;
  }
}

class Tower {
  constructor(id, blocks = []) {
    this.id = id;
    // Sort the blocks array in ascending order by id (aka level) in
    // case they were passed in out of order (this is only done in the constructor)
    if (blocks.length > 0) {
      blocks.sort((a, b) => {
        return a.id - b.id;
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

// Global variables for the 3 towers
let t1;
let t2;
let t3;

initGame();

function initGame() {
  ////////////////////////////////////////////////////////////////////
  // This function runs when the page is first loaded and when the  //
  // user clicks the reset button.                                  //
  ////////////////////////////////////////////////////////////////////

  // Clear out the towers
  scrnTower1.innerHTML = "";
  scrnTower2.innerHTML = "";
  scrnTower3.innerHTML = "";

  // scrnDifficultySelect will only be 'disabled' if the user clicks reset during an active game
  if (scrnDifficultySelect.classList.contains("disabled")) {
    enableElement(scrnDifficultySelect);
    enableElement(scrnDifficultyDiv);

    scrnDifficultySelect.value = 0;
    scrnResetBtn.innerText = "Start Game";

    resetMoveCount();
    updateInnerText(scrnMoveCount, moveCount);

    resetMinMoveCount();
    updateInnerText(scrnMinMoveCount, minMoves);
  }

  if (!(scrnDifficultySelect.value === "0")) {

    let blockArray = [];
    for (let i = 1; i <= parseInt(scrnDifficultySelect.value); i++){
      blockArray.push(new Block(i));
    }

    t1 = new Tower(scrnTower1.getAttribute("id"), blockArray);
    t2 = new Tower(scrnTower2.getAttribute("id"));
    t3 = new Tower(scrnTower3.getAttribute("id"));

    updateInnerText(scrnMinMoveCount, calcMinMoves(t1.blocks.length));

    resetMoveCount();
    updateInnerText(scrnMoveCount, moveCount);

    updateInnerText(scrnResetBtn, "Reset Game");
    disableElement(scrnDifficultySelect);
    disableElement(scrnDifficultyDiv);

    let scrnNewBlock;
    for (let i = 0; i < t1.blocks.length; i++) {
      scrnNewBlock = document.createElement("div");
      scrnNewBlock.setAttribute("id", t1.blocks[i].id);
      scrnNewBlock.classList.add("block");

      // The level class is used by the CSS to size the blocks correctly
      scrnNewBlock.classList.add(`level${t1.blocks[i].id}`);
      scrnTower1.appendChild(scrnNewBlock);
      scrnTower1.firstChild.setAttribute("draggable", true);
      scrnTower1.firstChild.classList.add("draggable");
      scrnTower1.firstChild.addEventListener("dragstart", drag);
    }
  }
}

///////////////// START DRAG-AND-DROP EVENTS & HELPER FUNCTIONS /////////////

scrnGameBoardContents.addEventListener("drop", e => {

  let divId = scrnDraggedBlock.id;
  let fromTowerId = e.dataTransfer.getData("text");
  let toTowerId = e.target.id;

  e.target.classList.remove("valid-drop-zone");
  e.target.classList.remove("invalid-drop-zone");

  // If the target is a drop-zone and the drop is allowed (e.g. the id of the dragged block
  // is less than the id of the top element in the target tower's block stack) then allow
  // the drop and check to see if the win condition is met/
  if (e.target.classList.contains("drop-zone") &&
        dropAllowed(divId, getTowerById(toTowerId))) {

    e.preventDefault();

    // Insert the dragged block at the top of the tower
    e.target.insertBefore(document.getElementById(divId), e.target.firstChild);

    // Move the block from the 'old' javascript tower object to the target tower object
    moveBlock(getTowerById(fromTowerId), getTowerById(toTowerId));

    // Reset the appropriate elements as draggable on all of the towers
    setDraggable();

    // Increment the move count if the user didn't drop the block back onto the original tower
    if (!(fromTowerId === toTowerId)) {
      incrementMoveCount(1);
      updateInnerText(scrnMoveCount, moveCount);
    }

    e.dataTransfer.clearData();

    // Check for a win condition (all blocks are in tower 3)
    if (checkForWin()) {
      //Turn off the ability to drag any objects (the game is over)
      removeDraggable(scrnTower3.childNodes[0]);
      showModal(scrnWinModal);
    };
  }
});

scrnGameBoardContents.addEventListener("dragend", e => {
  // Remove the visual 'I am being dragged' styling once the drag is over
  e.target.classList.remove("dragging");
});

scrnGameBoardContents.addEventListener("dragenter", e=> {
  // This event listener will add some styling to the tower being dragged into based
  // on whether the tower is a valid drop zone for the dragged block
  let toTowerId = e.target.id;
  if (e.target.classList.contains("drop-zone")) {
    if (dropAllowed(parseInt(scrnDraggedBlock.id), getTowerById(toTowerId))) {
      e.target.classList.add("valid-drop-zone");
    } else {
      e.target.classList.add("invalid-drop-zone");
    }
  }
});

scrnGameBoardContents.addEventListener("dragleave", e => {
  // Reset the tower's styling once the cursor leaves the drop zone
  if (e.target.classList.contains("drop-zone")) {
    e.target.classList.remove("valid-drop-zone");
    e.target.classList.remove("invalid-drop-zone");
  }
});

scrnGameBoardContents.addEventListener("dragover", e => {
  e.preventDefault();
});

function drag(e) {
  // Set the data to the current tower location (e.path[1].id) for future use.
  // Certain drag events do not have access to the object being dragged,
  // thus storing the dragged object into a global variable
  scrnDraggedBlock = document.getElementById(e.target.id);
  e.dataTransfer.setData("text", e.path[1].id);
  e.target.classList.add("dragging");
}

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

///////////////// END DRAG-AND-DROP LISTENERS & HELPERS /////////////

document.getElementById("difficulty").addEventListener("onkeypress", e => {
  // This prevents users from typing in the block count input
  // which will force them to use the spinners
  e.preventDefault();
});

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
  scrnGameBoardContents.childNodes.forEach(t => {
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

function incrementMoveCount(increment) {
  moveCount += increment;
}

function resetMoveCount() {
  moveCount = 0;
}

function resetMinMoveCount() {
  minMoves = 0;
}

function updateInnerText(screenElement, text) {
  screenElement.innerText = text;
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
  if ((scrnTower1.childElementCount === 0) && (scrnTower2.childElementCount === 0)) {
    return true;
  } else {
    return false;
  }

}

scrnResetBtn.addEventListener("click", e => {
  e.preventDefault();
  initGame();
});

function enableElement(element) {
  element.classList.remove("disabled");
  element.removeAttribute("disabled");
}

function disableElement(element) {
  element.classList.add("disabled");
  element.setAttribute("disabled", true);
}

///// MODAL FUNCTIONS /////////////////////////////////////////////////

scrnRulesBtn.addEventListener("click", e => {
  e.preventDefault();
  showModal(scrnRulesModal);
});

scrnRulesCloseBtn.addEventListener("click", e => {
  e.preventDefault();
  hideModal(scrnRulesModal);
});

scrnWinCloseBtn.addEventListener("click", e => {
  e.preventDefault();
  hideModal(scrnWinModal);
});

function showModal(modal) {
  modal.classList.add("modal-show");
}

function hideModal(modal) {
  modal.classList.remove("modal-show");
}

//=========================================================================
scrnSolveBtn.addEventListener("click", e => {
  //Algorithm taken from https://www.codeproject.com/Articles/679651/Tower-of-Hanoi-in-JavaScript
  hanoiSolver(scrnTower1.childNodes.length, t1, t3, t2);
});


function hanoiSolver(moveCount, sourceTower, targetTower, auxTower) {
  callStack = []; // Global array to hold sequence of moves
  hanoi(moveCount, sourceTower, targetTower, auxTower);
  console.log(callStack);
  moveDisk();
}

function hanoi(blockCount, sourceTower, targetTower, spareTower) {
  // This function plays out the hanoi solution but doesn't make any object or screen
  // changes.  Instead, it saves all the different moves within the callStack
  // array. Algorithm credit: https://www.codeproject.com/Articles/679651/Tower-of-Hanoi-in-JavaScript

  if (blockCount > 0) {
    //Move n - 1 disks from source to spare
    hanoi(blockCount - 1, sourceTower, spareTower, targetTower);

    // Move the nth disk from source to target
    callStack.push([sourceTower, targetTower]); // save parameters to callStack array

    //Move the n - 1 disks that we left on auxiliary onto target
    hanoi(blockCount - 1, spareTower, targetTower, sourceTower);
  }
}

function moveDisk() {
  // Algorithm credit: https://www.codeproject.com/Articles/679651/Tower-of-Hanoi-in-JavaScript
  // This function will work through the callStack and perform the actual object changes
  // and screen movements that were recorded during the hanoi() function.

  let param;
  let scrnBlock;
  let scrnFromT;
  let scrnToT;
  let block;

  if (callStack.length === 0) return;

  param = callStack.shift(); // Get call parameters from callStack
  fromT = param[0];
  toT = param[1];

  block = fromT.blocks.shift();
  toT.blocks.unshift(block);
  scrnBlock = document.getElementById(block.id);
  scrnFromT = document.getElementById(fromT.id);
  scrnToT = document.getElementById(toT.id);

  //setTimeout(animateMove, 200);

  (function(sBlk, sFTower, sTTower) {
    setTimeout(function () {
      animateMove(sBlk, sFTower, sTTower);
    }, 200);
  })(scrnBlock, scrnFromT, scrnToT);

}

function animateMove(scrnBlock, scrnFromT, scrnToT) {
  scrnFromT.removeChild(scrnBlock);
  scrnToT.insertBefore(scrnBlock, scrnToT.firstElementChild);
  moveDisk();
}

// function moveElements(sourceTower, targetTower) {
//    let div1 = sourceTower.removeChild(sourceTower.childNodes[0]);
//    targetTower.insertBefore(div1, targetTower.childNodes[0]);
// }




// let sourceTower = [3, 2, 1];
// let targetTower = [];
// let spareTower = [];

// scrnSolveBtn.addEventListener("click", e => {
//   solver(scrnTower1.childNodes.length, scrnTower1, scrnTower3, scrnTower2);
// });

// function solver(blockCount, sourceTower, targetTower, spareTower) {
//   // Algorithm taken from https://en.wikipedia.org/wiki/Tower_of_Hanoi

//   if (blockCount > 0) {

//     //Move n - 1 disks from source to spare
//     solver(blockCount - 1, sourceTower, spareTower, targetTower);

//     // Move the nth disk from source to target
//     let div1 = sourceTower.removeChild(sourceTower.childNodes[0]);
//     targetTower.insertBefore(div1, targetTower.childNodes[0]);

//     //Move the n - 1 disks that we left on auxiliary onto target
//       solver(blockCount - 1, spareTower, targetTower, sourceTower)
//   }
// }