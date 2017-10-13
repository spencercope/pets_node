var nodeMailer = require('nodemailer');
var models = require('../models');
var moment = require('moment');

module.exports = {
    getReminders: function (dayPart) {
        getReminders(dayPart);
    }
};

var transporter = nodeMailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'mail@gmail.com',
        pass: 'password'
    }
});

function getReminders(dayPart){
    models.Reminder.findAll({
        where: {
            timeOfDay: dayPart,
            dueDate: {
                $gt: moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
                $lt: moment().endOf('day').format('YYYY-MM-DD HH:mm:ss')
            }
        }
    }).then(function (reminders) {
        console.log("  "+ new Date() + " "+ dayPart + " : " + reminders.length);
        var mailOptionsArray = [];
        var emailPromises = [];
        if(Array.isArray(reminders) && reminders.length > 0){
            for (var i = 0; i < reminders.length; i++) {
                var reminder = reminders[i];
                var arrayOfRecipients = reminder.emailToCsv.split(',');
                var mailOptions = {
                    from: 'villanovaDev@gmail.com',
                    to: arrayOfRecipients,
                    subject: reminder.title + " - " + moment().format("HH:mm"),
                    html: '<br>' + reminder.description + '<br><br>Don\'t forget to enjoy your ' + dayPart + '.',
                    _reminderId: reminder.id//not really sure about this...
                };
                mailOptionsArray.push(mailOptions);
            }

            mailOptionsArray.forEach(function (options) {
                 emailPromises.push(transporter.sendMail(options, function (err, success) {
                     if (err) {
                         console.log(err);
                     }
                     if(success){
                         console.log('reminderId:' + options._reminderId + ' -> message sent -> ' + success.accepted + ' - ' + moment().format());
                         console.log("***********************************************************************$\n");
                         models.Reminder.find({
                             where: {
                                 id: options._reminderId
                             }
                         }).then(function (reminder) {
                             var newDate = moment();
                             newDate = moment().add(reminder.intervalNumber, reminder.interval);
                             newDate.set('hour', 12);//to not worry about utc
                             reminder.dueDate = newDate.format('YYYY-MM-DD HH:mm:ss');
                             reminder.save().then(function (info) {
                                 console.log("reminder saved");
                             });
                         });
                     }
                 }));
            });
        }
    });
}

