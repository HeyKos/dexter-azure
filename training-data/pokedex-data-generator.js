'use strict';

var _            = require('lodash'),
    fs           = require('fs'),
    PokemonNames = require('./pokemon-list.js');

module.exports = (function() {
  
  var PokedexDataGenerator = (function() {

    function PokedexDataGenerator() {
      // Loop through all the properties of the class and re-assign the functions to bind "this" to maintain scope throughout.
      _.forOwn(proto, function(value, key) {
        if(_.isFunction(proto[key])) {
          proto[key] = proto[key].bind(this);
        }
      }.bind(this));
    }

    var proto = {
      // Constants
      // ---------
      PHRASES: [
        "look up {{pokemon}}",
        "give me data on {{pokemon}}",
        "{{pokemon}} data",
        "give me pokédex data on {{pokemon}}",
        "pokédex data for {{pokemon}}",
        "what is a {{pokemon}}?"
      ],


      // Variables
      // ---------
      _currentPokemon: "",
      _luisData: [],

      // Public Functions
      // ----------------
      saveLuisTrainingData: function() {
        _.forEach(PokemonNames.pokemon, this._addPokemonLuisData);
        if(this._luisData.length === 0) {
          console.log("No data to save.");
          return;
        }

        fs.writeFile("../training-data/training-data.json", JSON.stringify(this._luisData), function(err) {
          if(err) {
            return console.log(err);
          }
          console.log("LUIS training data saved.");
        }); 
      },


      // Private Functions
      // -----------------
      _addLuisDataForPhase: function(phrase) {
        var data = this._getLuisDataForPhase(phrase);
        if(data !== null) {
          this._luisData.push(data);
        }
      },

      _addPokemonLuisData: function(pokemonName) {
        this._currentPokemon = pokemonName;
        _.forEach(this.PHRASES, this._addLuisDataForPhase);
      },

      _getLuisDataForPhase: function(phrase) {
            var data     = {},
            isValid      = this._isPhraseDataValid(this._currentPokemon, phrase),
            nameEnd      = -1,
            nameLength   = 0,
            nameStart    = 0,
            replacedText = "";
        
        if(!isValid) {
          return null;
        }
        
        nameLength = this._currentPokemon.length;
        nameStart = phrase.indexOf("{{pokemon}}");
        nameEnd = nameStart + nameLength - 1;
        // Set training data.
        data.text = phrase.replace(/{{pokemon}}/g, this._currentPokemon);
        data.intent = "pokedex"
        
        data.entities = [];
        data.entities.push({
          "entity":   "Pokémon",
          "startPos": nameStart,
          "endPos":   nameEnd
        });
        
        return data;
      },

      _isPhraseDataValid: function(pokemonName, phrase) {
        // Verify that there is a current pokemon set.
        if(!pokemonName || pokemonName.length === 0) {
          return false;
        }
        // Verify that the phrase includes a token {{pokemon}}
        if(phrase.indexOf("{{pokemon}}") < 0) {
          return false;
        }
        return true;
      }
    }

    PokedexDataGenerator.prototype = proto;
    return PokedexDataGenerator;

  })();

  return PokedexDataGenerator;

})();