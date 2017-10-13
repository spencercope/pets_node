module.exports = (function() {
    var config    = require(__dirname + '/config.json');
    var env       = process.env.NODE_ENV;

    if (!env) {
        env = config.default;
        if (!env) {
            env = "local";
        }
    }
    //env = "production";

    console.log("Config using environment: " + env);
    return config[env];
})();
