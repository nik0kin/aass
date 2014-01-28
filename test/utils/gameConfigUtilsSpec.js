/**
 * gameConfigUtilsSpec.js
 *
 * Created by niko on 1/26/14.
 */

var should = require('should');

var help = require('./helper'),
  gameConfigUtils = require('../../app/utils/gameConfigUtils');

describe('Utils', function() {
  describe('gameConfigUtils: ', function() {
    describe('validate():', function() {
      var validGameConfig = {
        "name": "SILYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY",
        "numofplayers": 6333,
        "width": 01,
        "height": 313,
        "fog": true,
        "turnstyle": "realtime"
      };
      var validGameConfig2 = {
        "name": "fun game 3v3",
        "numofplayers": 6,
        "width": 40,
        "height": '40',
        "fog": 'false',
        "turnstyle": "realtime"
      };
      var invalidGameConfig = {
        "name": "fun game 3v3",
        "numofplayers": 6,
        "fog": false,
        "turnstyle": "realtime"
      };

      it('should accept a basic gameConfig', function(done) {
        gameConfigUtils.promiseToValidate(validGameConfig)
          .done(function(value) {
            should(value).have.property("height", 313);
            should(value).have.property("fog", true);
            done();
          }, help.shouldThrowHereCallback(done));
      });
      it('should accept a gameConfig with some non-string values as strings', function(done) {
        gameConfigUtils.promiseToValidate(validGameConfig2)
          .done(function(value) {
            should(value).have.property("height", 40);
            should(value).have.property("fog", false);
            done();
          }, help.shouldThrowHereCallback(done));
      });
      it('should reject a string gameConfig', function(done) {
        gameConfigUtils.promiseToValidate('dong')
          .done(help.shouldntThrowHereCallback, help.shouldThrowHereCallback(done));
      });
      it('should reject a gameConfig missing 2 parameters', function(done) {
        gameConfigUtils.promiseToValidate(invalidGameConfig)
          .done(help.shouldntThrowHereCallback, help.shouldThrowHereCallback(done));
      });
    });
  });
})