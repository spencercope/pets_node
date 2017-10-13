var cron = require('node-cron');
var models = require('../models');
var emailReminders = require('./emailReminders');

var dailyAt0701 = '0 1 7 * * *';
var dailyAt1301 = '0 1 13 * * *';
var dailyAt1701 = '0 1 17 * * *';
var dailyAt2001 = '0 1 20 * * *';
// var dailyAt0701 = '0 47 20 * * *';
// var dailyAt1301 = '0 48 20 * * *';
// var dailyAt1701 = '0 49 20 * * *';
// var dailyAt2001 = '0 50 20 * * *';

module.exports = {
    emailHelper: function () {
        scheduleEmails();
    }
};

function scheduleEmails(){
    cron.schedule(dailyAt0701, function () {
        emailReminders.getReminders("morning");
    });
    cron.schedule(dailyAt1301, function () {
        emailReminders.getReminders("afternoon");
    });
    cron.schedule(dailyAt1701, function () {
        emailReminders.getReminders("evening");
    });
    cron.schedule(dailyAt2001, function () {
        emailReminders.getReminders("night");
    });
}

