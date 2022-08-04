import Deck from "./deck.js"

// Assign values to the Cards
const CARD_VALUE_MAP = {
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    "J": 10,
    "Q": 10,
    "K": 10,
    "A": 11
}

const dealerCardsSection = document.querySelector('.dealer-cards');
const messagesSection = document.querySelector('.messages');
const playerCardsSection = document.querySelector('.player-cards');
const playerInfoSection = document.querySelector('.player-info');
const betButton = document.querySelector('#bet');
const hitButton = document.querySelector('#hit');
const stayButton = document.querySelector('#stay');
const newGameButton = document.querySelector('#new-game');
const betAmountTextBox = document.querySelector('#bet-amt');
const dropDownSelector = document.querySelector('#drop-down');

let playerCards = [];
let dealerCards = [];

let playerCash;
let deck;
let gameOn;  // used to control actions
let bet;

// Todo: 3. Add security 5. Center app 6. scale on mobile better



dropDownSelector.addEventListener('click', (event) => {
    // make sure player cannot change bet after the fact
    if (betAmountTextBox.disabled) {
        return;
    } else {
        betAmountTextBox.value = dropDownSelector.value;
    }
});


// Event Listeners
betButton.addEventListener('click', (event) => { 
    if (gameOn) {
        if (!verifyPlayerBet()) {
            return;
        }
        gamePlayControls();

        playerCash = playerCash - betAmountTextBox.value;
        bet = betAmountTextBox.value;
        gameOn = false;
        playerUpdate();
        betAmountTextBox.disabled = true; // lock betting so no more bets can be made
    
        // after player bets show their cards
        playerCardsSection.innerHTML = '';
        playerCards.forEach(card => {
            faceUpCard(playerCardsSection, card);
        });
    }
});

hitButton.addEventListener('click', (event) => {
    if (!gameOn) {
        playerHit();
    }
    return;
});

stayButton.addEventListener('click', (event) => {
    gameOn = true; // stop player from doing anything else

    // show dealer cards
    dealerCardsSection.innerHTML = '';
    dealerCards.forEach(card => {
        faceUpCard(dealerCardsSection, card);
    });

    let totalDealer = totalCardCount(dealerCards);
    let totalPlayer = totalCardCount(playerCards);
    writeMessage('Dealer has ' + totalDealer);

    while (totalDealer < totalPlayer ){
        dealerHit();
        totalDealer = totalCardCount(dealerCards);

        if (totalDealer <= 21 ) {
            writeMessage('Dealer has ' + totalDealer);
        } else {
            writeMessage('Dealer Has Busted!')
        }  
    }
    isWinner();
    newGameControls();
});

newGameButton.addEventListener('click', (event) => {
    startGame();
    betControls();
    betAmountTextBox.innerHTML = '';
    betAmountTextBox.focus();
});


playerCardsSection.addEventListener('click', () => {
    if (!gameOn) {
        playerHit();
    }
    return;
});

startGame();

function startGame() {
    deck = new Deck;
    deck.shuffle();

    newGame(deck);
}

// clean playing area 
function newGame(deck) {
    // Set localstorage value for users cash
    if (playerCash > 0 ) {
        setUserCash(playerCash);
    }

    // Get the localstorage value for the players cash if there is any
    let cash = getUserCash();

    if (cash > 0) {
        playerCash = cash;
    } else {
        playerCash = 500;
        setUserCash(playerCash);
    }

    dealerCardsSection.innerHTML = '';
    messagesSection.innerHTML = '';
    playerCardsSection.innerHTML = '';
    playerInfoSection.innerHTML = '$' + playerCash;

    newGameControls();
    gameOn = true;
    //betAmountTextBox.disabled = false;

    // In case player loses all their money
    if (playerCash <= 0) {
        writeMessage('you are Busted! Heres a Loan');
        playerCash = 100;
    } else {
        writeMessage('New Game!');
    }

    // Deal 2 cards to player and dealer
    playerCards = [deck.pop(), deck.pop()];
    dealerCards = [deck.pop(), deck.pop()];

    playerCards.forEach(card => {
        // Deal players cards face down until they bet
        //faceUpCard(playerCardsSection, card);
        faceDownCard(playerCardsSection);
    });

    // Deal dealers cards one up and one face
    faceDownCard(dealerCardsSection);
    faceUpCard(dealerCardsSection, dealerCards[0]);

    //playerUpdate();
    
    return;
}

