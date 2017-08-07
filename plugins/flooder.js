var moduleSwitch = require("../settings/settings.js").moduleSwitch;
var KEYWORDS = require("../settings/settings.js").keywords;

// source: https://github.com/kosmodrey/telebot/
// modified by Frank Kim for compatibility under es6
// and to filter photo flooder as well as text.
/*
  Name: Flooder
  Description: Simple flood protection module.
  Module options: {
    flood: {
      interval: 1, // In seconds
      message: 'Flood message.' // Message
    }
  }
  NOTE: Received Telegram message time accuracy is one second!
*/

// Store users
var userList = {};

// Export bot module
module.exports = {
    id: 'floodProtection',
    defaultConfig: {
        interval: 1,
        message: 'Too many messages, relax!',
        numMsgs: 1
    },
    plugin(bot, cfg) {
      // Load config data
      var opt = cfg.flooder || {};
      var interval = Number(opt.interval) || 1;
      var numMsgs = Number(opt.numMsgs) || 1;
      var text = opt.message === undefined ?
        'Too many messages from you. Please, try later...' :
          opt.message;

      // Create message modifier
      bot.mod('message', function(data) {

        var msg = data.message;
        var id = msg.chat.id;
        var user = userList[id];
        var now = new Date(msg.date);

        //ignore irrelevant group messages
        if(msg.chat.type != "private"){
          if(!msg.photo && (msg.text && 
            KEYWORDS.indexOf(msg.text.toLowerCase()) == -1))
              return data;
        }

        if (user) {
          var diff = now - user.lastTime;
          user.lastTime = now;
          user.numMsgs = (user.numMsgs || 0) + 1;
          if (diff <= interval && user.numMsgs > numMsgs) {
            if (!user.flood) {
              if (text && msg.chat.type == "private") 
                bot.sendMessage(id, text, {notify: moduleSwitch.flooder.notify});
              user.flood = true;
            }
            msg = {};
            data.photo = undefined;
          } else {
            user.flood = false;
          }
        } else {
          userList[id] = { lastTime: now };
        }

        return data;

      });
    }
};