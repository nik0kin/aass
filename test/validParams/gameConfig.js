var gameConfigArray = [];

exports.validGameConfig = {
  name : "niks checkers game",
  ruleBundle : {
    name : 'Checkers'
  },
  //don't need max players when playing checkers

  ruleBundleGameSettings : {
    customBoardSettings : {
      size : 8
    }
  }
};

gameConfigArray.push(exports.validGameConfig);

exports.validGameParams = gameConfigArray;