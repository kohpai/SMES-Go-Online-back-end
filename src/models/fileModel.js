'use strict'

import Config from '../config.js'

var fs = require('fs')
var weedClient = require('node-seaweedfs')

const timeout = 20000;

var seaweedfs = new weedClient({
    server: Config.seaweedfs.host,
    port: Config.seaweedfs.port,
})

const saveFile = (file, done) => {

    if (!file) {
        return done(null);
    }

    if (!fs.existsSync('./temp/')){
        fs.mkdirSync('./temp/')
    }

    let fileName = './temp/' + file.name
    file.mv(fileName, function (err) {
        if (err) {
            console.log(err)
            return done(null)
        }
    })

    seaweedfs.write(fileName).then(function (fileInfo) {
        fs.unlink(fileName)
        return done(fileInfo)

    }).then(function (Buffer) {
    }).catch(function (err) {
        fs.unlink(fileName)
        console.log(err)
        return done(null)

    })
}

export default {
    saveFile,
}
