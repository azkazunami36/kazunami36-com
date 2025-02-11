import cookieValueGet from "../src/js/cookieValueGet.js";
import postTool from "../src/js/postTool.js";
import { sumPageInit } from "../src/js/sumPageInit.js";
addEventListener("load", () => {
    sumPageInit();
    if (cookieValueGet("token") && cookieValueGet("id"))
        window.location.href = "/accountManage/";
    const createAccountWindow = document.getElementById("createAccountWindow");
    const id = document.getElementById("id");
    const nickname = document.getElementById("nickname");
    const mailAddress = document.getElementById("mailAddress");
    const password = document.getElementById("password");
    const repassword = document.getElementById("repassword");
    if (!(id && nickname && mailAddress && password && repassword))
        return;
    const emptynickname = document.getElementById("emptynickname");
    const emptymailaddress = document.getElementById("emptymailaddress");
    const usedmailaddress = document.getElementById("usedmailaddress");
    const emptyid = document.getElementById("emptyid");
    const duplicid = document.getElementById("duplicid");
    const incorrectid = document.getElementById("incorrectid");
    const shortageid = document.getElementById("shortageid");
    const toolongid = document.getElementById("toolongid");
    const emptypassword = document.getElementById("emptypassword");
    const notmatchingpassword = document.getElementById("notmatchingpassword");
    const shortagepassword = document.getElementById("shortagepassword");
    if (!(emptynickname && emptymailaddress && usedmailaddress && emptyid && duplicid && incorrectid && shortageid && toolongid && emptypassword && notmatchingpassword && shortagepassword))
        return;
    const authCodeWindow = document.getElementById("authCodeWindow");
    const authCode = document.getElementById("authCode");
    const notmatchcode = document.getElementById("notmatchcode");
    if (!(authCode && notmatchcode))
        return;
    if (!(createAccountWindow && authCodeWindow))
        return;
    const submit = document.getElementById("submit");
    const authsubmit = document.getElementById("authsubmit");
    if (!(submit && authsubmit))
        return;
    let createData = {};
    submit.addEventListener("click", async (e) => {
        e.preventDefault();
        const emptynicknameIs = nickname.value === "";
        const emptymailaddressIs = mailAddress.value === "";
        const usedmailaddressIs = false;
        const emptyidIs = id.value === "";
        const duplicidIs = false;
        const incorrectidIs = id.value.replaceAll(/[0-9a-zA-Z._\-]/g, "") !== "";
        const shortageidIs = id.value.length <= 5;
        const toolongidIs = id.value.length >= 40;
        const emptypasswordIs = password.value === "";
        const notmatchingpasswordIs = password.value !== repassword.value;
        const shortagepasswordIs = password.value.length <= 8;
        emptynickname.style.display = emptynicknameIs ? "block" : "none";
        emptymailaddress.style.display = emptymailaddressIs ? "block" : "none";
        emptyid.style.display = emptyidIs ? "block" : "none";
        emptypassword.style.display = emptypasswordIs ? "block" : "none";
        usedmailaddress.style.display = usedmailaddressIs ? "block" : "none";
        duplicid.style.display = duplicidIs ? "block" : "none";
        incorrectid.style.display = incorrectidIs ? "block" : "none";
        shortageid.style.display = (!emptyidIs && shortageidIs) ? "block" : "none";
        toolongid.style.display = toolongidIs ? "block" : "none";
        notmatchingpassword.style.display = (!emptypasswordIs && notmatchingpasswordIs) ? "block" : "none";
        shortagepassword.style.display = (!emptypasswordIs && shortagepasswordIs) ? "block" : "none";
        if (emptynicknameIs
            || emptymailaddressIs
            || usedmailaddressIs
            || emptyidIs
            || duplicidIs
            || incorrectidIs
            || shortageidIs
            || toolongidIs
            || emptypasswordIs
            || notmatchingpasswordIs
            || shortagepasswordIs)
            return;
        createData = {
            userID: id.value,
            nickname: nickname.value,
            mailAddress: mailAddress.value,
            mailCheckToken: undefined,
            password: password.value
        };
        try {
            await postTool("/userRequest/mailAuthCodeSend", { mailAddress: createData.mailAddress, userID: createData.userID });
            createAccountWindow.style.display = "none";
            authCodeWindow.style.display = "block";
            authsubmit.addEventListener("click", async (e) => {
                e.preventDefault();
                try {
                    notmatchcode.style.display = "none";
                    createData.mailCheckToken = JSON.parse(String(await postTool("/userRequest/mailTokenGet", { mailAddress: createData.mailAddress, code: authCode.value }))).mailToken;
                    ;
                    await postTool("/userRequest/createAccounts", createData);
                    const loginToken = JSON.parse(String(await postTool("/userRequest/loginTokenGet", createData))).loginToken;
                    document.cookie = "token=" + loginToken + ";maxage=" + (60 * 60 * 24 * 180) + "; path=/";
                    document.cookie = "id=" + createData.userID + ";maxage=" + (60 * 60 * 24 * 180) + "; path=/";
                    window.location.href = "/accountManage/";
                }
                catch (e) {
                    console.log(e);
                    notmatchcode.style.display = "block";
                }
                authCode.value;
            });
        }
        catch (e) {
        }
    });
});
