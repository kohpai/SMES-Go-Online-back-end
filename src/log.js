'use strict'

// import
var syslog = require("syslog-client")

// using
import Config from './config.js'

var client
var name = "SME Backend"

const connect = () =>  {
    var options = {
        transport: syslog.Transport.Udp,
        port: Config.syslog.port
    };

    client = syslog.createClient(Config.syslog.host, options);

    client.on("error", (err) => {
        if(err){
            console.log("can't connect to syslog.")
        }
    })
}

const get = () => {
    return client
}

const debug = (msg) => {
    var options = {
        severity: syslog.Severity.Debug,
    }
    client.log(name+' [DEBUG] '+msg, options, (error) => {
        if (error) {
            console.error(error);
        }
    })
}

const info = (msg) => {
    var options = {
        severity: syslog.Severity.Informational,
    }
    client.log(name+' [INFO] '+msg, options, (error) => {
        if (error) {
            console.error(error);
        }
    })
}

const warning = (msg) => {
    var options = {
        severity: syslog.Severity.Warning,
    }
    client.log(name+' [WARNING] '+msg, options, (error) => {
        if (error) {
            console.error(error);
        }
    })
}

const error = (msg) => {
    var options = {
        severity: syslog.Severity.Error,
    }
    client.log(name+' [ERROR] '+msg, options, (error) => {
        if (error) {
            console.error(error);
        }
    })
}

export default {
    connect,
    get,
    debug,
    info,
    warning,
    error
}
