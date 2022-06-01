class Player {
    constructor(document) {
        this.document = document;
        this.template = this.document.querySelector('#player-template');

        this.instances = [];

    }

    createPlayer() {
        const element = document
            .importNode(this.template.content, true)
            .children[0];

        const game = new Game(element);

        this.document.body.appendChild(game.element);

        this.instances.push(game);

        return game;
    }

    removePlayer(game) {
        this.document.body.removeChild(game.element);

        this.instances = this.instances.filter(instance => instance !== game);
    }

    sortPlayers(tetri) {
        tetri.forEach(game => {
            this.document.body.appendChild(game.element);
        });
    }
}