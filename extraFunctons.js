let game;

function startGame(role) {
    document.getElementById('role-select').style.display = 'none';
    document.getElementById('game-table').style.display = 'block';
    game = new BlackjackGame();
    game.playerRole = role;
}

function addToBet(amount) {
    game.addToBet(amount);
}