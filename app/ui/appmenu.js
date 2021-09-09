"use strict";

const { app, Menu } = require('electron')

const applicationMenuTemplate = [
    {
        label: '文件',
        submenu:[
            { label: "退出", click: ()=> app.theApp.cleanUpAndExit("app-menu-exit") }
        ]
    },
    {
        label: '功能',
        submenu:[
            { label: "服务状态", click: ()=> app.theApp.showMainWndContent("status") },
        ]
    },
    {
        label: 'ALIMAMA',
        submenu:[
        { label: "自动登录", click: ()=> app.theApp.aliServices.tryLogin() },
        { label: "手动登录...", click: ()=> app.theApp.aliServices.createMyUnionWindow() },
        { type: 'separator' },
        { label: "佣金查询", click: ()=> app.theApp.showMainWndContent("commission") },
        { type: 'separator' },
        { label: "效果报表...", click: ()=> app.theApp.aliServices.createMyUnionWindow() }
    ]
    },
    {
        label: "工具",
        submenu:[
            { type: 'separator' },
            { label: "下载我的客户端...", click: ()=> app.theApp.packageExtension() },
            { type: 'separator' },
            { label: "系统设置", click: ()=> app.theApp.showMainWndContent("options") }
        ]
    },
    {
        label:"帮助",
        submenu:[
            { label: "关于", click: ()=> app.theApp.showMainWndContent("about") }
        ]
    }
];

function createApplicationMenu() {
    let appMenu = Menu.buildFromTemplate(applicationMenuTemplate);
    Menu.setApplicationMenu(appMenu);
}

module.exports = createApplicationMenu;
