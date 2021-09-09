"use strict";

const { app, session, BrowserWindow } = require('electron')
const fs = require('fs')
const { sendKeys } = require('./simulator.js')
const i18n = require("./i18n.js")

const log4js = require('log4js')
const logger = log4js.getLogger('aliservices');

const SESSION_NAME = "persist:ali";

const URL_ALIMAMA = "https://www.alimama.com/index.htm";
const URL_MYUNION = "https://pub.alimama.com/myunion.htm";
const URL_LOGIN = "https://login.taobao.com/member/login.jhtml?style=minisimple&from=alimama&redirectURL=http%3A%2F%2Fwww.alimama.com&full_redirect=true&disableQuickLogin=true";

class AliServices {
    
    bkgrdWnd = null;
    bkgrdWndApiImpl = null;
    keepBkgrdWndOpen = true;

    loginWnd = null;

    constructor(conn) {
        this.connection = conn;
        this.connection.on("message", msg=>this.onMessage(msg));
        this.cookiePath = app.theApp.userDataPathJoin('tkr.cookies');
        this.alibkgrdwndapi_js = fs.readFileSync(`${__dirname}/alibkgrdwndapi.js`).toString();
        this.loginhelp_js = fs.readFileSync(`${__dirname}/loginhelp.js`).toString();
        this.ss = session.fromPartition(SESSION_NAME);
        this.loadCookies();
        this.createBkgrdWindow();
    }

    loadCookies() {
        if (!fs.existsSync(this.cookiePath)) return;
        let cs = JSON.parse(fs.readFileSync(this.cookiePath));
        cs.forEach(c => {
            this.ss.cookies.set({ 
                url:"https://www.alimama.com",
                name: c.name,
                value: c.value,
                domain: c.domain,
                path: c.path,
                secure: c.secure,
                httpOnly: c.httpOnly
            });
        });
    }

    saveCookies(data) {
        this.ss.cookies.get({url:"https://www.alimama.com", session:true})
        .then(cs=>fs.writeFileSync(this.cookiePath, JSON.stringify(cs)));
    }

    close() {
        if (this.bkgrdWnd) {
            this.keepBkgrdWndOpen = false;
            this.bkgrdWnd.close();
        }
        this.saveCookies();
    }

    createMyUnionWindow() {
        let wnd = new BrowserWindow({
            useContentSize: true,
            center: true,
            skipTaskbar: true,
            title: "",
            show: false,
            webPreferences: {
                partition: SESSION_NAME
            }
        });
        wnd.loadURL(URL_MYUNION);
        wnd.removeMenu();
        wnd.show();
        return wnd;
    }

    createBkgrdWindow() {
        this.bkgrdWnd = new BrowserWindow({
            useContentSize: true,
            center: true,
            skipTaskbar: true,
            title: "",
            show: false,
            webPreferences: {
                webSecurity: false,
                partition: SESSION_NAME,
                nodeIntegration: true
            }
        });
        //this.bkgrdWnd.show();
        //this.bkgrdWnd.webContents.openDevTools();
        this.bkgrdWnd.removeMenu();
        this.bkgrdWnd.on('close', e=> {
            if (this.keepBkgrdWndOpen) {
                this.bkgrdWnd.hide();
                e.preventDefault();
            }
        });
        this.bkgrdWnd.on('closed', ()=> { 
            this.bkgrdWnd=null;
        });
        this.bkgrdWnd.webContents.on("did-navigate", (e, url)=>{
            this.bkgrdWnd.webContents.executeJavaScript(this.alibkgrdwndapi_js);
        });
        this.bkgrdWnd.loadURL(URL_MYUNION);
    }

