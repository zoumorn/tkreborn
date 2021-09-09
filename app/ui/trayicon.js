"use strict";

const events = require('events')
const { app, Menu, Tray } = require('electron')
const i18n = require("../core/i18n.js")

const trayIconContextMenuTemplate = [
    { label: "主窗口", click: ()=> app.theApp.activeMainWnd() },
    { type: 'separator' },
    { label: "退出", click: ()=> app.theApp.cleanUpAndExit("tray-menu-exit") }
];

class TrayIcon extends events.EventEmitter {

    tray = null;

    constructor() {
        super();

        const iconPath = app.theApp.packagePathJoin('assets/image/logo.png');
        this.tray = new Tray(iconPath);

        const contextMenu = Menu.buildFromTemplate(trayIconContextMenuTemplate);
        this.tray.setContextMenu(contextMenu)

        this.tray.setToolTip(app.theApp.info.name+i18n.still_running)
        this.tray.on("double-click", ()=> app.theApp.activeMainWnd());
    }

    destroy() {
        if (this.tray) this.tray.destroy()
    }

}

module.exports = TrayIcon;
