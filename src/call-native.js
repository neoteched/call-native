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
const callNative = (o) => {//o需要这四个属性 {func: name,args: args,ok: "",err: "",}
    const msg = JSON.stringify(o); //将对象转为json字符串
    console.log(msg);
    if (navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPod/i) ||
        navigator.userAgent.match(/iOS/i)
    ) { //判断为iPad,iPhone,iPod,ios调用window.webkit.messageHandlers.app.postMessage（此方法如判断的话会返回undefined,直接调用即可）
        window.webkit.messageHandlers.app.postMessage(msg);//msg只接收字符串
    } else if (navigator.userAgent.match(/Android/i)) {//判断为android设备，调用AndroidApp.callNative方法
        let r = AndroidApp.callNative(msg);//msg只接收字符串
        if (r) { //拿到app返回值，调用e.ok里的方法，ios端由ios发起回调
            eval(o.ok + "(" + r + ")");
        }
    } else {//不是在安卓，ios app内 会console.error
        console.error("Only SKAPP is supported");
        throw "Only SKAPP is supported";
    }
};

const randStr = (length, chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789") =>
    (length > 0 ? (chars[Math.floor(Math.random() * chars.length)] + randStr(length - 1, chars)) : ""); //生成字符长度为n的随机字符串

skapp.callVoid = (name, ...args) => { //callVoid里封装了callNative,供简单调用，无返回值的方法调用，例如，拨打电话
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
        let cleanUp = () => {
            setTimeout(() => {
                delete skapp.delegates[successName];
                delete skapp.delegates[errorName];
            }, 10);
        };
        skapp.delegates[successName] = (result) => {//将成功方法存储到neo.skapp.delegates上，供app调用
            cleanUp(); //调用此方法后，过10毫秒，将绑定的成功，失败函数删除
            resolve(result);//调用then里的方法
        };
        skapp.delegates[errorName] = (error) => {
            cleanUp();
            reject(error);//调用catch里的方法
        };
        try {
            callNative({
                func: name,
                args: args,
                ok: "neo.skapp.delegates." + successName,
                err: "neo.skapp.delegates." + errorName,
            });
        } catch (error) {
            reject(error)
        }
    });
};

//打电话
skapp.dial = (tel) => {
    skapp.callVoid("dial", tel || "");
};

//设置title
skapp.setTitle = (newTitle) => {
    if (typeof newTitle !== "string")
        newTitle = newTitle.toString();
    skapp.callVoid("setTitle", newTitle);
};

//获取用户信息
skapp.getUser = function () {
    return skapp.callAsync("getUser");
};

//调app内的私教大长图
skapp.gotoSjdct = function () {
    skapp.callVoid("gotoSjdct");
};

//打开客户端支付大长图界面
skapp.gotoPaydct =()=> {
    skapp.callVoid("gotoPaydct");
};
//打开客户端分享界面分享
skapp.gotoShare = (title,describe,thumb_img_url,url)=> {
    skapp.callVoid("gotoShare",title||"",describe||"",thumb_img_url||"",url||"");
};
//打开客户端解密班详情界面
skapp.gotoDecodeDetail = (product_id)=> {
    skapp.callVoid("gotoDecodeDetail",product_id||"");
};
//进入自学习体验课程界面
skapp.gotoZiXueXiTiYan =()=> {
    skapp.callVoid("gotoZiXueXiTiYan");
};
document.documentElement.addEventListener("DOMSubtreeModified", (ev) => {
    if (ev.target.tagName.toLowerCase() === "title") {
        neo.skapp.setTitle(ev.target.innerText);//监测title有变化时执行neo.skapp.setTitle
    }
});

module.exports = neo;
