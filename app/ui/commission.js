"use strict";

const { app } = require('electron').remote
let settings = app.theApp.settings;

function on_query_enter_click() {
    document.getElementById('idetail-header').textContent = "";
    document.getElementById('idetail').classList.add("hidden");
    let q = document.getElementById("query").value;
    if (!q) {
        document.getElementById('idetail-header').textContent = "请输入宝贝名称或 URL";
        return;
    }
    if (!app.theApp.aliServices.bkgrdWndApiImpl){
        document.getElementById('idetail-header').textContent = "未准备就绪";
        return;
    }
    app.theApp.aliServices.bkgrdWndApiImpl.search_item(q, ret=>{
        if (ret.ok) {
            if (!ret.data.pageList){
                document.getElementById("idetail-header").textContent = "未找到宝贝推广信息";
                return;
            }
            let item = ret.data.pageList[0];
            document.getElementById('idetail').classList.remove("hidden");
            document.getElementById('idetail-header').innerHTML = item.title;
            document.getElementById("idetail-url").textContent = item.auctionUrl;
            document.getElementById('idetail-fee').textContent = "￥" + item.tkCommFee;
            document.getElementById('idetail-rate').textContent = item.tkRate + "%";
            document.getElementById('idetail-totalNum').textContent = item.totalNum;
            document.getElementById('idetail-biz30day').textContent = item.biz30day;
            document.getElementById('idetail-totalFee').textContent = "￥" + item.totalFee;

            let siteid = settings.alisiteid;
            let adzoneid = settings.aliadzoneid;
            if (!siteid || !adzoneid) {
                document.getElementById("idetail-header").textContent = "未配置推广位ID和广告位ID";
                return;
            }
            app.theApp.aliServices.bkgrdWndApiImpl.trans_url(siteid, adzoneid, item.auctionUrl, ret=>{
                if (ret.ok)
                    document.getElementById("idetail-slick").textContent = ret.sclick;
                else
                    document.getElementById("idetail-slick").textContent = "错误："+ret.err;
            });
        }
        else {
            document.getElementById('idetail-header').textContent = "错误："+ret.err;
            return;
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("query-enter").addEventListener('click', on_query_enter_click);
    let q = document.getElementById("query");
    q.focus();
    q.addEventListener('keydown', e=>{
        if(e.keyCode == 13) on_query_enter_click();
    });
    document.title = `${app.theApp.info.name} - 佣金查询 - ${app.theApp.info.desc}`;
});
