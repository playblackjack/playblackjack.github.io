letgame;

functionstartGame(role) {
    document.getElementById('role-select').style.display = 'none';
    document.getElementById('game-table').style.display = 'block';
    game = newBlackjackGame();
    game.playerRole = role;
}

functionaddToBet(amount) {
    game.addToBet(amount);
}