    createLoginWindow() {
        this.loginWnd = new BrowserWindow({
            width: 600,
            height: 450,
            center: true,
            skipTaskbar: true,
            show: false,
            webPreferences: {
                partition: SESSION_NAME,
            }
        });
        this.loginWnd.removeMenu();
        this.loginWnd.on('closed', ()=> { 
            this.loginWnd=null;
        });
        const URLS_IN_PROCESS = [
            "https://login.taobao.com/member/login.jhtml?redirectURL=http%3A%2F%2Fwww.alimama.com"
        ];
        this.loginWnd.webContents.on("did-navigate", (e, url)=>{
            if(url == URL_LOGIN) {
                this.loginWnd.webContents.executeJavaScript(this.loginhelp_js)
                .then(()=>this.sendToLoginWnd("readyToGo"));
            }
            else if(url == URL_MYUNION || url == URL_ALIMAMA) {
                logger.info(i18n.logged_in);
                this.loginWnd.close();
            }
            else if (URLS_IN_PROCESS.includes(url)) { }
            else {
                logger.warn(i18n.unexp_navigation + url);
                this.loginWnd.close();
            }
        });
        this.loginWnd.webContents.on("console-message", (e, level, message, line, sourceId)=>{
            if(message.startsWith("__tkr__:")) {
                e.preventDefault();
                let ev = message.substr(8);
                let argsIdx = ev.indexOf(":");
                if (argsIdx < 0)
                    this.onLoginWndEvent(ev, null);
                else
                    this.onLoginWndEvent(ev.substr(0, argsIdx), JSON.parse(ev.substr(argsIdx+1)));
            }
        });
    }

    sendToLoginWnd(message) {
        let js = `window.__tkr__.${message}();`;
        return this.loginWnd.webContents.executeJavaScript(js);
    }

    onLoginWndEvent(event, args) {
        if(event == "fireUser")
        {
            let aliuser = app.theApp.settings.aliuser;
            sendKeys(this.loginWnd, aliuser, app.theApp.settings.sendKeyDelay)
            .then(()=>this.sendToLoginWnd("userFired"));
        }
        else if(event == "firePwd")
        {
            let alipwd = app.theApp.settings.alipwd;
            sendKeys(this.loginWnd, alipwd, app.theApp.settings.sendKeyDelay)
            .then(()=>this.sendToLoginWnd("pwdFired"));
        }
        else if(event == "dragSlider")
        {
            let dragx = args.box.x + Math.round(args.slider.w / 2);
            let dragy = args.box.y + Math.round(args.slider.h / 2);
            let dropx = dragx + (args.box.w - args.slider.w);
            let dropy = dragy + (args.box.w - args.slider.w);
            let keys = `{!${dragx},${dragy},${dropx},${dropy}}`;
            sendKeys(this.loginWnd, keys, app.theApp.settings.sendKeyDelay)
            .then(()=>this.sendToLoginWnd("sliderMoved"));
        }
        else if(event == "clickSubmit")
        {
            let x = args.submit.x + Math.round(args.submit.w / 2);
            let y = args.submit.y + Math.round(args.submit.h / 2);
            let keys = `{~${x},${y}}`;
            sendKeys(this.loginWnd, keys, app.theApp.settings.sendKeyDelay);
        }
    }

    tryLogin() {
        if (this.loginWnd == null) 
            this.createLoginWindow();
        else
            return;
        this.loginWnd.loadURL(URL_LOGIN);
        this.loginWnd.show();
    }

    onMessage(msg) {
        if (msg.type == "aliconv") {
            if (!this.bkgrdWndApiImpl)
                this.connection.replyNotOk(msg, "apinotready");

            let siteid = app.theApp.settings.alisiteid;
            let adzoneid = app.theApp.settings.aliadzoneid;
            if (!siteid || !adzoneid)
                this.connection.replyNotOk(msg, "confnotready");

            this.bkgrdWndApiImpl.trans_url(siteid, adzoneid, msg.url, ret=>{
                if (ret.ok)
                    this.connection.replyOk(msg, { url:ret.sclick });
                else
                    this.connection.replyNotOk(msg, ret.err);
            });
        }
        else if (msg.type == "status") {
            if (!this.bkgrdWndApiImpl)
                this.connection.replyNotOk(msg, "apinotready");
            this.bkgrdWndApiImpl.get_login_info(info=>this.connection.replyOk(msg, { username:info.userName }));
        }
    }
}

module.exports = AliServices;
