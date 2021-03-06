// const socket = new WebSocket('ws://localhost:8080');
const socket = new WebSocket('wss://websockethangman.herokuapp.com/');

// socket.onmessage = function (event) {
//   var received = event.data;
//   var data = JSON.parse(received);
//   console.log("data received from server", data);
//   addMessage(data.message);
// };

var app = new Vue({
  el: '#app',
  data: {
    gallows: './images/gallows.png',
    headLeft: './images/headleft.png',
    headRight: './images/headright.png',
    handLeft: './images/handleft.png',
    handRight: './images/handright.png',
    legLeft: './images/legleft.png',
    legRight: './images/legright.png',
    letterOne: null,
    letterTwo: null,
    letterThree: null,
    letterFour: null,
    letterFive: null,
    letterSix: null,
    turns: 6, 
    assignedPlayer: null,
    playerOnesTurn: true, 
    guess: null,
    magicWord: null,
    announcedGuess: null,
    correctGuessCount: 0
  },
  methods: {
      updateWord(data) {
        console.log("active letters", data.activeLetters);
        let guessedCorrectly = false;

        if (data.activeLetters.firstLetter != null && this.letterOne == null) {
          this.letterOne = data.activeLetters.firstLetter;
          guessedCorrectly = true;
          this.correctGuessCount = this.correctGuessCount + 1;
        }
        if (data.activeLetters.secondLetter != null && this.letterTwo == null) {
          this.letterTwo = data.activeLetters.secondLetter;
          guessedCorrectly = true;
          this.correctGuessCount = this.correctGuessCount + 1;
        }
        if (data.activeLetters.thirdLetter != null && this.letterThree == null) {
          this.letterThree = data.activeLetters.thirdLetter;
          guessedCorrectly = true;
          this.correctGuessCount = this.correctGuessCount + 1;
        }
        if (data.activeLetters.fourthLetter != null && this.letterFour == null) {
          this.letterFour = data.activeLetters.fourthLetter;
          guessedCorrectly = true;
          this.correctGuessCount = this.correctGuessCount + 1;
        }
        if (data.activeLetters.fifthLetter != null && this.letterFive == null) {
          this.letterFive = data.activeLetters.fifthLetter;
          guessedCorrectly = true;
          this.correctGuessCount = this.correctGuessCount + 1;
        }
        if (data.activeLetters.sixthLetter != null && this.letterSix == null) {
          this.letterSix = data.activeLetters.sixthLetter;
          guessedCorrectly = true;
          this.correctGuessCount = this.correctGuessCount + 1;
        }

        if (!guessedCorrectly) {
          this.turns = this.turns - 1;
        }

        let imPlayerOneAndITookMyTurn = this.assignedPlayer == "playerOne" && this.playerOnesTurn;
        let imPlayerTwoAndItookMyTurn = this.assignedPlayer == "playerTwo" && !this.playerOnesTurn;
        if (imPlayerOneAndITookMyTurn || imPlayerTwoAndItookMyTurn) {
          this.guess = null;
        }

        this.playerOnesTurn = !this.playerOnesTurn;
      },
      guessLetter() {
        if (!this.magicWord) {
          alert("You need a pal.");
          return;
        }
        if (this.assignedPlayer == "playerOne" && this.playerOnesTurn == true){
          var letterData = {
            type: "letterGuess",
            letter: this.guess
            // guesser: this.assignedPlayer
          };

          socket.send(JSON.stringify(letterData));
        } else if (this.assignedPlayer == "playerTwo" && this.playerOnesTurn == false){
          var letterData = {
            type: "letterGuess",
            letter: this.guess
            // guesser: this.assignedPlayer
          };

          socket.send(JSON.stringify(letterData));
        } else {
          alert("It is currently the other player's turn. Please wait.")
        }
      },
      reset() {
        socket.send(JSON.stringify({ type: "reset" }));
      }
    },
  created() {
    console.log("VUE is ready");
    socket.onmessage = function (event) {
      var received = event.data;
      var data = JSON.parse(received);
      console.log("data received from server", data);
      addMessage(data.message);
    };

    socket.onmessage = e => {
      console.log('Received: ', e.data);
      const data = JSON.parse(e.data);
      console.log("data", data)

      console.log("type", data.type)
      if (data.type == "player"){
        this.assignedPlayer = data.player;
        console.log("I am player ", this.assignedPlayer)

      } else if (data.type == "magicWord") {
        this.magicWord = data.magicWord
        console.log("The magic word is ", this.magicWord)
        //this.loadMagicWord();
      } else if (data.type == "letterGuess") {
        this.announcedGuess = data.letter;
      } else if (data.type == "activeWord") {
        this.updateWord(data);
      } else if (data.type == "activePlayer"){
        if (data.activePlayer.activePlayer == playerOne){
          this.playerOnesTurn = false;
        } else if (data.activePlayer.activePlayer == playerTwo){
          this.playerOnesTurn = true;
        }
      }
    }

    socket.onclose = e => {
      console.log('Closing socket due to: ', e.reason);
      this.assignedPlayer = null;
      this.playerOnesTurn = true;
      this.letterOne = null;
      this.letterTwo = null;
      this.letterThree = null;
      this.letterFour = null;
      this.letterFive = null;
      this.letterSix = null;
      this.turns = 6;
      this.correctGuessCount = 0;
      this.guess = null;
      this.announcedGuess = null;
      this.magicWord = null;
    }
  }
});