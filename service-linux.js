var Service = require('node-linux').Service;

// Create a new service object
var svc = new Service({
    name: "BSRWebServices",
    description: "Web Services for BSR Services.",
    script: require('path').join(__dirname, 'bin/www'),
    user: "node",
    group: "node",
    env: [
        {
            name: "HOME",
            value: process.env["USERPROFILE"]
        },
        {
            name: "NODE_ENV",
            value: "production"
        }
    ]
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on("install", function () {
    svc.start();
});

// Just in case this file is run twice.
svc.on('alreadyinstalled', function () {
    console.log(svc.name + ' service is already installed.\n');
    console.log('Attempting to start it.\n');
    svc.start();
});

// Listen for the "start" event and let us know when the
// process has actually started working.
svc.on('start', function () {
    console.log(svc.name + ' started!\n');
});


svc.install();
