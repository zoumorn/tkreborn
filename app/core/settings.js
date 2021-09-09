"use strict";

const fs = require("fs")

class Settings {

    get bridge() { return "https://tkreborn.applinzi.com"; }
    get keepConnectionInterval() { return 10000; }
    get keepAliInterval() { return 10000; }
    get loggingEventsCapacity() { return 10; }
    get statusUpdateInterval() { return 5000; }
    get sendKeyDelay() { return 100; }

    get aliSiteName() { return "tkreborn"; }
    get aliAdzoneName() { return "tkreborn-1"; }

    get auth() { return this.get("auth"); }
    set auth(v) { this.set("auth", v); }
    
    get alipid() { return this.get("alipid"); }
    set alipid(v) { this.set("alipid", v); }

    get aliuser() { return this.get("aliuser"); }
    set aliuser(v) { this.set("aliuser", v); }

    get alipwd() { return this.get("alipwd"); }
    set alipwd(v) { this.set("alipwd", v); }

    get autoLogin() { return this.get("autologin"); }
    set autoLogin(v) { this.set("autologin", v); }

    get alisiteid() { return this.get("alisiteid"); }
    set alisiteid(v) { this.set("alisiteid", v); }

    get aliadzoneid() { return this.get("aliadzoneid"); }
    set aliadzoneid(v) { this.set("aliadzoneid", v); }

    get closeToTray() { return this.get("closetotray"); }
    set closeToTray(v) { this.set("closetotray", v); }

    confPath = null;
    _data = {};

    get(key, d) {
        return this._data[key] || d;
    }

    set(key, val) {
        this._data[key] = val;
    }

    load(confPath) {
        this.confPath = confPath;
        try {
            let val = JSON.parse(fs.readFileSync(this.confPath));
            this._data = val;
            return true;
        }
        catch(e) {
            return false;
        }
    }

    save(data) {
        if (data) Object.assign(this._data, data);
        fs.writeFileSync(this.confPath, JSON.stringify(this._data));
    }
}

module.exports = Settings;
