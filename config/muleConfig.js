module.exports = {
  minimumGameRoundTimerCheck: 10, //seconds
  minimumAutoCreateGameTimerCheck: 30,
  ruleBundles: 
    {
      'CheCkers': {},
      'BackGammon': {
        autoCreateGame: {
          name: 'HARDCORE BACKGAMMON 1v1',
          maxPlayers: 2, // TODO dont require putting properties for properties that are static via the rulebundle (must have 2 players in backgammon)
          turnProgressStyle: 'waitprogress', // also dont let them override it
          turnTimeLimit: 99999,
          ruleBundleGameSettings: {customBoardSettings: {}}
        }
      },
      'VIKINGS': {},
      'tictactoe': {},
      'monopoly': {},
      'mulesprawl': {
        autoCreateGame: {
          name: 'auto mulesprawl game',
          maxPlayers: 1,
          turnProgressStyle: 'autoprogress',
          turnTimeLimit: 15,
          ruleBundleGameSettings: {customBoardSettings: { width: 30, height: 30 }}
        }
      }
    }
};