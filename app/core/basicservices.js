"use strict";

class BasicServices {
    
    constructor(conn) {
        this.connection = conn;
        this.connection.on("message", msg=>this.onMessage(msg));
    }

    close() {
    }

    onMessage(msg) {
        if (msg.type == "echo") {
            this.connection.replyOk(msg, {text:msg.text});
        }
    }
}

module.exports = BasicServices;
