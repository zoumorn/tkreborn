(function(){
const { remote } = require("electron")
const self = {
    get_cookie: function(cname) {
        let name = cname + "=";
        let ca = document.cookie.split(';');
        for(let i=0; i<ca.length; i++) {
            let c = ca[i].trim();
            if (c.indexOf(name)==0) {
                return c.substring(name.length,c.length); 
            }
        }
        return "";
    },

    fetchex: function(url, body) {
        let f = !body ? fetch(url, {credentials:"omit"}) : fetch(url, {method:"POST", credentials:"omit", body, headers:{'Content-Type': 'application/x-www-form-urlencoded'}});
        return f.then(resp=>{
            if (!resp.ok) throw new Error("fetch-not-ok-responsed");
            return resp.json();
        })
        .then(info=>{
            if(info.ok) 
                return info.data;
            else
                throw new Error("service-no-data-returned");
        });
    },

    find_site_adzone: function(site_name, adzone_name) {
        let q = `pvid=&tag=29&t=${Date.parse(new Date())}&_tb_token_=${self.get_cookie('_tb_token_')}&_input_charset=utf-8`;
        return self.fetchex(`https://pub.alimama.com/common/adzone/newSelfAdzone2.json?${q}`)
        .then(data=>{
            for(let i = 0; i < data.otherAdzones.length; i++) {
                let site = data.otherAdzones[i];
                if(!site.sub) continue;
                for(let j = 0; j < site.sub.length; j++) {
                    let adzone = site.sub[j];
                    if (site.name == site_name && adzone.name == adzone_name) {
                        return {siteid:site.id, adzoneid:adzone.id};
                    }
                }
            }
            throw new Error("site-adzone-not-found");
        });
    },

    create_site: function(site_name) {
        let q = `pvid=&tag=29&t=${Date.parse(new Date())}&_tb_token_=${self.get_cookie('_tb_token_')}`;
        let q2 = `name=${site_name}&categoryId=30007`;
        return self.fetchex(`https://pub.alimama.com/common/site/generalize/guideAdd.json`, `${q}&${q2}`)
        .then(data_not_use=>{
            return self.fetchex(`https://pub.alimama.com/common/site/generalize/guideList.json?${q}`)
            .then(data=>{
                for(let i = 0; i < data.guideList.length; i++) {
                    let site = data.guideList[i];
                    if (site.name == site_name) return site.guideID;
                }
                throw new Error("site-not-created");
            });
        });
    },

    create_adzone: function(siteid, adzone_name) {
        let q = `pvid=&tag=29&t=${Date.parse(new Date())}&_tb_token_=${self.get_cookie('_tb_token_')}`;
        let q2 = `gcid=8&siteid=${siteid}&selectact=add&newadzonename=${adzone_name}`;
        return self.fetchex(`https://pub.alimama.com/common/adzone/selfAdzoneCreate.json`, `${q}&${q2}`)
        .then(data=>({siteid:data.siteId, adzoneid:data.adzoneId}));
    },

    get_login_info: function(callback) {
        self.fetchex(`https://pub.alimama.com/common/getUnionPubContextInfo.json`)
        .then(data=>{
            if (data.noLogin)
                callback({ ok:false, info:"nologin" });
            else
                callback({ ok:true, userId: data.memberid, userName: data.mmNick })
        })
        .catch(err=>callback({ ok:false, info:"get-login-info", err:err.message }));
    },

    ensure_site_adzone: function(site_name, adzone_name, callback) {
        self.find_site_adzone(site_name, adzone_name).then(ids=>{
            callback({ok:true, siteid:ids.siteid, adzoneid:ids.adzoneid});
        })
        .catch(err=>{
            if (err.message == "site-adzone-not-found") {
                self.create_site(site_name).then(siteid2=>{
                    self.create_adzone(siteid2, adzone_name)
                    .then(ids2=>callback({ok:true, siteid:ids2.siteid, adzoneid:ids2.adzoneid}))
                    .catch(err=>callback({ok:false, info:"create-adzone", err:err.message}));
                })
                .catch(err=>callback({ok:false, info:"create-site", err:err.message}));
            }
            else {
                callback({ok:false, info:"find-site-adzone", err:err.message});
            }
        });
    },

    trans_url: function(siteid, zoneid, url, callback) {
        let q = `pvid=&tag=29&t=${Date.parse(new Date())}&_tb_token_=${self.get_cookie('_tb_token_')}&_input_charset=utf-8`;
        let q2 = `siteid=${siteid}&adzoneid=${zoneid}&promotionURL=${encodeURIComponent(url)}`;
        self.fetchex(`https://pub.alimama.com/urltrans/urltrans.json?${q}&${q2}`)
        .then(data=>callback({ok:true, sclick:data.sclick}))
        .catch(err=>callback({ok:false, info:"trans-url", err:err.message}));
    },

    search_item: function(q, callback) {
        self.fetchex(`https://pub.alimama.com/items/search.json?q=${encodeURIComponent(q)}`)
        .then(data=>callback({ok:true, data}))
        .catch(err=>callback({ok:false, info:"search_item", err:err.message}));
    }
};

remote.app.theApp.aliServices.bkgrdWndApiImpl = self;

})();