// Gets user cash stored in localstorage
function getUserCash() {
    return localStorage.getItem("userCash");
}

// Sets the usr cash to localstorage
function setUserCash(){
    localStorage.setItem("userCash", playerCash);
}


function playerHit(){
    if (totalCardCount(playerCards) < 21) {
        // add another card
        let card = deck.pop();
        playerCards.push(card);

        faceUpCard(playerCardsSection, card);

        playerUpdate();
    }
}

function dealerHit(){
    if (totalCardCount(dealerCards) < 21) {
        let card = deck.pop();
        dealerCards.push(card);

        faceUpCard(dealerCardsSection, card);

        writeMessage('Dealer has ' + totalCardCount(dealerCards));
    }
}

function playerUpdate(){
    let total =  totalCardCount(playerCards);

    //console.log('Before ' + playerCash);

    if (total > 21) {
        total = 'BUSTED!';
        newGameControls();
    } else if (total === 21) {
        total = '21!';
    }

    if (playerCards.length >= 5 && total <= 21) {
        total = '5 Cards for Win!';
        playerCash = +playerCash + (2 * +bet);
        console.log('Player has 5 cards : ' + playerCash);
    }

    playerInfoSection.innerHTML = '$' + playerCash;

    writeMessage('Player has ' + total);

    //console.log('After ' + playerCash);

    gameOn = false;
}


// Count the total cards amount and return it
function totalCardCount(cards) {
    let total = 0;
    let isAce = false;

    cards.forEach(card => {
        total = total + CARD_VALUE_MAP[card.value];
    });

    // Ace check
    cards.forEach(card1 => {
        if (total > 21 && card1.value === 'A') {
            total = +total - +10;
        }
    });

    return total;
}


function writeMessage(message) {
    messagesSection.innerHTML = message;
    return;
}

function faceUpCard(section, card) {
    section.appendChild(card.getHTML());
    return;
}

function faceDownCard(section) {
    let noCard = document.createElement('div');
    noCard.classList.add('noCard');
    section.appendChild(noCard);
}


function isWinner(){
    let totalPlayer = totalCardCount(playerCards);
    let totalDealer = totalCardCount(dealerCards);

    // console all hand values
    console.log('Dealer ' + totalDealer + ' : Player ' + totalPlayer + ' : PlayerCash ' + playerCash + ' : Bet ' + bet);

    if (totalPlayer > 21) {
        writeMessage('Player has Busted!');
        console.log('Player Bust PlayerCash : ' + playerCash);
        return;
    }
    if (totalDealer > 21) {
        writeMessage('Dealer has Busted!');
        playerCash = +playerCash + (2 * +bet);  // return players bet
        console.log('Dealer Bust PlayerCash : ' + playerCash);
        return;
    }

    if (totalPlayer > totalDealer) {
        writeMessage('Player Wins!!');
        playerCash = +playerCash + (2 * +bet);
    } else if (totalPlayer === totalDealer) {
        writeMessage('Its a Push');
        playerCash = +playerCash + +bet;
    } else {
        writeMessage('Dealer Wins With ' + totalDealer + '!');
    }
    console.log('PlayerCash After Hand : ' + playerCash);

    return;
}

// is it a valid bet - returns true/false
function verifyPlayerBet() {
    let betAmount = parseInt(betAmountTextBox.value);

    if (isNaN(betAmount) ||  betAmount < 1 || betAmount > playerCash) {
        writeMessage('Not a Valid Bet.');
        betAmountTextBox.innerText = '';
        betAmountTextBox.disabled = false;
        betAmountTextBox.focus();
        return false;
    } else {
        // Bet Accepted
        return true;
    }
}



function newGameControls(){
    newGameButton.disabled = false;
    betButton.disabled = true;
    hitButton.disabled = true;
    stayButton.disabled = true;
    betAmountTextBox.disabled = true;
    dropDownSelector.disabled = true;
}

function betControls(){
    newGameButton.disabled = false;
    betButton.disabled = false;
    hitButton.disabled = true;
    stayButton.disabled = true;
    betAmountTextBox.disabled = false;
    dropDownSelector.disabled = false;
}

function gamePlayControls(){
    newGameButton.disabled = false;
    betButton.disabled = true;
    hitButton.disabled = false;
    stayButton.disabled = false;
    betAmountTextBox.disabled = true;
    dropDownSelector.disabled = true;
}


