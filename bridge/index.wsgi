#!/usr/bin/env python
# -*- coding: utf8 -*-
import sae
from sae import channel
import json
import uuid
import datetime
import random
import web
import os
import urlparse
import urllib
import urllib2

class JsonDict(dict):
    def __getattr__(self, attr):
        try:
            return self[attr]
        except KeyError:
            raise AttributeError(r"'JsonDict' object has no attribute '%s'" % attr)
    def __setattr__(self, attr, value):
        self[attr] = value

def create_jsondict(s):
    def _obj_hook(pairs):
        o = JsonDict()
        for k, v in pairs.iteritems():
            o[str(k)] = v
        return o
    return json.loads(s, object_hook=_obj_hook)

def get_app_root():
    app_root = os.path.dirname(__file__)
    if app_root[-4:] == ".zip": 
        app_root = os.path.dirname(app_root)
    return app_root

def read_conf():
    fd = open(os.path.join(get_app_root(), "conf"), "r")
    conf_str = fd.read()
    fd.close()
    return create_jsondict(conf_str)

TRAIL_DATE_BASE = datetime.datetime(2019,11,11)
TRAIL_SID_START = 50000
TRAIL_SID_END = 59999
TRAIL_DAYS = 3

def make_auth(id, days):
    if id <= 0 or id >= 0xFFFF: return None
    if days < 0 or days >= 0xFFFF: return None
    if days:
        days = (datetime.datetime.now()-TRAIL_DATE_BASE).days+days
    c = 0x7F0C
    m = 0x7F687643
    t1 = hex(((c<<16)|id)^m)[2:].zfill(8)
    t2 = hex(days^(0xFFFF&m))[2:].zfill(4)
    t = t1+t2
    base_k = 97+(id+days)%26
    r = []
    k = base_k
    for c in t:
        k = 97+(int(c, 16)+k*3)%26
        r += [chr(k)]
    return chr(base_k)+"".join(r)

def get_auth_id_days(a):
    c = 0x7F0C
    m = 0x7F687643
    n = len(a)
    if n != 13: return (None, None)
    t = a.lower()
    d = []
    for i in range(n-1, 0, -1):
        h = (ord(t[i])-97-ord(t[i-1])*3)%26
        if h>15: return (None, None)
        d += [hex(h)[2:]]
    t = "".join(d[::-1])
    x = int(t[:8], 16)^m
    days = int(t[-4:], 16)^(0xFFFF&m)
    return (x&0xFFFF, days) if (x>>16==c) else (None, None)

conf = read_conf()

class BaseHandler(object):
    def __init__(self):
        self.template_vals = {'self':self }
        self.app_root = get_app_root()
        self.url_pr = urlparse.urlparse(web.ctx.home + web.ctx.fullpath)

    def GET(self, *args): return self.on_get(*args)
    def POST(self, *args): return self.on_post(*args)
    def on_get(self, *args): return self.on_request(*args)
    def on_post(self, *args): return self.on_request(*args)
    
    def on_request(self, *args):
        temp, vals = self.on_prepare_render(*args)
        return self.render(temp, vals)

    def on_prepare_render(self, *args):
        raise web.notfound()

    def render(self, temp, vals = None):
        if not temp: return
        if vals: self.template_vals.update(vals)
        tp = os.path.join(self.app_root, temp)
        render = web.template.frender(tp, globals=self.template_vals)
        return render()

    def required_input(self, *arg_names):
        request = web.input()
        ret = []
        for i in arg_names:
            v = request.get(i)
            if not v: raise web.notfound()
            ret.append(v)
        return ret[0] if len(ret)==1 else tuple(ret)

    def json_error(self, reason, **kws):
        e = { "ok": 0, "reason":reason }
        e.update(kws)
        return json.dumps(e)

    def json_ok(self, **kws):
        r = {"ok": 1}
        r.update(kws)
        return json.dumps(r)

class TrialHandler(BaseHandler):
    def on_request(self):
        rid = random.randint(TRAIL_SID_START, TRAIL_SID_END)
        trial = make_auth(rid, TRAIL_DAYS)
        return self.json_ok(auth=trial)

class ConnectHandler(BaseHandler):
    def on_request(self):
        auth = self.required_input("auth")
        sid, days = get_auth_id_days(auth)
        if not sid: raise web.notfound()
        if days:
            exp = TRAIL_DATE_BASE + datetime.timedelta(days=days+1)
            if exp < datetime.datetime.now(): return self.json_error("expired")

        ret = {}
        if web.input().get("c"):
            ret["cid"] = uuid.uuid4().hex
            ret["url"] = channel.create_channel(ret["cid"])
        else:
            ret["url"] = channel.create_channel(auth)
        return self.json_ok(**ret)

class MessageHandler(BaseHandler):
    def on_post(self):
        return self.route_message(create_jsondict(self.required_input("message")))

    def on_get(self):
        return self.route_message(create_jsondict(self.required_input("m")))

    def route_message(self, m):
        sid, days = get_auth_id_days(m.auth)
        if not sid: raise web.notfound()
        if not m.has_key("id"): m.id = uuid.uuid4().hex
        ret = channel.send_message(m.to, json.dumps(m), False)
        return self.json_ok() if ret else self.json_error("notsent")

urls = (
    '/trial', 'TrialHandler',
    '/connect', 'ConnectHandler',
    '/message', 'MessageHandler',
    '/_sae/channel/message', 'MessageHandler',
)
web.config.debug = True

application = sae.create_wsgi_app(web.application(urls, globals()).wsgifunc())
