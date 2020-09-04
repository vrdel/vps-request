! function (e, t) {
    "object" == typeof exports && "object" == typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define([], t) : "object" == typeof exports ? exports["./dist"] = t() : e["./dist"] = t()
}(window, function () {
    return function (e) {
        var t = {};

        function n(s) {
            if (t[s]) return t[s].exports;
            var i = t[s] = {
                i: s,
                l: !1,
                exports: {}
            };
            return e[s].call(i.exports, i, i.exports, n), i.l = !0, i.exports
        }
        return n.m = e, n.c = t, n.d = function (e, t, s) {
            n.o(e, t) || Object.defineProperty(e, t, {
                enumerable: !0,
                get: s
            })
        }, n.r = function (e) {
            "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
                value: "Module"
            }), Object.defineProperty(e, "__esModule", {
                value: !0
            })
        }, n.t = function (e, t) {
            if (1 & t && (e = n(e)), 8 & t) return e;
            if (4 & t && "object" == typeof e && e && e.__esModule) return e;
            var s = Object.create(null);
            if (n.r(s), Object.defineProperty(s, "default", {
                enumerable: !0,
                value: e
            }), 2 & t && "string" != typeof e)
                for (var i in e) n.d(s, i, function (t) {
                    return e[t]
                }.bind(null, i));
            return s
        }, n.n = function (e) {
            var t = e && e.__esModule ? function () {
                return e.default
            } : function () {
                return e
            };
            return n.d(t, "a", t), t
        }, n.o = function (e, t) {
            return Object.prototype.hasOwnProperty.call(e, t)
        }, n.p = "", n(n.s = 0)
    }([function (e, t, n) {
        "use strict";
        n.r(t);
        let s = document.body || document.getElementsByTagName("body")[0],
            i = new Map,
            o = {
                jsonToHtml: (e, t) => {
                    let n = document.createElement(e.type);
                    for (let s in e.attrs) 0 === s.indexOf("#") && t ? n.setAttribute(e.attrs[s], t[s.substring(1)]) : n.setAttribute(s, e.attrs[s]);
                    for (let s in e.children) {
                        let i = null;
                        ((i = "#text" == e.children[s].type ? 0 == e.children[s].text.indexOf("#") ? document.createTextNode(t[e.children[s].text.substring(1)]) : document.createTextNode(e.children[s].text) : o.jsonToHtml(e.children[s], t)) && i.tagName && "undefined" !== i.tagName.toLowerCase() || 3 == i.nodeType) && n.appendChild(i)
                    }
                    return n
                },
                injectStyle: (e, t = {}) => {
                    let n = document.createElement("style");
                    return n.appendChild(document.createTextNode(e)), t.className && n.classList.add(t.className), s.appendChild(n), n
                },
                getFormattedDim: e => {
                    if (!e) return null;
                    let t = function (e, t) {
                        return {
                            size: e.substring(0, e.indexOf(t)),
                            sufix: t
                        }
                    };
                    return (e = String(e)).indexOf("%") > -1 ? t(e, "%") : e.indexOf("px") > -1 ? t(e, "px") : e.indexOf("em") > -1 ? t(e, "em") : e.indexOf("rem") > -1 ? t(e, "rem") : e.indexOf("pt") > -1 ? t(e, "pt") : "auto" == e ? t(e, "") : void 0
                },
                getInlineStyle: (e, t) => {
                    if (!e || !t) return null;
                    let n = [].map.call(e.getAttribute("style").split(";"), e => [].map.call(e.split(":"), e => e.trim()));
                    for (let e = 0; e < n.length; ++e)
                        if (n[e][0] === t) return n[e][1];
                    return null
                },
                addInlineStyle: (e, t) => {
                    if (!e || !t) return !1;
                    let n = e.getAttribute("style");
                    return n && (t = n + t), e.setAttribute("style", t), !0
                },
                removeInlineStyle: (e, t) => {
                    if (!e || !t) return !1;
                    let n = e.getAttribute("style");
                    return n && ((t = n.replace(t, "")) ? e.setAttribute("style", t) : e.removeAttribute("style")), !0
                },
                extend: (e, t) => {
                    for (let n in e) "object" == typeof e[n] ? t && t[n] && (e[n] = o.extend(e[n], t[n])) : "object" == typeof t && void 0 !== t[n] && (e[n] = t[n]);
                    return e
                },
                injectIconsCss() {
                    let e = document.getElementsByTagName("head")[0],
                        t = document.createElement("link");
                    t.type = "text/css", t.rel = "stylesheet", t.href = "https://fonts.googleapis.com/icon?family=Material+Icons", t.className = "_access-material-icons", o.deployedObjects.set("." + t.className, !0), e.appendChild(t)
                },
                injectDyslexicCss() {
                    let e = document.getElementsByTagName("head")[0],
                        t = document.createElement("link");
                    t.type = "text/css", t.rel = "stylesheet", t.href = "https://cdn.clarkhacks.com/OpenDyslexic/v3/OpenDyslexic.css", t.className = "_access-dyslexic-font", o.deployedObjects.set("." + t.className, !0), e.appendChild(t)
                },
                removeDyslexicCss() {
                    document.querySelector("._access-dyslexic-font").remove()
                },
                warn(e) {
                    console.warn ? console.warn("Accessibility: " + e) : console.log("Accessibility: " + e)
                },
                deployedObjects: {
                    get: e => i.get(e),
                    contains: e => i.has(e),
                    set: (e, t) => {
                        i.set(e, t)
                    },
                    remove: e => {
                        i.delete(e)
                    },
                    getAll: () => i
                }
            };
        var c = o;
        c.injectIconsCss();
        let a = {
            icon: {
                position: {
                    bottom: {
                        size: 50,
                        units: "px"
                    },
                    right: {
                        size: 0,
                        units: "px"
                    },
                    type: "fixed"
                },
                dimensions: {
                    width: {
                        size: 50,
                        units: "px"
                    },
                    height: {
                        size: 50,
                        units: "px"
                    }
                },
                zIndex: "9999",
                backgroundColor: "#4054b2",
                color: "#fff",
                img: "accessible",
                circular: !1
            },
            menu: {
                dimensions: {
                    width: {
                        size: 25,
                        units: "vw"
                    },
                    height: {
                        size: "auto",
                        units: ""
                    }
                },
                fontFamily: "RobotoDraft, Roboto, sans-serif, Arial"
            },
            labels: {
        	   menuTitle: "Pristupačnost",
               increaseText: "Povećaj veličinu fonta",
               resetText: "Poništi veličinu fonta",
               highContrast: "Kontrast",
               dyslexicFont: "Disleksija",
               underlineLinks: "Podcrtaj linkove",
               invertColors: "invert colors",
               grayHues: "gray hues"
            },
            textToSpeechLang: "en-US",
            speechToTextLang: "en-US",
            textPixelMode: !1,
            animations: {
                buttons: !0
            },
            modules: {
                increaseText: !0,
                resetText: !0,
                invertColors: !0,
                grayHues: !0,
                underlineLinks: !0,
                textToSpeech: !0,
                speechToText: !0
            }
        },
            l = null;
        class r {
            constructor(e = {}) {
                l = this, e = this.deleteOppositesIfDefined(e), this.options = c.extend(a, e), this.disabledUnsupportedFeatures(), this.build();
                let t = null,
                    n = null,
                    s = null,
                    i = null;
                null == (t = window.sessionStorage.getItem("_access-increasetext")) && (t = window.localStorage.getItem("_access-increasetext")), null == (n = window.sessionStorage.getItem("_access-dyslexicfont")) && (n = window.localStorage.getItem("_access-dyslexicfont")), null == (s = window.sessionStorage.getItem("_access-highcontrast")) && (s = window.localStorage.getItem("_access-highcontrast")), null == (i = window.sessionStorage.getItem("_access-underlinelinks")) && (i = window.localStorage.getItem("_access-underlinelinks")), "true" === t && this.menuInterface.increaseText(), "true" === n && this.menuInterface.dyslexicFont(), "true" === s && this.menuInterface.highContrast(), "true" === i && this.menuInterface.underlineLinks(), "true" === window.sessionStorage.getItem("_access-settings-changed") && (document.querySelector("._access-menu p button").removeAttribute("disabled"), window.sessionStorage.removeItem("_access-settings-changed"))
            }
            deleteOppositesIfDefined(e) {
                return e.icon && e.icon.position && (e.icon.position.left && (delete a.icon.position.right, a.icon.position.left = e.icon.position.left), e.icon.position.top && (delete a.icon.position.bottom, a.icon.position.top = e.icon.position.top)), e
            }
            disabledUnsupportedFeatures() {
                "webkitSpeechRecognition" in window && "https:" == location.protocol || (this.options.modules.speechToText = !1), window.SpeechSynthesisUtterance && window.speechSynthesis || (this.options.modules.textToSpeech = !1), navigator.userAgent.toLowerCase().indexOf("firefox") > -1 && (this.options.modules.grayHues = !1)
            }
            injectCss() {
                let e = "\n        ._access-icon {\n            position: " + this.options.icon.position.type + ";\n            background-repeat: no-repeat;\n            background-size: contain;\n            cursor: pointer;\n            opacity: 0;\n            transition-duration: .5s;\n            -moz-user-select: none;\n            -webkit-user-select: none;\n            -ms-user-select: none;\n            user-select: none;\n        }\n        .circular._access-icon {\n            border-radius: 50%;\n        }\n        ._access-menu {\n            -moz-user-select: none;\n            -webkit-user-select: none;\n            -ms-user-select: none;\n            user-select: none;\n            position: fixed;\n            width: " + this.options.menu.dimensions.width.size + this.options.menu.dimensions.width.units + ";\n            height: " + this.options.menu.dimensions.height.size + this.options.menu.dimensions.height.units + ";\n            transition-duration: .5s;\n            z-index: " + this.options.icon.zIndex + "1;\n            opacity: 1;\n            background-color: #fff;\n            color: #000;\n            border-radius: 3px;\n            border: solid 1px #f1f0f1;\n            font-family: " + this.options.menu.fontFamily + ";\n            min-width: 300px;\n            box-shadow: 0px 0px 1px #aaa;\n            max-height: 100vh;\n            " + ("rtl" == getComputedStyle(this.body).direction ? "text-indent: -5px" : "") + "\n        }\n        ._access-menu._access-close {\n            z-index: -1;\n            opacity: 0;\n            background-color: transparent;\n        }\n        ._access-menu.bottom {\n            bottom: 0;\n        }\n        ._access-menu.top {\n            top: 0;\n        }\n        ._access-menu.left {\n            left: 0;\n        }\n        ._access-menu._access-close.left {\n            left: -" + this.options.menu.dimensions.width.size + this.options.menu.dimensions.width.units + ";\n        }\n        ._access-menu.right {\n            right: 0;\n        }\n        ._access-menu._access-close.right {\n            right: -" + this.options.menu.dimensions.width.size + this.options.menu.dimensions.width.units + ';\n        }\n        ._access-menu ._text-center {\n            text-align: center;\n        }\n        ._access-menu h3 {\n            font-size: 24px !important;\n            margin-top: 20px;\n            margin-bottom: 20px;\n            padding: 0;\n            color: rgba(0,0,0,.87);\n        }\n        ._access-menu ._menu-close-btn {\n            left: 5px;\n            color: #d63c3c;\n        }\n        ._access-menu ._menu-reset-btn {\n            right: 5px;\n            color: #4054b2;\n        }\n        ._access-menu ._menu-btn {\n            position: absolute;\n            top: 5px;\n            cursor: pointer;\n            font-size: 24px !important;\n            font-weight: bold;\n        }\n        ._access-menu ul {\n            padding: 0;\n            position: relative;\n            font-size: 18px !important;\n            margin: 0;\n        }\n        ._access-menu ul li {\n            list-style-type: none;\n            cursor: pointer;\n            -ms-user-select: none;\n            -moz-user-select: none;\n            -webkit-user-select: none;\n            user-select: none;\n            border: solid 1px #f1f0f1;\n            padding: 10px 0 10px 30px;\n            margin: 5px;\n            border-radius: 4px;\n            transition-property: opacity;\n            transition-duration: .5s;\n            transition-timing-function: ease-in-out;\n            font-size: 18px !important;\n            line-height: 18px !important;\n            text-indent: 5px;\n            background: #f9f9f9;\n            color: rgba(0,0,0,.6);\n        }\n        ._access-menu ul li[data-access-action="resetText"] {\n            display: none;\n        }\n        ._access-menu ul.before-collapse li {\n            opacity: 0.05;\n        }\n        ._access-menu ul li.active, ._access-menu ul li.active:hover {\n            color: #fff;\n            background-color: #000;\n        }\n        ._access-menu ul li:hover {\n            color: rgba(0,0,0,.8);\n            background-color: #eaeaea;\n        }\n        ._access-menu ul li.not-supported {\n            display: none;\n        }\n        ._access-menu ul li:before {\n            content: \' \';\n            font-family: \'Material Icons\';\n            text-rendering: optimizeLegibility;\n            font-feature-settings: "liga" 1;\n            font-style: normal;\n            text-transform: none;\n            line-height: 1;\n            font-size: 24px !important;\n            width: 30px;\n            height: 30px;\n            display: inline-block;\n            overflow: hidden;\n            -webkit-font-smoothing: antialiased;\n            left: 8px;\n            position: absolute;\n            color: rgba(0,0,0,.6);\n            direction: ltr;\n        }\n        ._access-menu ul li .tick {\n            font-family: \'Material Icons\';\n            text-rendering: optimizeLegibility;\n            font-feature-settings: "liga" 1;\n            font-style: normal;\n            font-size: 24px !important;\n            text-transform: none;\n            display: none;\n            overflow: hidden;\n            -webkit-font-smoothing: antialiased;\n            color: rgba(0,0,0,.6);\n            direction: ltr;\n            margin-left: 5px;\n        }\n        [data-increasetext-applied] [data-access-action="increaseText"] .tick {\n            display: inline-block;\n        }\n        [data-increasetext-applied] ._access-menu ul li[data-access-action="resetText"] {\n            display: block;\n        }\n        [data-highcontrast-applied] [data-access-action="highContrast"] .tick {\n            display: inline-block;\n        }\n        [data-dyslexic-applied] [data-access-action="dyslexicFont"] .tick {\n            display: inline-block;\n        }\n        [data-underline-applied] [data-access-action="underlineLinks"] .tick {\n            display: inline-block;\n        }\n        html[data-highcontrast-applied] ._access-menu ul li:before,\n        html[data-highcontrast-applied] ._access-menu ul li .tick {\n            color: rgba(255,255,255,.6);\n        }\n        ._access-menu ul li[data-access-action="increaseText"]:before {\n            content: \'zoom_in\';\n        }\n        ._access-menu ul li[data-access-action="resetText"]:before {\n            content: \'settings_backup_restore\';\n        }\n        ._access-menu ul li[data-access-action="highContrast"]:before {\n            content: \'invert_colors\';\n        }\n        ._access-menu ul li[data-access-action="dyslexicFont"]:before {\n            content: \'font_download\';\n        }\n        ._access-menu ul li[data-access-action="underlineLinks"]:before {\n            content: \'format_underlined\';\n        }\n        ._access-menu p {\n            margin: 10px;\n            padding: 0;\n            color: rgba(0,0,0,.87);\n        }\n        ._access-menu p button {\n            display: block;\n            margin-top: 10px;\n        }\n        ._access-menu p {\n            -ms-user-select: none;\n            -moz-user-select: none;\n            -webkit-user-select: none;\n            user-select: none;\n            transition-property: opacity;\n            transition-duration: .5s;\n            transition-timing-function: ease-in-out;\n        }\n        ._access-menu p.before-collapse {\n            opacity: 0;\n        }\n        ';
                c.injectStyle(e, {
                    className: "_access-main-css"
                }), c.deployedObjects.set("._access-main-css", !1)
            }
            injectIcon() {
                let e = "width: " + this.options.icon.dimensions.width.size + this.options.icon.dimensions.width.units + ";height: " + this.options.icon.dimensions.height.size + this.options.icon.dimensions.height.units + ";font-size: " + this.options.icon.dimensions.width.size + this.options.icon.dimensions.width.units + ";background-color: " + this.options.icon.backgroundColor + ";color: " + this.options.icon.color;
                for (let t in this.options.icon.position) e += ";" + t + ":" + this.options.icon.position[t].size + this.options.icon.position[t].units;
                e += ";z-index: " + this.options.icon.zIndex;
                let t = "_access-icon material-icons _access" + (this.options.icon.circular ? " circular" : ""),
                    n = c.jsonToHtml({
                        type: "i",
                        attrs: {
                            class: t,
                            style: e
                        },
                        children: [{
                            type: "#text",
                            text: this.options.icon.img
                        }]
                    });
                return this.body.appendChild(n), c.deployedObjects.set("._access-icon", !1), n
            }
            injectMenu() {
                let e = c.jsonToHtml({
                    type: "div",
                    attrs: {
                        class: "_access-menu _access-close _access"
                    },
                    children: [{
                        type: "h3",
                        attrs: {
                            class: "_text-center"
                        },
                        children: [{
                            type: "i",
                            attrs: {
                                class: "_menu-close-btn _menu-btn material-icons"
                            },
                            children: [{
                                type: "#text",
                                text: "close"
                            }]
                        }, {
                            type: "#text",
                            text: this.options.labels.menuTitle
                        }, {
                            type: "i",
                            attrs: {
                                class: "_menu-reset-btn _menu-btn material-icons"
                            },
                            children: [{
                                type: "#text",
                                text: "refresh"
                            }]
                        }]
                    }, {
                        type: "ul",
                        attrs: {
                            class: this.options.animations.buttons ? "before-collapse" : ""
                        },
                        children: [{
                            type: "li",
                            attrs: {
                                "data-access-action": "increaseText"
                            },
                            children: [{
                                type: "#text",
                                text: this.options.labels.increaseText
                            }]
                        }, {
                            type: "li",
                            attrs: {
                                "data-access-action": "resetText"
                            },
                            children: [{
                                type: "#text",
                                text: this.options.labels.resetText
                            }]
                        }, {
                            type: "li",
                            attrs: {
                                "data-access-action": "highContrast"
                            },
                            children: [{
                                type: "#text",
                                text: this.options.labels.highContrast
                            }]
                        }, {
                            type: "li",
                            attrs: {
                                "data-access-action": "dyslexicFont"
                            },
                            children: [{
                                type: "#text",
                                text: this.options.labels.dyslexicFont
                            }]
                        }, {
                            type: "li",
                            attrs: {
                                "data-access-action": "underlineLinks"
                            },
                            children: [{
                                type: "#text",
                                text: this.options.labels.underlineLinks
                            }]
                        }]
                    }, {
                        type: "p",
                        attrs: {
                            class: this.options.animations.buttons ? "before-collapse" : ""
                        },
                        children: [{
                            type: "#text",
                            text: "Ako želite spremiti trajne postavke, kliknite Spremi, ako ne - vaše će se postavke poništiti kad zatvorite preglednik."
                        }, {
                            type: "button",
                            attrs: {
                                "data-access-action": "saveSettings",
                                disabled: "disabled"
                            },
                            children: [{
                                type: "#text",
                                text: "Spremi"
                            }]
                        }]
                    }]
                });
                for (let t in this.options.icon.position) e.classList.add(t);
                this.body.appendChild(e), c.deployedObjects.set("._access-menu", !1), document.querySelector("._access-menu ._menu-close-btn").addEventListener("click", () => {
                    this.toggleMenu()
                }, !1), document.querySelector("._access-menu ._menu-reset-btn").addEventListener("click", () => {
                    this.resetAll()
                }, !1);
                let t = e.querySelectorAll("li");
                for (let e = 0; e < t.length; ++e) {
                    let n = t[e];
                    n.innerHTML = n.innerHTML + '<span class="tick">done_outline</span>'
                }
                return e
            }
            addListeners() {
                let e = document.querySelectorAll("._access-menu ul li, ._access-menu p button");
                for (let t = 0; t < e.length; t++) e[t].addEventListener("click", e => {
                    let t = e || window.event;
                    this.invoke(t.target.getAttribute("data-access-action"))
                }, !1)
            }
            disableUnsupportedModules() {
                for (let e in this.options.modules)
                    if (!this.options.modules[e]) {
                        let t = document.querySelector('li[data-access-action="' + e + '"]');
                        t && t.classList.add("not-supported")
                    }
            }
            resetAll() {
                window.sessionStorage.removeItem("_access-increasetext"), window.sessionStorage.removeItem("_access-highcontrast"), window.sessionStorage.removeItem("_access-dyslexicfont"), window.sessionStorage.removeItem("_access-underlinelinks"), window.localStorage.removeItem("_access-increasetext"), window.localStorage.removeItem("_access-highcontrast"), window.localStorage.removeItem("_access-dyslexicfont"), window.localStorage.removeItem("_access-underlinelinks"), window.location.reload()
            }
            toggleMenu() {
                this.menu.classList.contains("_access-close") ? (this.options.animations && this.options.animations.buttons && setTimeout(() => {
                    this.menu.querySelector("ul").classList.toggle("before-collapse"), this.menu.querySelector("p").classList.toggle("before-collapse")
                }, 500), setTimeout(() => {
                    this.menu.classList.toggle("_access-close")
                }, 10)) : this.options.animations && this.options.animations.buttons ? (setTimeout(() => {
                    this.menu.classList.toggle("_access-close")
                }, 500), setTimeout(() => {
                    this.menu.querySelector("ul").classList.toggle("before-collapse"), this.menu.querySelector("p").classList.toggle("before-collapse")
                }, 10)) : this.menu.classList.toggle("_access-close")
            }
            invoke(e) {
                "function" == typeof this.menuInterface[e] && this.menuInterface[e]()
            }
            build() {
                if (this.initialValues = {
                    underlineLinks: !1,
                    textToSpeech: !1,
                    body: {},
                    html: {}
                }, this.body = document.body || document.getElementsByTagName("body")[0], this.html = document.documentElement || document.getElementsByTagName("html")[0], this.injectCss(), this.icon = this.injectIcon(), this.menu = this.injectMenu(), this.addListeners(), this.disableUnsupportedModules(), this.icon.addEventListener("click", () => {
                    this.toggleMenu()
                }, !1), setTimeout(() => {
                    this.icon.style.opacity = "1"
                }, 10), window.SpeechSynthesisUtterance || window.speechSynthesis) {
                    window.speechSynthesis.getVoices()
                }
                this.menuInterface = {
                    increaseText: () => {
                        if (this.html.getAttribute("data-increasetext-applied")) return;
                        let e = Array.from(document.querySelectorAll("body *")),
                            t = Array.from(document.querySelectorAll("._access-menu, ._access-menu *, ._access-icon"));
                        (e = e.filter(e => t.indexOf(e) < 0)).forEach(e => {
                            let t = parseInt(getComputedStyle(e).fontSize) + "px";
                            c.addInlineStyle(e, ";;font-size:" + t + ";;")
                        }), e.forEach(e => {
                            let t = 1.25 * parseInt(getComputedStyle(e).fontSize) + "px",
                                n = e.getAttribute("style").replace(/;;font-size:.+?;;/, ";;font-size:" + t + ";;");
                            e.setAttribute("style", n)
                        }), window.sessionStorage.setItem("_access-increasetext", "true"), this.html.removeAttribute("data-resetText-applied"), this.html.setAttribute("data-increasetext-applied", "true"), document.querySelector("._access-menu p button").removeAttribute("disabled")
                    },
                    resetText: () => {
                        let e = document.querySelectorAll("*:not(._access)");
                        for (let t = 0; t < e.length; ++t) {
                            let n = e[t],
                                s = n.getAttribute("style");
                            s && (s = s.replace(/;;font-size:.+?;;/, "")), s ? n.setAttribute("style", s) : n.removeAttribute("style")
                        }
                        window.sessionStorage.removeItem("_access-increasetext"), this.html.removeAttribute("data-increasetext-applied"), document.querySelector("._access-menu p button").removeAttribute("disabled")
                    },
                    highContrast: () => {
                        let e = this.html.getAttribute("data-highcontrast-applied"),
                            t = document.querySelectorAll("*");
                        const n = ";;color:#fff!important;opacity:1!important;;";
                        e ? (this.html.removeAttribute("data-highcontrast-applied"), window.sessionStorage.setItem("_access-highcontrast", "false"), window.location.reload()) : (c.addInlineStyle(document.body, n + ";;background-color:#000!important;;"), [].forEach.call(t, e => {
                        	 "none" !== getComputedStyle(e).backgroundImage || "IMG" === e.tagName || e.classList.contains("circle", "slice") || e.classList.contains("slice") || e.classList.contains("bar") ||  e.classList.contains("narancasta") || e.classList.contains("crvena") || e.classList.contains("progress") || e.classList.contains("focus-input100") || e.classList.contains("lnr-user") || e.classList.contains("lnr-lock") || e.classList.contains("navigation-trigger__line") || e.classList.contains("symbol-input100") || e.classList.contains("jjambg") || e.classList.contains("wrap-input100") || e.classList.contains("progress-bar") || c.addInlineStyle(e, ";;background-color:#000!important;;"), c.addInlineStyle(e, n)
                        }), this.html.setAttribute("data-highcontrast-applied", "true"), window.sessionStorage.setItem("_access-highcontrast", "true")), document.querySelector("._access-menu p button").removeAttribute("disabled"), window.sessionStorage.setItem("_access-settings-changed", "true")
                    },
                    dyslexicFont: () => {
                        let e = this.html.getAttribute("data-dyslexic-applied"),
                            t = document.querySelectorAll("*"),
                            n = document.querySelectorAll("._access, ._access *");
                        e ? (c.removeDyslexicCss(), [].forEach.call(t, e => {
                            let t = e.getAttribute("style");
                            t && (t = t.replace(/;;font-family:.+?;;/, "")), t ? e.setAttribute("style", t) : e.removeAttribute("style")
                        }), this.html.removeAttribute("data-dyslexic-applied"), window.sessionStorage.setItem("_access-dyslexicfont", "false")) : (c.injectDyslexicCss(), [].forEach.call(t, e => {
                            let t = ";;font-family:OpenDyslexic," + getComputedStyle(e).fontFamily + ";;";
                            c.addInlineStyle(e, t)
                        }), [].forEach.call(n, e => {
                            let t = e.getAttribute("style");
                            t && (t = t.replace(/;;font-family:.+?;;/, "")), e.setAttribute("style", t)
                        }), this.html.setAttribute("data-dyslexic-applied", "true"), window.sessionStorage.setItem("_access-dyslexicfont", "true")), document.querySelector("._access-menu p button").removeAttribute("disabled")
                    },
                    underlineLinks: () => {
                        let e = this.html.getAttribute("data-underline-applied"),
                            t = document.querySelectorAll("a");
                        e ? ([].forEach.call(t, e => {
                            c.removeInlineStyle(e, ";;text-decoration:underline !important;;")
                        }), this.html.removeAttribute("data-underline-applied"), window.sessionStorage.setItem("_access-underlinelinks", "false")) : ([].forEach.call(t, e => {
                            c.addInlineStyle(e, ";;text-decoration:underline !important;;")
                        }), this.html.setAttribute("data-underline-applied", "true"), window.sessionStorage.setItem("_access-underlinelinks", "true")), document.querySelector("._access-menu p button").removeAttribute("disabled")
                    },
                    saveSettings: () => {
                        "true" === window.sessionStorage.getItem("_access-increasetext") ? window.localStorage.setItem("_access-increasetext", "true") : window.localStorage.removeItem("_access-increasetext"), "true" === window.sessionStorage.getItem("_access-highcontrast") ? window.localStorage.setItem("_access-highcontrast", "true") : window.localStorage.removeItem("_access-highcontrast"), "true" === window.sessionStorage.getItem("_access-dyslexicfont") ? window.localStorage.setItem("_access-dyslexicfont", "true") : window.localStorage.removeItem("_access-dyslexicfont"), "true" === window.sessionStorage.getItem("_access-underlinelinks") ? window.localStorage.setItem("_access-underlinelinks", "true") : window.localStorage.removeItem("_access-underlinelinks"), document.querySelector("._access-menu p button").setAttribute("disabled", "disabled"), this.toggleMenu()
                    }
                }
            }
            resetIfDefined(e, t, n) {
                void 0 !== e && (t[n] = e)
            }
            destroy() {
                let e = c.deployedObjects.getAll();
                for (let t of e) {
                    let e = document.querySelector(t);
                    e && e.parentElement.removeChild(e)
                }
            }
        }
        r.init = e => {
            c.warn('"Accessibility.init()" is deprecated! Please use "new Accessibility()" instead'), new r(e)
        };
        var d = r;
        window.Accessibility = d
    }])
});