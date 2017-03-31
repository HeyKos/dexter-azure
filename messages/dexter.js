'use strict';

var _       = require('lodash'),
    Pokedex = require('pokedex-promise-v2');

module.exports = (function() {
  
  var Dexter = (function() {

    function Dexter(builder) {
      // Loop through all the properties of the class and re-assign the functions to bind "this" to maintain scope throughout.
      _.forOwn(proto, function(value, key) {
        if(_.isFunction(proto[key])) {
          proto[key] = proto[key].bind(this);
        }
      }.bind(this));
      proto._pokedex = new Pokedex();
      proto._builder = builder;
    }

    var proto = {
      // Constants
      // ---------

      languageStrings:  {
        "POKEMON_NOT_FOUND_MESSAGE":  "I\'m sorry, I could not locate that Pokémon in my memory bank."
      },


      // Variables
      // ---------

      _builder:          null,
      _pokedex:          null,
      _pokemonName:      null,
      _session:          null,


      // Handlers
      // ---------

      defaultHandler: function(session) {
        session.send('Sorry, I did not understand \'%s\'.', session.message.text);
      },

      pokedexHandler: function (session, args) {
        var pokemonEntity  = this.builder.EntityRecognizer.findEntity(args.entities, 'Pokémon'); 
        this._pokemonName = pokemonEntity ? pokemonEntity.entity.toLowerCase() : null,
        this._session = session;
        this._pokedex.getPokemonSpeciesByName(this._pokemonName)
        .then(this._onPokemonFound)
        .catch(this._onPokemonError);
      }, 
      

      // Event Handlers
      // --------------
      _onPokemonFound: function(response) {
        var pokedexEntry = null,
            pokedexData = "";
            
        if(response && response.flavor_text_entries && response.flavor_text_entries.length > 0) {
          pokedexEntry = _.find(response.flavor_text_entries, function(entry) {
            return entry.language.name === "en" && entry.version.name === "blue";
          });

          pokedexData = "Pokédex info for " + this._pokemonName + ". " + pokedexEntry.flavor_text + "";
          // Remove new lines and tabs.
          while(pokedexData.indexOf("\n") > -1) {
            pokedexData = _.replace(pokedexData, "\n", " ");
          }
          while(pokedexData.indexOf("\f") > -1) {
            pokedexData = _.replace(pokedexData, "\f", " ");
          }
          this._session.send(pokedexData);
        }
        else {
          this._session.send("No data exists for " + this._pokemonName + ".");
        }
      },

      _onPokemonError: function(error) {
        if(this._pokemonName !== "") {
          this._session.send("No data exists for " + this._pokemonName + ".");
        }
        else {
          this._session.send(this.languageStrings.POKEMON_NOT_FOUND_MESSAGE);
        }
      }
    }

    Dexter.prototype = proto;
    return Dexter;

  })();

  return Dexter;

})();