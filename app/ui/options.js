"use strict";

const { app } = require('electron').remote
let settings = app.theApp.settings;

const IDS = ["auth","alipid","aliuser","alipwd","autologin", "alisiteid", "aliadzoneid","closetotray"];
const BOOLS = ["autologin","closetotray"];

function restoreOptions() {
    let data = settings._data;
    IDS.forEach(id => {
        let v = data[id];
        if (v) {
            if (BOOLS.indexOf(id) >= 0) 
                document.getElementById(id).checked = v;
            else
                document.getElementById(id).value = v;
        }
    });
}

function saveOptions() {
    let data = {};
    IDS.forEach(id => {
        let v = null;
        if (BOOLS.indexOf(id) >= 0)
            v = document.getElementById(id).checked;
        else
            v = document.getElementById(id).value;
        data[id] = v;
    });
    settings.save(data);

}

function getTrialAuth() {
    document.getElementById('auth').value = "";
    fetch(`${settings.bridge}/trial`)
    .then(resp=>resp.json())
    .then(rjson=>{
        if (rjson.ok) document.getElementById('auth').value = rjson.auth;
    });
}

function getPid() {
    document.getElementById('alipid').value = "";
    if (!app.theApp.aliServices.bkgrdWndApiImpl) return;
    app.theApp.aliServices.bkgrdWndApiImpl.get_login_info(ret=>{
        if (ret.ok) document.getElementById('alipid').value = ret.userId;
    });
}

function tryLogin() {
    app.theApp.aliServices.tryLogin();
}

function getSiteAdzone() {
    document.getElementById('alisiteid').value = "";
    document.getElementById('aliadzoneid').value = "";
    if (!app.theApp.aliServices.bkgrdWndApiImpl) return;
    app.theApp.aliServices.bkgrdWndApiImpl.ensure_site_adzone(
        app.theApp.settings.aliSiteName, app.theApp.settings.aliAdzoneName, data=>{
        if (data.ok) {
            document.getElementById('alisiteid').value = data.siteid;
            document.getElementById('aliadzoneid').value = data.adzoneid;
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    restoreOptions();
    document.getElementById('gettrialauth').addEventListener('click', getTrialAuth);
    document.getElementById('getpid').addEventListener('click', getPid);
    document.getElementById('trylogin').addEventListener('click', ()=>{
        saveOptions();
        tryLogin();
    });
    document.getElementById('getsiteadzone').addEventListener('click', getSiteAdzone);
    document.getElementById('save').addEventListener('click', ()=>{
        saveOptions();
        let status = document.getElementById('status');
        status.textContent = '参数已保存';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
        if (app.theApp.firstRun) {
            app.theApp.firstRun = false;
            app.theApp.showMainWndContent("status");
        }
    });
    document.title = `${app.theApp.info.name} - 系统设置 - ${app.theApp.info.desc}`;
});

