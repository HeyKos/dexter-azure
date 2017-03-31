/*-----------------------------------------------------------------------------
This template demonstrates how to use an IntentDialog with a LuisRecognizer to add 
natural language support to a bot. 
For a complete walkthrough of creating this type of bot see the article at
http://docs.botframework.com/builder/node/guides/understanding-natural-language/
-----------------------------------------------------------------------------*/
"use strict";
var bot              = null,
    builder          = require("botbuilder"),
    botbuilder_azure = require("botbuilder-azure"),
    connector        = null,
    Dexter           = require('./dexter.js'),
    dexterBot        = null,
    intents          = null,
    luisAPIKey       = null,
    luisAPIHostName  = null,
    luisAppId        = null,
    recognizer       = null,
    useEmulator      = null;

useEmulator = (process.env.NODE_ENV == 'development');

connector = useEmulator ? new builder.ChatConnector({appId: "46b03732-11b2-454e-9966-69b52a33f749", appPassword: "om4TNgjfzks2L2qkX2V56ms"}) : new botbuilder_azure.BotServiceConnector({
    appId:          process.env['MicrosoftAppId'],
    appPassword:    process.env['MicrosoftAppPassword'],
    stateEndpoint:  process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

bot       = new builder.UniversalBot(connector);
dexterBot = new Dexter(builder);
// Make sure you add code to validate these fields
luisAppId       = process.env.LuisAppId;
luisAPIKey      = process.env.LuisAPIKey;
luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

// Main dialog with LUIS
recognizer = new builder.LuisRecognizer(LuisModelUrl);
intents = new builder.IntentDialog({ recognizers: [recognizer] })
            .matches("pokedex", dexterBot.pokedexHandler)
            .onDefault(dexterBot.defaultHandler);

bot.dialog('/', intents);    

if (useEmulator) {
    var restify = require('restify'),
        server  = restify.createServer();

    server.listen(3978, function() {
        console.log('test bot endpoint at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} 
else {
    module.exports = { default: connector.listen() }
}