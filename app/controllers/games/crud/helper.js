/**
 * controllers/games/crud/helper.js
 *
 * Created by niko on 1/22/14.
 */

var _ = require('underscore'),
  Q = require('q'),
  winston = require('winston');

var utils = require('mule-utils/jsonUtils'),
  Game = require('mule-models').Game.Model,
  RuleBundleUtils = require('mule-models/models/RuleBundle/util'),
  integerUtils = require('mule-utils/integerUtils');

exports.indexQ = function () {
  return Game.find().execQ();
};

exports.createQ = function (params) {    //TODO this is starting to look ugly
  var validatedParams = params.validatedParams;
  var creator = params.creator;//expecting a user

  return Q.promise( function (resolve, reject) {
    winston.info("User attempting to create new game: params: ", validatedParams );

    validatedParams.gameStatus = 'open';

    var newGame = new Game(validatedParams);

    RuleBundleUtils.findRuleBundleByIdOrNameQ(validatedParams.ruleBundle)
      .done(function (foundRuleBundle) {
        // valid rulebundle
        newGame.ruleBundle = {
          id : foundRuleBundle._id,
          name : foundRuleBundle.name
        };
        newGame.markModified('ruleBundle'); // is the line nessacary

        //set maxPlayers
        if (integerUtils.isInt(foundRuleBundle.gameSettings.playerLimit)) {
          newGame.maxPlayers = foundRuleBundle.gameSettings.playerLimit;
        } else if (integerUtils.isMinMaxIntegerObject(foundRuleBundle.gameSettings.playerLimit)) {
          if (integerUtils.isIntegerMinMaxValid(newGame.maxPlayers, foundRuleBundle.gameSettings.playerLimit)) {
            //valid maxPlayers
          } else
            return reject('playerMax not within RoleBundle min-max playerLimit')
        } //else rulebundle maxPLayers not set

        newGame.validate( function (err) {
          if (err) {
            winston.log('error', 'ValidationError for gameConfigs to Game document');
            return reject(err);
          }

          if (!creator) {
            winston.info('doing unit tests');
            newGame.saveQ()
              .done(resolve, reject);
          } else {
            winston.info('creating game with creator: ', creator._doc);
            newGame.joinGameQ(creator)
              .done(function () {
                newGame.saveQ()
                  .done(resolve, reject);
              }, reject);
          }
        });
      }, function (err) {
        winston.error(err);
        reject('invalid ruleBundle id or name')
      });
  });
};

exports.readQ = function (gameID){
  return Game.findByIdQ(gameID);
};

exports.update = function (parameters, callback) {

};

exports.destroy = function (parameters, callback) {

};
