// const gameBoard = document.querySelector(".game-board");
// const gameBoardContents = document.querySelector(".game-board-contents");
// const gameGrid = document.querySelector(".game-grid");

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

class Block {
  constructor(id, level) {
    this.id = id,
    this.level = level;
  }
}

class Stack {
  // Stacks exist within towers and hold the blocks.
  // They are dumb and assume they are handed blocks in the correct order.
  // The top-most block (smallest level) should be stored in position [0] of the stack
  constructor(blocks = []) {
    this.stack = blocks;
  }

  getTopBlock() {
    return this.stack[0];
  }

  getBottomBlock() {
    return this.stack[this.stack.length - 1];
  }

  getLength() {
    //console.log("here: ", this.stack);
    if (!(this.stack === undefined)) {
      return this.stack.length;
    } else {
      return 0;
    }
  }

  addBlockToStack(block) {
    this.stack.push(block);
  }

  removeTopBlockFromStack() {
    this.stack.pop();
  }

  getStackContents() {
    return this.stack;
  }

}

class Tower {
  //All rule logic for the game is handled by Tower
  constructor(id, blocks = []) {
    this.id = id;

    // Sort the blocks array in ascending order by level
    if (blocks.length > 0) {
      blocks.sort((a, b) => {
        return a.level - b.level;
      });
    }
    this.stack = new Stack(blocks);
  }

  addBlock(block) {
    console.log(`block.level: ${block.level}, topBlock level: ${this.stack.getTopBlock() === undefined ? 'NA' : this.stack.getTopBlock().level}`);

    if (!this.stack.getTopBlock() || block.level < this.stack.getTopBlock().level){
      this.stack.addBlockToStack(block);
      return true;
    } else {
      return false;
    }
  }

  removeBlock() {
    this.stack.removeTopBlockFromStack();
  }

  getStack() {
    return this.stack;
  }
}

initGame();

function initGame() {

  let t1 = new Tower(tower1.getAttribute("id"),
  [new Block(1, 1),
      new Block(2, 2),
      new Block(3, 3),
      new Block(4, 4),
      new Block(5, 5),
      new Block(6, 6),
      new Block(7, 7),
      new Block(8, 8),
      new Block(9, 9),
      new Block(10, 10)
    ]);

  // console.log(t1.addBlock(new Block(5, 100)));
  // console.log(t1.addBlock(new Block(5, 25)));
  // console.log(t1.addBlock(new Block(5, 26)));
  // console.log(t1.addBlock(new Block(5, 27)));
  // console.log(t1.addBlock(new Block(5, 10)));

  let newBlock;

   //console.log(t1);
  // console.log(t1.getStack().getLength());

  for (let i = 0; i < t1.getStack().getLength(); i++) {
    newBlock = document.createElement("div");
    newBlock.classList.add("block");
    newBlock.classList.add(`level${t1.getStack().getStackContents()[i].level}`);
    tower1.appendChild(newBlock);
  }

  //console.log(t1);

  //resetModal();
  //rulesBtn.click;

  //buildGameBoard();
  //setMsgBanner(redTurn);

}

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


