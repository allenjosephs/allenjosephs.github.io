const gameBoard = document.querySelector(".game-board");
const gameBoardContents = document.querySelector(".game-board-contents");
const gameGrid = document.querySelector(".game-grid");
const resetBtn = document.querySelector("#reset");
const modal = document.querySelector("#modal");
const modalTxt = document.querySelector("#modal-textbox");
const modalMsg = document.querySelector("#modal-msg");
const squareAttribs = ["oneXone", "oneXtwo", "oneXthree", "twoXone", "twoXtwo", "twoXthree", "threeXone", "threeXtwo", "threeXthree"];

const red = "red";
const blue = "blue";
const redTurn = "Turn: RED";
const blueTurn = "Turn: BLUE";
let turn;

class Board {
  constructor() {
    this.oneXone = false;
    this.oneXtwo = false;
    this.oneXthree = false;
    this.twoXone = false;
    this.twoXtwo = false;
    this.twoXthree = false;
    this.threeXone = false;
    this.threeXtwo = false;
    this.threeXthree = false;
  }

  clickedSquare(squareId) {
    this[squareId] = true;
  }

}

class PlayerBoard extends Board {
  constructor(color) {
    super();
    this.color = color;
  }

  isWinner() {
    return (
      //check row winner
      (this.oneXone && this.oneXtwo && this.oneXthree) ||
      (this.twoXone && this.twoXtwo && this.twoXthree) ||
      (this.threeXone && this.threeXtwo && this.threeXthree) ||

      //check column winner
      (this.oneXone && this.twoXone && this.threeXone) ||
      (this.oneXtwo && this.twoXtwo && this.threeXtwo) ||
      (this.oneXthree && this.twoXthree && this.threeXthree) ||

      //check diagonal winner
      (this.oneXone && this.twoXtwo && this.threeXthree) ||
      (this.oneXthree && this.twoXtwo && this.threeXone));
  }
}

class GameTracker extends Board {
  constructor () {
    super();
  }

  isTie() {
    for (let square in this) {
      if (!this[square]) {
        return false;
      }
    }
    return true;
  }
}

let redBoard;
let blueBoard;

initGame();

function initGame() {
  turn = red;
  let square;

  resetModal();

  buildGameBoard();

  redBoard = new PlayerBoard(red);
  blueBoard = new PlayerBoard(blue);
  gameTrackerBoard = new GameTracker();

  setMsgBanner(redTurn);

}

function resetModal() {
  modal.style.display = 'none';
  modalMsg.innerHTML = '';

  while(modalTxt.classList.length > 0){
    modalTxt.classList.remove(modalTxt.classList[0]);
  }

  while(modalMsg.classList.length > 0) {
    modalMsg.classList.remove(modalMsg.classList[0]);
  }
}

function buildGameBoard() {
  gameBoardContents.innerHTML = "";
  squareAttribs.forEach(sa => {
    square = document.createElement("div");
    square.id = sa;
    square.classList.add(sa);
    square.classList.add("square");
    square.classList.add("unclicked");
    gameBoardContents.appendChild(square);
  });
}

gameBoardContents.addEventListener("click", e => {
  if (e.target.classList.contains("square") &&
      !e.target.classList.contains("clicked")){
    let clickedSquare = e.target;
    switch (turn) {
      case red:
        squareClicked(redBoard, clickedSquare, gameTrackerBoard);
        turn = blue;
        setMsgBanner(blueTurn);
        break;
      case blue:
        squareClicked(blueBoard, clickedSquare, gameTrackerBoard);
        turn = red;
        setMsgBanner(redTurn);
        break;
    }

    determineWinOrTie();

  }
});

resetBtn.addEventListener("click", e => {
  e.preventDefault();
  initGame();
});

function setMsgBanner(message) {
  document.querySelector(".msg-banner").innerText = message;
}

function squareClicked(board, clickedSquare, trackerBoard) {
  clickedSquare.classList.add(board.color);
  clickedSquare.classList.add("clicked");
  clickedSquare.classList.remove("unclicked");
  board.clickedSquare(clickedSquare.id);
  trackerBoard.clickedSquare(clickedSquare.id);
}

function determineWinOrTie() {
  if (redBoard.isWinner()) {
    showModal("Red Wins!", red);
  } else if (blueBoard.isWinner()) {
    showModal("Blue Wins!", blue);
  } else if (gameTrackerBoard.isTie()) {
    showModal("It's a tie!");
  }
}

function showModal(msg, color) {
  setMsgBanner(msg);
  modalMsg.innerText = msg;
  switch (color) {
    case red:
      modalMsg.classList.add("modal-msg-red");
      modalTxt.classList.add("modal-red");
      break;
    case blue:
      modalMsg.classList.add("modal-msg-blue");
      modalTxt.classList.add("modal-blue");
      break;
    default:
      modalTxt.classList.add("modal-tie");
  }
  modal.style.display = 'flex';
}

document.querySelector("#close").addEventListener("click", e => {
  initGame();
});


