import { sumPageInit } from "../src/js/sumPageInit.js";
import userManageAPI from "../src/js/userManageAPI.js";
addEventListener("load", () => {
    sumPageInit();
    if (userManageAPI.defaultUserExist())
        window.location.href = "/accountManage/";
    const loginWindow = document.getElementById("loginWindow");
    const username = document.getElementById("username");
    const password = document.getElementById("password");
    if (!(username && password))
        return;
    const emptyusername = document.getElementById("emptyusername");
    const emptypassword = document.getElementById("emptypassword");
    const notmatchingpassword = document.getElementById("notmatchingpassword");
    if (!(emptyusername && emptypassword && notmatchingpassword))
        return;
    const authCodeWindow = document.getElementById("authCodeWindow");
    const authCode = document.getElementById("authCode");
    const notmatchcode = document.getElementById("notmatchcode");
    if (!(authCode && notmatchcode))
        return;
    if (!(loginWindow && authCodeWindow))
        return;
    const submit = document.getElementById("submit");
    const authsubmit = document.getElementById("authsubmit");
    if (!(submit && authsubmit))
        return;
    submit.addEventListener("click", async (e) => {
        e.preventDefault();
        const emptynicknameIs = username.value === "";
        const emptypasswordIs = password.value === "";
        const notmatchingpasswordIs = false;
        emptyusername.style.display = emptynicknameIs ? "block" : "none";
        emptypassword.style.display = emptypasswordIs ? "block" : "none";
        notmatchingpassword.style.display = (!emptypasswordIs && notmatchingpasswordIs) ? "block" : "none";
        if (emptynicknameIs
            || emptypasswordIs
            || notmatchingpasswordIs)
            return;
        try {
            const userID = await userManageAPI.userNameToUserID(username.value);
            console.log(userID, { userID });
            if (!await userManageAPI.mailAuthCodeSend({ userID }))
                throw "メールを送信できませんでした。";
            console.log("づい");
            loginWindow.style.display = "none";
            authCodeWindow.style.display = "block";
            authsubmit.addEventListener("click", async (e) => {
                e.preventDefault();
                notmatchcode.style.display = "none";
                try {
                    if (typeof userID !== "string")
                        throw "不明なエラー";
                    if (!await userManageAPI.autoAuthAndLogin({ userID, mailAuthCode: authCode.value, password: password.value }))
                        throw "ログイン失敗";
                    window.location.href = "/accountManage/";
                }
                catch (e) {
                    console.log(e);
                    notmatchcode.style.display = "block";
                }
            });
        }
        catch (e) { }
        ;
    });
});
