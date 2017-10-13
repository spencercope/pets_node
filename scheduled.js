var cron = require('node-cron');
var model = require('./models');

module.exports = {
    dailyTasks: function () {
        var dailyAt0001 = '0 1 0 * * *';
        cron.schedule(dailyAt0001, function () {
            processExpiredProperties();
            qbInvoiceService.updateInvoicesFromQuickBooks();
            dataIntegrity.getIntegrityForAllProperties();
        });
    },
    delayedDailyTasks: function () {
        var dailyAt0301 = '0 1 3 * * *';
        cron.schedule(dailyAt0301, function () {
            checkForOverdueInvoices();
        });
    },
    yearEndEventTasks: function(){
        var everyMayFirstAt0700 = '0 0 7 1 5 *';
        cron.schedule(everyMayFirstAt0700, function () {
            processMaterialsInventory();
            processLiveEvents();
            archivePaidInvoices();
        });
    },
    beforeStartOfYearTasks: function(){
        var everySeptemberThirtiethAt0700 = '0 0 7 30 9 *';
        cron.schedule(everySeptemberThirtiethAt0700, function () {
            archivePaidInvoices();
        });
    }
};

function checkForOverdueInvoices(){
    model.Invoice.findAll({
        where: {
            state: 'sent',
            totalAmountDue: {
                $gt: 0
            }
        },
        include: [{
            model: model.Property,
            as: 'property',
            include: [{
                model: model.BillingTerm,
                as: 'billingTerm'
            }]
        }]
    }).then(function (res) {
        if(Array.isArray(res) && res.length > 0){
            res.forEach(invoiceNoticeEmail.processInvoiceForDelinquency);
        }
    });
}

function archivePaidInvoices(){//to be run twice per year, at end of snow year and before the beginning of the next
    console.log("Archiving Paid Invoices - " + new Date().toISOString());
    model.Invoice.findAll({
        where: {
            state: 'paid'
        }
    }).then(function (res) {
        console.log("res.length: " + res.length);
        if (res && Array.isArray(res) && res.length > 0) {
            res.forEach(function (paidInvoice) {
                paidInvoice.state = 'archived';
                paidInvoice.save();
            });
        }
    });
}

function processExpiredProperties(){
    console.log("Processing Expired Properties");
    var currentDate = Date.today();
    var mysqlCurrentDate = currentDate.toString("yyyy-MM-dd HH:mm:ss");//current date as a mysql date string
    /* gets all properties that have expired and are not already in an expired or inactive state */
    model.Property.findAll({
        where: {
            contractEndDate: {
                $lt: mysqlCurrentDate
            },
            statusType: {
                $notIn: ['Inactive', 'Expired']
            }
        }
    }).then(function (res) {
        if (res && Array.isArray(res) && res.length > 0) {
            res.forEach(function (contractExpiredProperties) {
                contractExpiredProperties.statusType = 'Expired';//set expired status on property
                contractExpiredProperties.save();//save property
            });
        }
    });
}

function processLiveEvents(){
    console.log("Processing Year End Close: Live Events");
    /* Get all live events */
    model.SnowEvent.findAll({
        where: {
            state: 'live'
        },
        include: [
            {
                model: model.SnowEventService,
                as: 'snowEventServices',
                include: [{
                    model: model.SnowEventServiceItem,
                    as: 'snowEventServiceItems'
                }]
            }
        ]
    }).then(function (liveSnowEvents) {
        liveSnowEvents.forEach(function (liveSnowEvent) {
            yearCloseFunctions.closePaidEvents(liveSnowEvent);
        });
    });
}

function processMaterialsInventory(){
    console.log("Processing Year End Close: Materials Inventory");
    model.Material.findAll({
        raw: true
    }).then(function (res) {
        if(Array.isArray(res) && res.length > 0){
            res.forEach(function (material) {
                yearCloseFunctions.closeMaterialsInventory(material);
            })
        }
    });
}
