
define(['./d3Renderer', './colors'], function (d3Renderer, colors) {
  var supportedGames = ['Vikings', 'Backgammon', 'Checkers', 'TicTacToe'];
  var that = {};

  that.renderSmallBoardHelper = function (ruleBundleName, board) {
    if (_.contains(supportedGames, ruleBundleName))
      d3Renderer.main(board, {width: 600, height: 600},
        getBoardNodeColors(ruleBundleName), getBoardLinkColors(ruleBundleName));
    else
      console.log('Unsupported RuleBundle: ' + ruleBundleName);
  };

  that.renderLargeBoardHelper = function (ruleBundleName, board) {
    if (_.contains(supportedGames, ruleBundleName))
      d3Renderer.main(board, {width: 1200, height: 1000},
        getBoardNodeColors(ruleBundleName), getBoardLinkColors(ruleBundleName));
    else
      console.log('Unsupported RuleBundle: ' + ruleBundleName);
  };

  var getBoardNodeColors = function (ruleBundleName) {
    switch (ruleBundleName) {
      case 'Vikings':
        return colors.vikingsColor;
      case 'Backgammon':
        return colors.backgammonColor;
      case 'Checkers':
        return colors.checkersColor;
      case 'TicTacToe':
        return colors.grayColor;
    }
  };

  var getBoardLinkColors = function (ruleBundleName) {
    switch (ruleBundleName) {
      case 'TicTacToe':
        return colors.ticTacToeLinkColor;
      default:
        return colors.grayColor;
    }
  };

  return that;
});