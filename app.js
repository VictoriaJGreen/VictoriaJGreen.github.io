const socket = new WebSocket('ws://websockethangman.herokuapp.com/');

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
    headLeft: './images/headLeft.png',
    headRight: './images/headRight.png',
    handLeft: './images/handLeft.png',
    handRight: './images/handRight.png',
    legLeft: './images/legLeft.png',
    legRight: './images/legRight.png',
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
        }
        if (data.activeLetters.secondLetter != null && this.letterTwo == null) {
          this.letterTwo = data.activeLetters.secondLetter;
          guessedCorrectly = true;
        }
        if (data.activeLetters.thirdLetter != null && this.letterThree == null) {
          this.letterThree = data.activeLetters.thirdLetter;
          guessedCorrectly = true;
        }
        if (data.activeLetters.fourthLetter != null && this.letterFour == null) {
          this.letterFour = data.activeLetters.fourthLetter;
          guessedCorrectly = true;
        }
        if (data.activeLetters.fifthLetter != null && this.letterFive == null) {
          this.letterFive = data.activeLetters.fifthLetter;
          guessedCorrectly = true;
        }
        if (data.activeLetters.sixthLetter != null && this.letterSix == null) {
          this.letterSix = data.activeLetters.sixthLetter;
          guessedCorrectly = true;
        }

        if (guessedCorrectly) {
          this.correctGuessCount = this.correctGuessCount + 1;
        } else {
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
    }
  }
});