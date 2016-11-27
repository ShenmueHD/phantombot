/**
 * flirtCommand.js
 *
 * Viewers can show each other the love of REAL friends by expressing it in pain.
 */
(function() {
    var selfMessageCount = 0,
        otherMessageCount = 0,
        lastRandom = -1,
        jailTimeout = $.getSetIniDbNumber('settings', 'flirtTimeoutTime', 60),
        lang,
        rand;

    /**
     * @function loadResponses
     */
    function loadResponses() {
        var i;
        for (i = 1; $.lang.exists('flirtcommand.self.' + i); i++) {
            selfMessageCount++;
        }
        for (i = 1; $.lang.exists('flirtcommand.other.' + i); i++) {
            otherMessageCount++;
        }
        $.consoleDebug($.lang.get('flirtcommand.console.loaded', selfMessageCount, otherMessageCount));
    };

    function selfflirt(sender) {
        do {
            rand = $.randRange(1, selfMessageCount);
        } while (rand == lastRandom);
        $.say($.lang.get('flirtcommand.self.' + rand, $.resolveRank(sender)));
        lastRandom = rand;
    };

    function flirt(sender, user) {
        do {
            rand = $.randRange(1, otherMessageCount);
        } while (rand == lastRandom);
        lang = $.lang.get('flirtcommand.other.' + rand, $.resolveRank(sender), $.resolveRank(user), jailTimeout, $.botName);
        if (lang.startsWith('(jail)')) {
            lang = $.replace(lang, '(jail)', '');
            $.say(lang);
            if (!$.isMod(sender) && jailTimeout > 0) {
                setTimeout(function () {
                    $.say('.timeout ' + sender + ' ' + jailTimeout);
                }, 1500);
            }
        } else {
            $.say(lang);
        }
        lastRandom = rand;
    };

    /**
     * @event command
     */
    $.bind('command', function(event) {
        var sender = event.getSender().toLowerCase(),
            command = event.getCommand(),
            args = event.getArgs();

        /**
         * @commandpath flirt [username] - flirt a fellow viewer (not for real!), omit the username to flirt yourself
         */
        if (command.equalsIgnoreCase('flirt')) {
            if (args.length <= 0 || args[0].toLowerCase() == sender) {
                selfflirt(sender);
            } else {
                flirt(sender, args[0]);
            }
        }

        /**
         * @commandpath jailtimeouttime [amount in seconds] - Set the timeout time for jail time on the flirt command.
         */
        if (command.equalsIgnoreCase('jailtimeouttime')) {
            if (args.length == 0) {
                $.say($.whisperPrefix(sender) + $.lang.get('flirtcommand.jail.timeout.usage'));
                return;
            }

            jailTimeout = args[0];
            $.inidb.set('settings', 'flirtTimeoutTime', args[0]);
            $.say($.whisperPrefix(sender) + $.lang.get('flirtcommand.jail.timeout.set', jailTimeout));
        }
    });

    /**
     * @event initReady
     */
    $.bind('initReady', function() {
        if ($.bot.isModuleEnabled('./games/flirtCommand.js')) {
            if (selfMessageCount == 0 && otherMessageCount == 0) {
               loadResponses();
            }
            $.registerChatCommand('./games/flirtCommand.js', 'flirt', 7);
            $.registerChatCommand('./games/flirtCommand.js', 'jailtimeouttime', 1);
        }
    });
})();
