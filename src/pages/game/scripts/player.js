class Player {
  constructor(document) {
    this.document = document;
    this.template = this.document.querySelector("#player-template");

    this.instances = [];
  }

  createPlayer(id) {
    const element = document.importNode(this.template.content, true)
      .children[0];

    const game = new Game(element);

    const gameWrap = this.document.querySelector(".game-wrap");
    if (id) {
      game.element.querySelector("#play").classList.add(id);
    } else {
      game.element.querySelector("#play").classList.add("myself");
    }
    if (gameWrap.childElementCount > 1) {
      gameWrap.prepend(game.element);
    } else {
      gameWrap.appendChild(game.element);
    }
    // this.document.body.appendChild(game.element);

    this.instances.push(game);

    return game;
  }

  removePlayer(game) {
    this.document.body.removeChild(game.element);

    this.instances = this.instances.filter((instance) => instance !== game);
  }

  // sortPlayers(tetri) {
  //     tetri.forEach(game => {
  //         this.document.body.appendChild(game.element);
  //     });
  // }
}
