class BlackjackGame {
    constructor() {
        this.deck = [];
        this.playerRole = '';
        this.playerHands = [[]];
        this.dealerHand = [];
        this.currentHand = 0;
        this.bankroll = 250;
        this.currentBet = 0;
        this.insurance = 0;
        this.handsWon = 0;
        this.gamePhase = 'betting';
        this.runningCount = 0;
        this.numberOfDecks = 6;
        this.initializeGame();
        this.setupEventListeners();
        this.NoMoney();
    }

    initializeGame() {
        this.createDeck();
        this.shuffle();
        this.updateStats();
    }

    createDeck() {
        const suits = ['♠', '♣', '♥', '♦'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        this.deck = [];
        for (let d = 0; d < this.numberOfDecks; d++) {
            for (let suit of suits) {
                for (let value of values) {
                    this.deck.push({
                        suit,
                        value,
                        isRed: suit === '♥' || suit === '♦',
                        numericValue: this.getCardValue(value)
                    });
                }
            }
        }
    }

    shuffle() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    dealCard(isHidden = false) {
        if (this.deck.length < 20) {
            this.createDeck();
            this.shuffle();
            this.updateCount(0, true);
        }
        const card = this.deck.pop();
        card.hidden = isHidden;
        if (!isHidden) {
            this.updateCount(this.getCountValue(card.value));
        }
        return card;
    }

    getCountValue(value) {
        if (['2', '3', '4', '5', '6'].includes(value)) return 1;
        if (['10', 'J', 'Q', 'K', 'A'].includes(value)) return -1;
        return 0;
    }

    updateCount(value, reset = false) {
        if (reset) {
            this.runningCount = 0;
        } else {
            this.runningCount += value;
        }
        document.getElementById('count').textContent = this.runningCount;
    }

    getCardValue(value) {
        if (['K', 'Q', 'J'].includes(value)) return 10;
        if (value === 'A') return 11;
        return parseInt(value);
    }

    calculateHandValue(hand) {
        let value = 0;
        let aces = 0;
        for (let card of hand) {
            if (card.value === 'A') {
                aces++;
            } else {
                value += this.getCardValue(card.value);
            }
        }
        for (let i = 0; i < aces; i++) {
            if (value + 11 <= 21) {
                value += 11;
            } else {
                value += 1;
            }
        }
        return value;
    }

    startNewHand() {
        if (this.currentBet <= 0 || this.currentBet > this.bankroll) {
            alert('Please place a proper bet!');
            return;
        }
        this.bankroll -= this.currentBet;
        this.playerHands = [[]];
        this.dealerHand = [];
        this.currentHand = 0;
        this.gamePhase = 'playing';
        this.playerHands[0].push(this.dealCard());
        this.dealerHand.push(this.dealCard());
        this.playerHands[0].push(this.dealCard());
        this.dealerHand.push(this.dealCard(true));
        this.updateUI();
        this.checkInitialState();
    }

    hit() {
        this.playerHands[this.currentHand].push(this.dealCard());
        this.updateUI();
        if (this.calculateHandValue(this.playerHands[this.currentHand]) > 21) {
            if (this.currentHand < this.playerHands.length - 1) {
                this.currentHand++;
            } else {
                this.endHand();
            }
        }
    }

    stand() {
        if (this.currentHand < this.playerHands.length - 1) {
            this.currentHand++;
            this.updateUI();
            return;
        }
        this.dealerHand[1].hidden = false;
        while (this.calculateHandValue(this.dealerHand) < 17) {
            this.dealerHand.push(this.dealCard());
        }
        this.endHand();
    }

    doubleDown() {
        if (this.bankroll >= this.currentBet) {
            this.bankroll -= this.currentBet;
            this.currentBet *= 2;
            this.hit();
            this.stand();
        }
    }

    split() {
        const hand = this.playerHands[this.currentHand];
        if (hand.length === 2 && hand[0].value === hand[1].value) {
            this.playerHands.push([hand.pop()]);
            this.hit();
            this.updateUI();
        }
    }

    surrender() {
        this.bankroll += this.currentBet / 2;
        this.endHand();
    }

    insurance() {
        if (this.dealerHand[0].value === 'A') {
            this.insurance = this.currentBet / 2;
            this.bankroll -= this.insurance;
        }
    }

    endHand() {
        this.dealerHand[1].hidden = false;
        const dealerValue = this.calculateHandValue(this.dealerHand);
        this.playerHands.forEach((hand, index) => {
            const playerValue = this.calculateHandValue(hand);
            if (playerValue > 21) {
                this.handleLoss();
            } else if (dealerValue > 21) {
                this.handleWin();
            } else if (playerValue > dealerValue) {
                this.handleWin();
            } else if (playerValue < dealerValue) {
                this.handleLoss();
            } else {
                this.handlePush();
            }
        });
        this.gamePhase = 'betting';
        this.updateUI();
    }

    handleWin(blackjack = false) {
        const winAmount = blackjack ? this.currentBet * 2.5 : this.currentBet * 2;
        this.bankroll += winAmount;
        this.handsWon++;
    }

    handleLoss() {}

    handlePush() {
        this.bankroll += this.currentBet;
    }

    updateUI() {
        this.updateHandDisplay('dealer-hand', this.dealerHand);
        this.updateHandDisplay('player-hand', this.playerHands[0]);
        if (this.playerHands.length > 1) {
            document.getElementById('split-hand').style.display = 'block';
            this.updateHandDisplay('split-hand', this.playerHands[1]);
        }
        this.playerHands.forEach((hand, index) => {
            const scoreElement = index === 0 ? 'player-score' : 'split-score';
            document.getElementById(scoreElement).textContent = `Score: ${this.calculateHandValue(hand)}`;
        });
        this.updateStats();
        this.updateControls();
    }

    updateHandDisplay(elementId, hand) {
        const element = document.getElementById(elementId);
        element.innerHTML = hand.map(card => {
            if (card.hidden) {
                return '<div class="card">🂠</div>';
            }
            return `<div class="card${card.isRed ? ' red' : ''}">${card.value}${card.suit}</div>`;
        }).join('');
    }

    updateStats() {
        document.getElementById('bankroll').textContent = this.bankroll;
        document.getElementById('current-bet').textContent = this.currentBet;
        document.getElementById('hands-won').textContent = this.handsWon;
    }

    updateControls() {
        const dealButton = document.getElementById('deal');
        const hitButton = document.getElementById('hit');
        const standButton = document.getElementById('stand');
        const doubleButton = document.getElementById('double');
        const splitButton = document.getElementById('split');
        const insuranceButton = document.getElementById('insurance');
        const surrenderButton = document.getElementById('surrender');
        dealButton.disabled = this.gamePhase !== 'betting';
        hitButton.disabled = this.gamePhase !== 'playing';
        standButton.disabled = this.gamePhase !== 'playing';
        doubleButton.disabled = !this.canDouble();
        splitButton.disabled = !this.canSplit();
        insuranceButton.disabled = !this.canInsurance();
        surrenderButton.disabled = !this.canSurrender();
    }

    canDouble() {
        return this.gamePhase === 'playing' && this.playerHands[this.currentHand].length >= 2 && this.bankroll >= this.currentBet;
    }

    canSplit() {
        const hand = this.playerHands[this.currentHand];
        return this.gamePhase === 'playing' && hand.length === 2 && hand[0].value === hand[1].value && this.bankroll >= this.currentBet;
    }

    canInsurance() {
        return this.gamePhase === 'playing' && this.dealerHand[0].value === 'A' && !this.insurance;
    }
    
    canSurrender() {
        return this.gamePhase === 'playing' && this.playerHands[0].length === 2;
    }

    setupEventListeners() {
        document.getElementById('deal').addEventListener('click', () => this.startNewHand());
        document.getElementById('hit').addEventListener('click', () => this.hit());
        document.getElementById('stand').addEventListener('click', () => this.stand());
        document.getElementById('double').addEventListener('click', () => this.doubleDown());
        document.getElementById('split').addEventListener('click', () => this.split());
        document.getElementById('insurance').addEventListener('click', () => this.insurance());
        document.getElementById('surrender').addEventListener('click', () => this.surrender());
        document.getElementById('clear-bet').addEventListener('click', () => this.clearBet());
    }

    NoMoney(amount) {
        if (this.bankroll === 0) {
            setTimeout(() => {
                location.reload();
            }, 3000);
        }
    }

    clearBet() {
        this.currentBet = 0;
        document.getElementById('bet-amount').value = '0';
        this.updateStats();
    }

    addToBet(amount) {
        if (this.bankroll >= amount) {
            this.currentBet += amount;
            document.getElementById('bet-amount').value = this.currentBet;
            this.updateStats();
        }
    }
}
