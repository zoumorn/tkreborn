"use strict";

const { app, BrowserWindow, dialog } = require('electron')
const log4js = require('log4js')
const path = require('path')
const fs = require("fs")
const Connection = require("./core/connection.js")
const BasicServices = require("./core/basicservices.js")
const AliServices = require("./core/aliservices.js")
const Settings = require("./core/settings.js")
const TrayIcon = require("./ui/trayicon.js")
const createApplicationMenu = require("./ui/appmenu.js")
const buildExtension = require("./core/extbuilder.js")
const i18n = require("./core/i18n.js")

let logger = null;

class TkRebornApp {

    mainWnd = null;
    trayIcon = null;

    connection = null;
    basicServices = null;
    aliServices = null;

    latestEvents = [];

    info = {};

    createMainWnd() {
        this.mainWnd = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                webSecurity: false,
                partition: "persist:default",
                nodeIntegration: true
            }
        });
        this.mainWnd.on('close', () => {
            if (!this.settings.closeToTray) this.cleanUpAndExit("main-wnd-closed");
        });
        this.mainWnd.once('closed', () => { this.mainWnd = null });
    }

    showMainWndContent(name) {
        if (this.mainWnd == null) this.createMainWnd();
        this.mainWnd.loadFile(this.packagePathJoin(`app/ui/${name}.html`));
    }

    activeMainWnd() {
        if (this.mainWnd == null) this.showMainWndContent(this.firstRun ? "about":"status");
        if (this.mainWnd.isMinimized()) this.mainWnd.restore()
        this.mainWnd.focus()
    }
    
    cleanUpAndExit(sender) {
        if (sender != "main-wnd-closed") {
            if(this.mainWnd) this.mainWnd.close();
        }
        this.aliServices.close();
        this.basicServices.close();
        this.connection.close();
        this.trayIcon.destroy();
        
        logger.info(i18n.app_quit);
        app.exit();
    }

    packagePathJoin(j) {
        return path.join(__dirname, "../", j);        
    }

    userDataPathJoin(j) {
        let p = path.join(app.getPath("userData"), j);
        //let p = path.join(__dirname, "../../data/", j);
        fs.mkdirSync(path.dirname(p), {recursive:true});
        return p;
    }

    packageExtension() {
        buildExtension()
        .then(pth=>dialog.showMessageBox({title:i18n.msg_title_info, message:i18n.msg_pack_done+pth}))
        .catch(err=>{
            if (err.message != "canceled")
                dialog.showErrorBox(i18n.msg_title_err, i18n.msg_error+err.message);
        });
    }

    keepConnectionAlive() {
        if (this.connection.auth != this.settings.auth) {
            this.connection.auth = this.settings.auth;
            if (this.connection.state == 1) {
                this.connection.close();
                logger.info(i18n.identity_changed);
            }
        }
        if (this.connection.state != 1 && this.connection.auth) {
            logger.info(i18n.network_connecting);
            this.connection.open();
        }
    }

    keepAliLoggedIn() {
        if (this.settings.autoLogin && this.settings.aliuser && this.settings.alipwd) {
            if (!this.aliServices.bkgrdWndApiImpl) return;
            this.aliServices.bkgrdWndApiImpl.get_login_info(ret=>{
                if (!ret.ok && ret.info=="nologin") {
                    logger.info(i18n.try_login);
                    this.aliServices.tryLogin();
                }
            });
        }
    }

    configureLogger() {
        const eventObserver = {
            configure: () => { return e=>{
                if (e.level.level >= 20000) { //INFO, WARN, ERROR, FETAL
                    let date = `${e.startTime.getMonth()+1}-${e.startTime.getDate()}`
                    let time = `${e.startTime.getHours()}:${e.startTime.getMinutes()}:${e.startTime.getSeconds()}`;
                    let text = `[${date} ${time}] ${e.data[0]}`;
                    this.latestEvents.push(text);
                    if (this.latestEvents.length > 20) 
                        this.latestEvents.slice(0, this.latestEvents.length-this.settings.loggingEventsCapacity);
                    if (this.mainWnd) this.mainWnd.webContents.send("loggingEvent", text);
                }
            };}
        };
        log4js.configure({
            appenders: { 
                file: { type: 'file', filename: this.userDataPathJoin("tkr.log"), maxLogSize: 10000000 },
                eob: { type: eventObserver }
            },
            categories: { default: { appenders: ['file', 'eob'], level: 'debug' } }
        });
    }

    loadOEM() {
        this.info = {
            name: i18n.app_name,
            desc: i18n.app_desc,
            version: app.getVersion(),
            copyright: i18n.copyright
        };
        try {
            let oempath = path.join(path.dirname(app.getPath("exe")), "oem");
            let oem = JSON.parse(fs.readFileSync(oempath));
            if(oem.name) this.info.name = oem.name;
            if(oem.desc) this.info.desc = oem.desc;
            if(oem.version) this.info.version = oem.version;
            if(oem.copyright) this.info.copyright = oem.copyright;
        }
        catch(e) {
            //pass
        }
    }

    main() {
        this.settings = new Settings();
        this.firstRun = !this.settings.load(this.userDataPathJoin('tkr.conf'));

        this.configureLogger();
        logger = log4js.getLogger('app');

        logger.info(i18n.app_started);

        this.loadOEM();

        createApplicationMenu();
        this.trayIcon = new TrayIcon();

        this.connection = new Connection(this.settings.bridge);
        this.keepConnectionAlive();
        setInterval(()=>this.keepConnectionAlive(), this.settings.keepConnectionInterval);

        this.basicServices = new BasicServices(this.connection);
        this.aliServices = new AliServices(this.connection);
        this.keepAliLoggedIn();
        setInterval(()=>this.keepAliLoggedIn(), this.settings.keepAliInterval);

        this.activeMainWnd();
    }
}

app.once('ready', ()=>{
    app.theApp = new TkRebornApp();
    app.theApp.main();
});
