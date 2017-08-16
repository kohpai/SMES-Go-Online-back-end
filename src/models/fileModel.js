'use strict'

import Config from '../config.js'
import * as unzip from "unzip";

var fs = require('fs')
var path = require("path")
var weedClient = require('node-seaweedfs')

var DecompressZip = require('decompress-zip')

const timeout = 20000;

var seaweedfs = new weedClient({
    server: Config.seaweedfs.host,
    port: Config.seaweedfs.port,
})

const saveFileLocal = (file, done) => {

    if (!file) {
        return done(null);
    }

    if (!fs.existsSync('./temp/')){
        fs.mkdirSync('./temp/')
    }

    let fileName = './temp/' + file.name
    file.mv(fileName, function (err) {
        if (err) {
            return done(null)
        }
    })

    return done(fileName)
}

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
            return done(null)
        }
    })

    seaweedfs.write(fileName).then(function (fileInfo) {
        fs.unlink(fileName)
        return done(fileInfo)

    }).then(function (Buffer) {
    }).catch(function (err) {
        fs.unlink(fileName)
        return done(null)

    })
}

const saveFilePath = (path, done) => {

    if (!path) {
        return done(null);
    }

    if (!fs.existsSync(path)){
        return done(null)
    }

    seaweedfs.write(path).then(function (fileInfo) {
        fs.unlink(path)
        return done(fileInfo)

    }).then(function (Buffer) {
    }).catch(function (err) {
        fs.unlink(path)
        return done(null)

    })
}

const readFile = (id, name, done) => {

    if (!fs.existsSync('./temp/')){
        fs.mkdirSync('./temp/')
    }

    var file = './temp/'+name
    var file_path = path.resolve(file)

    // seaweedfs.read(id, fs.createWriteStream('./temp/'+name))

    seaweedfs.read(id).then(function(buffer) {
        fs.writeFile(file_path, buffer, function(err) {
            if(err) {
                return done(err)
            }
            return done(file_path)
        });
    }).catch(function(err) {
        return done(err)
    });

}

const deleteTempFile = (path, done) => {
    fs.unlink(path, (err) => {
        if (err){
            return done(err)
        }
        return done(null)
    })
}

const deleteFile = (id, done) => {
    seaweedfs.remove(id).then(function (fileInfo) {
        return done(fileInfo)
    }).then(function (Buffer) {
    }).catch(function (err) {
        console.log(err)
        return done(err)
    })
}

const unzipFile = (file, done) => {

    if (!file) {
        return done(null);
    }

    if (!fs.existsSync('./temp/')){
        fs.mkdirSync('./temp/')
    }

    let fileName = './temp/' + file.name
    file.mv(fileName, function (err) {
        if (err) {
            return done(null)
        }

        let destDir = fileName+'_unzip'

        if (!fs.existsSync(destDir)){
            fs.mkdirSync(destDir)
        }

        var unzipper = new DecompressZip(fileName)

        unzipper.on('error', function (err) {

            return done(null)

        });

        unzipper.on('extract', function (log) {

            deleteTempFile(fileName, (result) => {})

            return done(destDir)
        });

        unzipper.extract({
            path: destDir
        })
    })
}

export default {
    saveFile,
    deleteFile,
    readFile,
    deleteTempFile,
    saveFileLocal,
    unzipFile,
    saveFilePath,
}
