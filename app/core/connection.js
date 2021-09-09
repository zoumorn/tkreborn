"use strict";

const events = require("events")
const fetch = require('node-fetch')
const WebSocket = require('ws')
const i18n = require("./i18n.js")

const log4js = require('log4js')
const logger = log4js.getLogger('connection');

class Connection extends events.EventEmitter {

    conn = null;
    auth = null;

    constructor(bridge) {
        super();
        this.bridge = bridge;
    }
    
    //0: CONNECTING, 1:OPEN, 2:CLOSING, 3:CLOSED
    get state() {
        if (!this.conn) return 0;
        return this.conn.readyState;
    }

    open() {
        if (this.state == 1) return;
        if (!this.auth) return;

        fetch(`${this.bridge}/connect?auth=${this.auth}`)
        .then(response => response.json())
        .then(resp=>{
            if (resp.ok) {
                this.conn = new WebSocket(resp.url);
                this.conn.onopen = ()=>{
                    logger.info(i18n.network_connected);
                    this.emit("open");
                };
                this.conn.onerror = err=>{
                    logger.warn(i18n.network_error+err.message);
                    this.emit("err", err.message);
                };
                this.conn.onmessage = m=> {
                    let msg = JSON.parse(m.data);
                    logger.info(`<-- ${msg.type} ${msg.id}`);
                    this.emit("message", msg);
                };
                this.conn.onclose = ()=>{ 
                    logger.info(i18n.network_disconnected);
                    this.conn = null;
                    this.emit("close"); 
                };
            }
            else
            {
                logger.warn(i18n.network_error+resp.reason);
            }
        })
        .catch(err=>logger.warn(i18n.network_error_fetch));
    }

    close() {
        if (this.conn != null)
            this.conn.close();
    }

    send(m) {
        if (this.conn != null && this.state == 1) {
            m.from = this.auth;
            m.auth = this.auth;
            this.conn.send(JSON.stringify(m));
        }
    }

    reply(m, ok, r) {
        let m2 = { to: m.from, id: m.id, type: m.type, ok };
        if (m.echo) m2.echo = m.echo;
        Object.assign(m2, r);
        this.send(m2);
        if (m2.ok)
            logger.info(`--> ${m2.ok} ${m2.id}`);
        else
            logger.info(`--> ${m2.ok} ${m2.reason} ${m2.id}`);
    }

    replyOk(m, data) {
        this.reply(m, true, data);
    }

    replyNotOk(m, reason) {
        this.reply(m, false, {reason});
    }
}

module.exports = Connection;
