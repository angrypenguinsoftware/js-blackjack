// contains all card deck funtionality

const SUITS =["♠", "♣",  "♥",  "♦" ];
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];


export default class Deck{
    constructor(cards = freshDeck()){
        this.cards = cards;
    }

    get numberOfCards(){
        return this.cards.length;
    }

    // Takes from the top (FYI - pop takes card from the bottom)
    pop() {
        return this.cards.shift();
    }

    // Adds to the bottom
    push(card) {
        this.cards.push(card);
    }

    // Shuffle the cards/Deck
    shuffle() {
        // this.cards.sort((a, b) => Math.random() - .5)  Does Not work properly - not Random enough
        for (let i = this.numberOfCards - 1; i > 0; i--) {
            const newIndex = Math.floor(Math.random() * (i + 1));
            const oldValue = this.cards[newIndex];
            this.cards[newIndex] = this.cards[i];
            this.cards[i] = oldValue;
        }
    }
}

class Card {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
    }

    get color() {
        return this.suit === '♣' || this.suit === '♠' ? 'black' : 'red';
    }

    getHTML() {
        const cardDIV = document.createElement('div');
        cardDIV.innerText = this.suit;
        cardDIV.classList.add("card", this.color);
        cardDIV.dataset.value = `${this.value} ${this.suit}`;
        return cardDIV;
    }
        
}

// Get the deck
function freshDeck(){
    return SUITS.flatMap(suit => {
        return VALUES.map(value => {
            return new Card(suit, value);
        })
    })
}