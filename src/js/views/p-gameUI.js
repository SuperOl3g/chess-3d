import $        from 'jquery';
import _        from 'underscore';
import Backbone from 'Backbone';

import * as Pieces            from "./../models/pieces/pieces";
import PieceCollection        from './../collections/pieceCollection';
import LoggerView             from './p-gameUI__logger';
import PieceView              from './p-gameUI__piece';
import MyPieceView            from './p-gameUI__piece--my';
import PawnPromotionModalView from './p-gameUI__promotion-modal';

let GameUIView = Backbone.View.extend({

  className: 'deck',
  template: _.template($('#deck-template').html()),

  render: function() {
    this.$el.html( this.template() );
    let subViews = this.subViews.map( (childView) => childView.render().el );
    this.$el.append(subViews);
    return this;
  },

  initialize: function (myColor) {
    let sides = {};

    sides['white'] = new PieceCollection();
    sides['black'] = new PieceCollection();

    this.subViews = [];

    this.subViews.push( new LoggerView(sides['white'], sides['black']) );

    Object.keys(sides).forEach( (color) => {
      if (color == myColor)
        sides[color].on('add', (piece) => this.subViews.push(new MyPieceView({model: piece})) );
      else
        sides[color].on('add', (piece) => this.subViews.push(new PieceView({model: piece})) );

      sides[color].on('pawnOnLastRank', (pawn) => this.subViews.push(new PawnPromotionModalView({model: pawn})) );
    });

    sides['white'].push([
      new Pieces.Pawn   ({x:0, y:1, color:'white', enemyCollection: sides['black']}),
      new Pieces.Pawn   ({x:1, y:1, color:'white', enemyCollection: sides['black']}),
      new Pieces.Pawn   ({x:2, y:1, color:'white', enemyCollection: sides['black']}),
      new Pieces.Pawn   ({x:3, y:1, color:'white', enemyCollection: sides['black']}),
      new Pieces.Pawn   ({x:4, y:1, color:'white', enemyCollection: sides['black']}),
      new Pieces.Pawn   ({x:5, y:1, color:'white', enemyCollection: sides['black']}),
      new Pieces.Pawn   ({x:6, y:1, color:'white', enemyCollection: sides['black']}),
      new Pieces.Pawn   ({x:7, y:1, color:'white', enemyCollection: sides['black']}),
      new Pieces.Rook   ({x:0, y:0, color:'white', enemyCollection: sides['black']}),
      new Pieces.Rook   ({x:7, y:0, color:'white', enemyCollection: sides['black']}),
      new Pieces.Knight ({x:1, y:0, color:'white', enemyCollection: sides['black']}),
      new Pieces.Knight ({x:6, y:0, color:'white', enemyCollection: sides['black']}),
      new Pieces.Bishop ({x:2, y:0, color:'white', enemyCollection: sides['black']}),
      new Pieces.Bishop ({x:5, y:0, color:'white', enemyCollection: sides['black']}),
      new Pieces.Queen  ({x:4, y:0, color:'white', enemyCollection: sides['black']}),
      new Pieces.King   ({x:3, y:0, color:'white', enemyCollection: sides['black']}),
    ]);


  sides['black'].push([
      new Pieces.Pawn   ({x:0, y:6, color:'black', enemyCollection: sides['white']}),
      new Pieces.Pawn   ({x:1, y:6, color:'black', enemyCollection: sides['white']}),
      new Pieces.Pawn   ({x:2, y:6, color:'black', enemyCollection: sides['white']}),
      new Pieces.Pawn   ({x:3, y:6, color:'black', enemyCollection: sides['white']}),
      new Pieces.Pawn   ({x:4, y:6, color:'black', enemyCollection: sides['white']}),
      new Pieces.Pawn   ({x:5, y:6, color:'black', enemyCollection: sides['white']}),
      new Pieces.Pawn   ({x:6, y:6, color:'black', enemyCollection: sides['white']}),
      new Pieces.Pawn   ({x:7, y:6, color:'black', enemyCollection: sides['white']}),
      new Pieces.Rook   ({x:0, y:7, color:'black', enemyCollection: sides['white']}),
      new Pieces.Rook   ({x:7, y:7, color:'black', enemyCollection: sides['white']}),
      new Pieces.Knight ({x:1, y:7, color:'black', enemyCollection: sides['white']}),
      new Pieces.Knight ({x:6, y:7, color:'black', enemyCollection: sides['white']}),
      new Pieces.Bishop ({x:2, y:7, color:'black', enemyCollection: sides['white']}),
      new Pieces.Bishop ({x:5, y:7, color:'black', enemyCollection: sides['white']}),
      new Pieces.Queen  ({x:4, y:7, color:'black', enemyCollection: sides['white']}),
      new Pieces.King   ({x:3, y:7, color:'black', enemyCollection: sides['white']}),
    ]);

    if (myColor) {
      sides[myColor].on('move', (piece) => {
          socket.emit('turn_move', {
            from: {
              x: piece.previous('x'),
              y: piece.previous('y'),
            },
            to: {
              x: piece.attributes.x,
              y: piece.attributes.y
            }
          });
      });
    };

    socket.on('player_move', (response) => {
      console.info(response.from);
      var movingPiece = sides[response.playerColor].getPieceAt(response.from.x, response.from.y);
      movingPiece.moveTo(response.to.x, response.to.y);
    });

    socket.on('game_end', (response) => console.info(`Игра окончена: ${response}`) );
  }
});

export default GameUIView;