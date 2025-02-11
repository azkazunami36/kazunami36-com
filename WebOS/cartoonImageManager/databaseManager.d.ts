/**
 * クライアント版データベースマネージャー(オフライン)
 *
 * ホストのデータベースマネージャーサーバーが立ち上がっていない場合に利用するためのモジュールです。
 *
 * データはクライアントに保存されるため、注意が必要です。
 */
export declare class databaseManager {
    private easyDB;
    constructor();
    private rootCheck;
    /**
     * 検証し一致するかを確認します。
     * @param path パスを入力
     * @param type 一致させる種類を選択
     * @returns
     */
    checkIs(path: string, type: "File" | "Folder" | "breaked" | "notype" | "noexist"): Promise<boolean>;
    /**
     * 検証します。
     * @param path パスを入力
     * @returns
     */
    check(path: string): Promise<"noexist" | "breaked" | "File" | "Folder" | "notype">;
    /**
     * フォルダを作成します。
     * @param path 新しいフォルダへのパスを入力(パスの最後がフォルダ名になります。)
     */
    mkdir(path: string): Promise<void>;
    /**
     * データを読み込みます。
     * @param path ファイルへのパスを入力
     * @returns
     */
    read(path: string): Promise<string>;
    /**
     * データを書き込みます。
     * @param path ファイルへのパスを入力
     * @param data データを入力
     */
    write(path: string, data: string): Promise<void>;
    /**
     * 削除します。
     * @param path パスを入力
     */
    delete(path: string): Promise<void>;
}
