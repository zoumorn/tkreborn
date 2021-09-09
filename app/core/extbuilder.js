"use strict";

const { app, dialog } = require('electron')
const fs = require('fs');
const path = require('path');
const NodeRSA = require("node-rsa");
const ChromeExtension = require('crx');

function copyFile(fileName, srcDir, destDir) {
    let src = path.join(srcDir, fileName);
    let dest = path.join(destDir, fileName);
    fs.mkdirSync(path.dirname(dest), {recursive:true});
    fs.copyFileSync(src, dest);
}

function prepareExtensionFiles(extPath, extTempPath) {
    const files = ["manifest.json", "bk.js", "/icons/icon16.png", "/icons/icon48.png", "/icons/icon128.png"];
    files.forEach(file=>copyFile(file, extPath, extTempPath));

    const bkjspath = path.join(extTempPath, "bk.js");
    let bkjs = fs.readFileSync(bkjspath).toString();
    bkjs = bkjs.replace("{{AUTH}}", app.theApp.settings.auth);
    bkjs = bkjs.replace("{{BRIDGE}}", app.theApp.settings.bridge);
    bkjs = bkjs.replace("{{TRACKIDS}}", app.theApp.settings.alipid);
    fs.writeFileSync(bkjspath, bkjs);
}

function buildExtension() {
    if (!app.theApp.settings.auth) return Promise.reject(new Error("nocode")); 
    if (!app.theApp.settings.alipid) return Promise.reject(new Error("nopid"));
    return dialog.showSaveDialog({filters: [
        { name: 'Extension File', extensions: ['crx'] },
        { name: 'All Files', extensions: ['*'] }]})
    .then(result=>{
        if(result.canceled) throw new Error("canceled");
        const extPath = app.theApp.packagePathJoin("assets/ext");
        const extTempPath = app.theApp.userDataPathJoin("tkrextmp");
        prepareExtensionFiles(extPath, extTempPath);
        let rsa = NodeRSA({b:2048});
        const crx = new ChromeExtension({
            privateKey: rsa.exportKey("private")
        });
        return crx.load(extTempPath)
        .then(crx => crx.pack())
        .then(crxBuffer => {
            fs.writeFileSync(result.filePath, crxBuffer);
            return result.filePath;
        });
    });
} 

module.exports = buildExtension;
