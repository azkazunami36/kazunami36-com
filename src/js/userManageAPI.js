import cookieValueGet from "./cookieValueGet.js";
import postTool from "./postTool.js";
export class userManageAPI {
    constructor() { }
    ;
    static defaultUserExist() {
        const token = cookieValueGet("token");
        const id = cookieValueGet("id");
        console.log(token, id);
        return (token && id) ? true : false;
    }
    ;
    static async userNameToUserID(username) {
        try {
            return JSON.parse(String(await postTool("/userRequest/userIDConfirm", { username }))).userID;
        }
        catch (e) {
            return;
        }
        ;
    }
    static async mailAuthCodeSend(option) {
        if (!(option.mailAddress || option.userID))
            return false;
        const senddata = {};
        if (option.mailAddress)
            senddata.mailAddress = option.mailAddress;
        if (option.userID)
            senddata.userID = option.userID;
        console.log(senddata);
        await postTool("/userRequest/mailAuthCodeSend", senddata);
        return true;
    }
    static async autoAuthAndLogin(option) {
        try {
            const mailToken = JSON.parse(String(await postTool("/userRequest/mailTokenGet", { userID: option.userID, code: option.mailAuthCode }))).mailToken;
            const loginToken = JSON.parse(String(await postTool("/userRequest/loginTokenGet", { userID: option.userID, mailCheckToken: mailToken, password: option.password }))).loginToken;
            document.cookie = "token=" + loginToken + ";maxage=" + (60 * 60 * 24 * 180) + "; path=/";
            document.cookie = "id=" + option.userID + ";maxage=" + (60 * 60 * 24 * 180) + "; path=/";
            return true;
        }
        catch (e) {
            return false;
        }
    }
}
;
export default userManageAPI;
