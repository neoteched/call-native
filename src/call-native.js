const Promise = require("promise");

if (typeof window.neo !== "object") {
    window.neo = {};
}
if (typeof window.neo.skapp !== "object") {
    window.neo.skapp = {
        delegates: {},
    };
}
const neo = window.neo;
const skapp = window.neo.skapp;
const callNative = (o) => {
    const msg = JSON.stringify(o);
    console.log(msg);
    if (navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPod/i) ||
        navigator.userAgent.match(/iOS/i)
    ) {
        window.webkit.messageHandlers.app.postMessage(msg);
    } else if (navigator.userAgent.match(/Android/i)) {
        let r = AndroidApp.callNative(msg);
        if (r) {
            eval(o.ok + "(" + r + ")");
        }
    } else {
        console.error("Only SKAPP is supported");
    }
};

const randStr = (length, chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789") =>
    (length > 0 ? (chars[Math.floor(Math.random() * chars.length)] + randStr(length - 1, chars)) : "");

skapp.callVoid = (name, ...args) => {
    callNative({
        func: name,
        args: args,
        ok: "",
        err: "",
    });
};

skapp.callAsync = (name, ...args) => {
    return new Promise((resolve, reject) => {
        let successName = "ok" + randStr(5);
        let errorName = "err" + randStr(5);
        skapp.delegates[successName] = (result) => {
            delete skapp.delegates[successName];
            delete skapp.delegates[errorName];
            resolve(result);
        };
        skapp.delegates[errorName] = (error) => {
            delete skapp.delegates[successName];
            delete skapp.delegates[errorName];
            reject(error);
        };
        callNative({
            func: name,
            args: args,
            ok: "neo.skapp.delegates." + successName,
            err: "neo.skapp.delegates." + errorName,
        });
    });
};

skapp.dial = (tel) => {
    skapp.callVoid("dial", tel || "");
};

skapp.setTitle = (newTitle) => {
    if (typeof newTitle !== "string")
        newTitle = newTitle.toString();
    skapp.callVoid("setTitle", newTitle);
};

skapp.getUser = function () {
    return skapp.callAsync("getUser");
};

skapp.gotoSjdct = function () {
    skapp.callVoid("gotoSjdct");
};

document.documentElement.addEventListener("DOMSubtreeModified", (ev) => {
    if (ev.target.tagName.toLowerCase() === "title") {
        neo.skapp.setTitle(ev.target.innerText);
    }
});

module.exports = neo;
