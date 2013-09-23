/*
 * Strip whitespace extension for Cloud9 IDE
 *
 * @author Mostafa Eweda <mostafa@c9.io>
 * @copyright 2013, Ajax.org B.V.
 */
define(function(require, exports, module) {
    main.consumes = [
        "Plugin", "menus", "commands", "tabManager", "settings",
        "preferences", "save", "ui"
    ];
    main.provides = ["stripws"];
    return main;

    function main(options, imports, register) {
        var Plugin   = imports.Plugin;
        var menus    = imports.menus;
        var commands = imports.commands;
        var tabs     = imports.tabManager;
        var settings = imports.settings;
        var prefs    = imports.preferences;
        var save     = imports.save;
        var ui       = imports.ui;

        var whitespaceUtil = require("ace/ext/whitespace");

        /***** Initialization *****/

        var plugin = new Plugin("Ajax.org", main.consumes);
        // var emit   = plugin.getEmitter();
        
        var disabled = false;

        var loaded = false;
        function load(){
            if (loaded) return false;
            loaded = true;

            commands.addCommand({
                name        : "stripws",
                hint        : "strip whitespace at the end of each line",
                exec        : function(){
                    stripws();
                },
                isAvailable : function (editor){
                    return editor && tabs.focussedPage &&
                        typeof tabs.focussedPage.path == "string";
                }
            }, plugin);

            menus.addItemByPath("Tools/Strip Trailing Space", new ui.item({
                command : "stripws"
            }), 100, plugin);

            menus.addItemByPath("Tools/~", new ui.divider(), 200, plugin);

            save.on("before.save", function (e) {
                var shouldStrip = settings.getBool("user/general/@stripws");
                if (!shouldStrip)
                    return;
                var doc = e.document;
                stripws(doc.page);
            }, plugin);


            settings.on("read", function(e) {
                settings.setDefaults("user/general", [["stripws", "false"]]);
            }, plugin);

            prefs.add({
               "General" : {
                    position : 100,
                    "General" : {
                        "On Save, Strip Whitespace" : {
                            type     : "checkbox",
                            position : 900,
                            path     : "user/general/@stripws"
                        }
                    }
               }
            }, plugin);
        }

        /***** Methods *****/

        function stripws(page) {
            page = page || tabs.focussedPage;
            if (!page || !page.path || disabled)
                return;

            var c9Session = page.document.getSession();
            var session   = c9Session.session;
            whitespaceUtil.trimTrailingSpace(session, true);
            session.$syncInformUndoManager();
        }

        /***** Lifecycle *****/

        plugin.on("load", function(){
            load();
        });
        plugin.on("enable", function(){
            disabled = false;
        });
        plugin.on("disable", function(){
            disabled = true;
        });
        plugin.on("unload", function(){
            loaded = false;
        });

        /***** Register and define API *****/
        /**
         * Strip whitespace extension for Cloud9 IDE
         **/
        plugin.freezePublicAPI({
            /*
             * Strips whitespace at the end of each line in the given page
             * @param {Page} page - The page to strip the whitespace from
             * If not provided, the currently focussed page will be used instead
             */
            strpws: stripws
        });

        register(null, {
            stripws: plugin
        });
    }
});

