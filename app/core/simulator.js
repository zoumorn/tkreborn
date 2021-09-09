"use strict";

const { app } = require('electron')
const child_process = require('child_process')

function sendKeys(wnd, keys, delay) {
    return new Promise(resolve=>{
        const simExe = app.theApp.packagePathJoin("assets/bin/sim.exe");
        let handle = wnd.getNativeWindowHandle().readUInt32LE();
        child_process.execFile(simExe, ["SENDKEYS", `${handle}`, `${delay}`, `${keys}`], ()=>resolve());
    });
} 

module.exports = { sendKeys };
