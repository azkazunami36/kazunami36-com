export declare class userManageAPI {
    constructor();
    static defaultUserExist(): boolean;
    static userNameToUserID(username: string): Promise<string | undefined>;
    static mailAuthCodeSend(option: {
        mailAddress?: string;
        userID?: string;
    }): Promise<boolean>;
    static autoAuthAndLogin(option: {
        userID: string;
        mailAuthCode: string;
        password: string;
    }): Promise<boolean>;
}
export default userManageAPI;
