window.__tkr__ = {
    send: function(event) {
        console.log("__tkr__:" + event);
    },

    clearAndFocusInput: function(id) {
        let e = document.getElementById(id);
        if (e) {
            e.value = "";
            e.focus();
        }
    },

    getElementScreenRect: function(id) {
        let e = document.getElementById(id);
        if (!e) return null;

        let rect = e.getBoundingClientRect();
        let browserBoundingHeight = (window.outerHeight - window.innerHeight) - 1;
        let browserBoundingWidth = (window.outerWidth - window.innerWidth) / 2;
        return { 
            x : rect.left + screenLeft + browserBoundingWidth,
            y: rect.top + screenTop + browserBoundingHeight,
            w: rect.width,
            h: rect.height 
        };
    },

    readyToGo: function() {
        this.clearAndFocusInput("TPL_username_1");
        this.send("fireUser");
    },

    userFired: function() {
        this.clearAndFocusInput("TPL_password_1");
        this.send("firePwd");
    },

    pwdFired: function() {
        let isRecaptcha = (document.getElementById("nocaptcha").style.display=="block");
        if (isRecaptcha) {
            let slider = this.getElementScreenRect("nc_1_n1z");
            let box = this.getElementScreenRect("nc_1_wrapper");
            this.send("dragSlider: " + JSON.stringify({slider, box}));
        }
        else {
            let submit = this.getElementScreenRect("J_SubmitStatic");
            this.send("clickSubmit: " + JSON.stringify({submit}));
        }
    },

    sliderMoved: function() {
        //todo: check ready
        let submit = this.getElementScreenRect("J_SubmitStatic");
        this.send("clickSubmit: " + JSON.stringify({submit}));
    }
};
