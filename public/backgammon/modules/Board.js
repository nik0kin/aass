
define(['Loader'], function (Loader) {
  var boardImage = 'assets/board.png',
    shaker = {
      src: 'assets/shaker.png',
      bitmap: null,
      x: 900/2 - 50,
      y: 600/2 - 50
    };

  var dieImages = {
    die1: 'assets/images/dice-1.png',
    die2: 'assets/images/dice-2.png',
    die3: 'assets/images/dice-3.png',
    die4: 'assets/images/dice-4.png',
    die5: 'assets/images/dice-5.png',
    die6: 'assets/images/dice-6.png'
  };

  var indicatorImages = {
    selection: 'assets/indicator-selection.png',
    move: 'assets/indicator-move.png',
    knock: 'assets/indicator-knock.png'
  };

  var piecesImages = {
      black_piece: 'assets/images/piece-blue.png',
      red_piece: 'assets/images/piece-orange.png'
    },
    tokenOffset = {x: 10, y: 10},
    size = {x: 900, y: 600},
    clickAreaPosOffset = {x: -10, topY: -10, botY: -220},
    clickAreaSize = {x: 50, y: 270},
    w1 = 85, h1 = 100,
    diceClickAreaRect = {x: size.x/2 - w1/2, y: size.y/2 - h1/2, w: w1, h: h1},
    topJailClickAreaRect = {x: size.x/2 - w1/2, y: 0, w: w1, h: size.y/2 - h1/2},
    botJailClickAreaRect = {x: size.x/2 - w1/2, y: size.y/2 + h1/2, w: w1, h: size.y/2 - h1/2},
    die1Pos = {x: 415, y: 280},
    die2Pos = {x: 455, y: 280},
    maxMoveLocationsForOneToken = 4;

  var pieceStartLocations = {
      'blackJail': {
        x: botJailClickAreaRect.x + botJailClickAreaRect.w/2,
        y: botJailClickAreaRect.y + botJailClickAreaRect.h - 30
      },
      'redJail': {
        x: topJailClickAreaRect.x + topJailClickAreaRect.w/2,
        y: topJailClickAreaRect.y + 30
      },

      1: {x: 845, y: 540},
      2: {x: 785, y: 540},
      3: {x: 720, y: 540},
      4: {x: 655, y: 540},
      5: {x: 595, y: 540},
      6: {x: 525, y: 540},

      7: {x: 350, y: 540},
      8: {x: 285, y: 540},
      9: {x: 225, y: 540},
      10: {x: 165, y: 540},
      11: {x: 105, y: 540},
      12: {x: 30, y: 540},

      13: {x: 30, y: 20},
      14: {x: 105, y: 20},
      15: {x: 165, y: 20},
      16: {x: 225, y: 20},
      17: {x: 285, y: 20},
      18: {x: 350, y: 20},

      19: {x: 525, y: 20},
      20: {x: 595, y: 20},
      21: {x: 655, y: 20},
      22: {x: 720, y: 20},
      23: {x: 785, y: 20},
      24: {x: 845, y: 20}
    },
    pieceSeperation = 30;

  var Board = function (params) {
    var that = new createjs.Container();

    var mainClickCallback = params.mainClickCallback;

    var die1Bitmap, die2Bitmap,
      tokenBitmaps = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
      jailBitmaps = {
        'redJail': [],
        'blackJail': []
      },
      selectionBitmap,
      moveIndicatorBitmapArray, knockIndicatorBitmapArray;

    function init () {
      var simpleBoard = getSimpleBackgammonBoardFromGameBoard(params.size, params.gameState.spaces, params.gameState.pieces);

      that.drawBackground();

      //dice objs
      die1Bitmap = new createjs.Bitmap(dieImages.die1);
      die1Bitmap.x = die1Pos.x;
      die1Bitmap.y = die1Pos.y;
      that.addChild(die1Bitmap);
      die2Bitmap = new createjs.Bitmap(dieImages.die1);
      die2Bitmap.x = die2Pos.x;
      die2Bitmap.y = die2Pos.y;
      that.addChild(die2Bitmap);

      // create shaker obj
      shaker.bitmap = new createjs.Bitmap(shaker.src);
      shaker.bitmap.x = shaker.x;
      shaker.bitmap.y = shaker.y;
      shaker.bitmap.visible = false;
      that.addChild(shaker.bitmap);

      //indicator bitmaps
      selectionBitmap = new createjs.Bitmap(indicatorImages.selection);
      selectionBitmap.visible = false;
      that.addChild(selectionBitmap);

      moveIndicatorBitmapArray = [];
      _(maxMoveLocationsForOneToken).times(function () {
        var bitmap = new createjs.Bitmap(indicatorImages.move);
        bitmap.visible = false;
        that.addChild(bitmap);
        moveIndicatorBitmapArray.push(bitmap);
      });

      knockIndicatorBitmapArray = [];
      _(maxMoveLocationsForOneToken).times(function () {
        var bitmap = new createjs.Bitmap(indicatorImages.knock);
        bitmap.visible = false;
        that.addChild(bitmap);
        knockIndicatorBitmapArray.push(bitmap);
      });

      _.each(simpleBoard, function (tokenInfo, spaceId) {
        that.drawTokens(tokenInfo.player === 'p1' ? 'black' : 'red', spaceId, tokenInfo.amt);
      });

      that.on('click', function (evt) {
        that.clickedSpace(evt.stageX, evt.stageY);
      });
    }

    that.drawBackground = function () {
      var newBitmap = new createjs.Bitmap(boardImage);
      newBitmap.x = 0;
      newBitmap.y = 0;
      that.addChild(newBitmap);
    };

    var getTokenPixelPosition = function (spaceId, tokensOnSpot) {
      var l = pieceStartLocations[spaceId],
        upOrDownModifier = (spaceId === 'redJail' || parseInt(spaceId) > 12) ? 1 : -1; 

      return {
        x: l.x - tokenOffset.x,
        y: l.y + tokensOnSpot * pieceSeperation * upOrDownModifier - tokenOffset.y
      }
    };

    var getTokenBitmapArray = function (spaceId) {
      if (!isNaN(parseInt(spaceId))) {
          return tokenBitmaps[parseInt(spaceId) - 1];
        } else {
          return jailBitmaps[spaceId];
        }
    };

    that.drawTokens = function (color, loc, amt) {
      var i;

      for (i=0; i<amt; i++) {
        var newBitmap = new createjs.Bitmap(piecesImages[color === 'red' ? 'red_piece' : 'black_piece']),
          pos = getTokenPixelPosition(loc, i);

        newBitmap.x = pos.x;
        newBitmap.y = pos.y;
        that.addChild(newBitmap);

        // adjust token bitmap arrays
        var tokenBitmap = getTokenBitmapArray(loc);
        tokenBitmap.push(newBitmap);
      }
    };

    that.moveToken = function (pieceId, currentSpaceId, destSpaceId) {
      var currentSpaceTokenBitmapArray = getTokenBitmapArray(currentSpaceId),
        aToken = currentSpaceTokenBitmapArray.pop();

        if (aToken) {
          var nextSpaceTokenBitmapArray = getTokenBitmapArray(destSpaceId),
            pos = getTokenPixelPosition(destSpaceId, nextSpaceTokenBitmapArray.length);
          aToken.x = pos.x;
          aToken.y = pos.y;
          nextSpaceTokenBitmapArray.push(aToken);
        } else {
          throw 'CANT move no tokens';
        }
    };

    var isBetween = function (num, low, high) {
      return num >= low && num <= high;
    };
    that.showShaker = function (trueOrFalse) {
      trueOrFalse = typeof(trueOrFalse) !== 'undefined' ? trueOrFalse : true; // use true if no trueOrFalse parameter
      shaker.bitmap.visible = !!trueOrFalse;
    };

    that.clickedSpace = function (x, y) {
      //console.log('clicked ' + x + ', ' + y);

      // check spaces
      _.each(pieceStartLocations, function (startLocation, pieceNumber) {
        var left = startLocation.x + clickAreaPosOffset.x,
          right = startLocation.x + clickAreaPosOffset.x + clickAreaSize.x,
          up = startLocation.y + (pieceNumber > 12 ? clickAreaPosOffset.topY : clickAreaPosOffset.botY),
          down = up + clickAreaSize.y;

          /* //UNCOMMENT for hit boxes rectangles
          var shape = new createjs.Shape();
          shape.graphics.beginFill("#ff0000").drawRect(left, up, clickAreaSize.x, clickAreaSize.y);
          that.addChild(shape);
          */

        if (isBetween(x, left, right) && isBetween(y, up, down)) {
          mainClickCallback(pieceNumber);
        }
      });

      // check dice spot
      if (isBetween(x, diceClickAreaRect.x, diceClickAreaRect.x + diceClickAreaRect.w) && 
        isBetween(y, diceClickAreaRect.y, diceClickAreaRect.y + diceClickAreaRect.h) ) {
        mainClickCallback('dice');
      }
      /* //UNCOMMENT for hit boxes rectangles
      var shape = new createjs.Shape();
      shape.graphics.beginFill("#ff0000").drawRect(diceClickAreaRect.x, diceClickAreaRect.y, diceClickAreaRect.w, diceClickAreaRect.h);
      that.addChild(shape);
      */

      // check top jail
      if (isBetween(x, topJailClickAreaRect.x, topJailClickAreaRect.x + topJailClickAreaRect.w) && 
        isBetween(y, topJailClickAreaRect.y, topJailClickAreaRect.y + topJailClickAreaRect.h) ) {
        mainClickCallback('topJail');
      }
      /* //UNCOMMENT for hit boxes rectangles
      var shape2 = new createjs.Shape();
      shape2.graphics.beginFill("#0000ff").drawRect(topJailClickAreaRect.x, topJailClickAreaRect.y, topJailClickAreaRect.w, topJailClickAreaRect.h);
      that.addChild(shape2);
      */

      // check bottom jail
      if (isBetween(x, botJailClickAreaRect.x, botJailClickAreaRect.x + botJailClickAreaRect.w) && 
        isBetween(y, botJailClickAreaRect.y, botJailClickAreaRect.y + botJailClickAreaRect.h) ) {
        mainClickCallback('botJail');
      }
      /* //UNCOMMENT for hit boxes rectangles
      var shape3 = new createjs.Shape();
      shape3.graphics.beginFill("#0000ff").drawRect(botJailClickAreaRect.x, botJailClickAreaRect.y, botJailClickAreaRect.w, botJailClickAreaRect.h);
      that.addChild(shape3);
      */
    };

    that.showRoll = function (roll) {
      console.log('Roll: ' + roll.die1 + ' ' + roll.die2);
      var roll1Image = dieImages['die' + roll.die1];
      die1Bitmap.image.src = roll1Image;
      var roll2Image = dieImages['die' + roll.die2];
      die2Bitmap.image.src = roll2Image;
    };

    //////// INDICATORS //////////////
    that.showSelection = function (spaceId) {
      console.log('showSelection');

      var spaceCenterCoords = getTokenPixelPosition(spaceId, 3);
      selectionBitmap.x = spaceCenterCoords.x - 80;
      selectionBitmap.y = spaceCenterCoords.y;
      selectionBitmap.visible = true;
    };

    that.stopSelection = function () {
      console.log('stopSelection')
      selectionBitmap.visible = false;
    };

    that.showMoveLocationSpaces = function (spaceIdArray) {
      console.log('showMoveLocationSpaces ' + JSON.stringify(spaceIdArray));
      var i = 0;
      _.each(spaceIdArray, function (spaceId) {
        var spaceCenterCoords = getTokenPixelPosition(spaceId, 3),
          bitmap = moveIndicatorBitmapArray[i++];
        bitmap.x = spaceCenterCoords.x - 80;
        bitmap.y = spaceCenterCoords.y;
        bitmap.visible = true;
      });
    };

    that.stopMoveLocationSpaces = function () {
      _.each(moveIndicatorBitmapArray, function (bitmap) {
        bitmap.visible = false;
      });
    };

    that.showKnockMoveLocationSpaces = function (spaceIdArray) {
      console.log('showKnockMoveLocationSpaces ' + JSON.stringify(spaceIdArray));
      var i = 0;
      _.each(spaceIdArray, function (spaceId) {
        var spaceCenterCoords = getTokenPixelPosition(spaceId, 3),
          bitmap = knockIndicatorBitmapArray[i++];
        bitmap.x = spaceCenterCoords.x - 80;
        bitmap.y = spaceCenterCoords.y;
        bitmap.visible = true;
      });
    };

    that.stopKnockMoveLocationSpaces = function () {
      _.each(knockIndicatorBitmapArray, function (bitmap) {
        bitmap.visible = false;
      });
    };

    that.stopAllMoveLocationIndicators = function () {
      that.stopSelection();
      that.stopMoveLocationSpaces();
      that.stopKnockMoveLocationSpaces();
    };


    init();
    return that;
  };

  var getSimpleBackgammonBoardFromGameBoard = function (size, spaces, pieces) {

    var board = {};

    _.each(spaces, function (value) {
      var loc = value.boardSpaceId;
      board[loc] = {}
    });

    _.each(pieces, function (value) {
      board[value.locationId].player = value.ownerId;
      board[value.locationId].amt = board[value.locationId].amt ? board[value.locationId].amt + 1 : 1;
    });

    return board;
  };

  return Board;
});