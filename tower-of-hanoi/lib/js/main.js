// const gameBoard = document.querySelector(".game-board");
// const gameBoardContents = document.querySelector(".game-board-contents");
// const gameGrid = document.querySelector(".game-grid");

const resetBtn = document.querySelector("#reset-button");
const solveMeBtn = document.querySelector("#solve-me-button");
const rulesBtn = document.querySelector("#rules-button");

const modal = document.querySelector("#modal");
const modalContent = document.querySelector("#modal-content");
const modalTitle = document.querySelector("#modal-title");
const modalMsg = document.querySelector("#modal-msg");
const modalFooter = document.querySelector("#modal-footer");

const rulesClose = document.querySelector("#close-rules");

class Board {
  constructor() {

  }
}

initGame();

function initGame() {

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


