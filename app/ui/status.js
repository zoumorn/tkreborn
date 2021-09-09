"use strict";

const { remote, ipcRenderer } = require('electron')
const app = remote.app
const connection = app.theApp.connection;
const ali = app.theApp.aliServices;

function formatLoggineEvent(e) {
    let div = document.createElement("div");
    div.innerHTML = e;
    return div;
}

function updateEvent(node) {
    let events = document.getElementById("loggingEvents");
    events.insertBefore(node, events.firstChild);
    while (events.childNodes.length > app.theApp.settings.loggingEventsCapacity)
        events.removeChild(events.lastChild);
}

function updateStatus(statusid, st, text) { //st = success, warning, danger
    let icon = document.getElementById(statusid+"-icon");
    let stat = document.getElementById(statusid+"-text");
    icon.classList.remove("label-success");
    icon.classList.remove("label-warning");
    icon.classList.remove("label-danger");
    icon.classList.add("label-" + st);
    icon.textContent = st;
    stat.textContent = text;
}

function updateAllStatus() {
    if (connection.state)
        updateStatus("network", "success", "已就绪");
    else
        updateStatus("network", "danger", "未连接");

    if (ali.bkgrdWndApiImpl) { ali.bkgrdWndApiImpl.get_login_info(function(ret) {
        if (ret.ok)
            updateStatus("login", "success", ret.userName);
        else {
            if (ret.info == "nologin")
                updateStatus("login", "warning", "未登录");
            else
                updateStatus("login", "danger", "登录状态错误"+ret.err.message);
        }
    });}

    let alipid = app.theApp.settings.alipid;
    let siteid = app.theApp.settings.alisiteid;
    let adzoneid = app.theApp.settings.aliadzoneid;
    if (alipid && siteid && adzoneid)
        updateStatus("conf", "success", "mm_"+alipid+"_"+siteid+"_"+adzoneid);
    else
        updateStatus("conf", "danger", "请检查配置");
}

function updateLoggingEvents() {
    app.theApp.latestEvents.forEach(e => {
        updateEvent(formatLoggineEvent(e));
    }); 
}

document.addEventListener('DOMContentLoaded', function () {
    updateAllStatus();
    updateLoggingEvents();
    
    setInterval(()=> updateAllStatus(), app.theApp.settings.statusUpdateInterval);

    ipcRenderer.on("loggingEvent", (notused, e)=>{
        updateEvent(formatLoggineEvent(e));
    });
    document.title = `${app.theApp.info.name} - 服务状态 - ${app.theApp.info.desc}`;
});
