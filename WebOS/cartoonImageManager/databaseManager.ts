import { Dexie, Table } from "./dexie/dexie-es.js";

interface fileInfo {
    type?: "File" | "Folder";
    index?: string[];
    data?: string;
}

/**
 * クライアント版データベースマネージャー(オフライン)
 * 
 * ホストのデータベースマネージャーサーバーが立ち上がっていない場合に利用するためのモジュールです。
 * 
 * データはクライアントに保存されるため、注意が必要です。
 */
export class databaseManager {
    private easyDB;
    constructor() {
        class easyDB {
            db;
            DB = (class DB extends Dexie {
                main!: Table<{ id?: number, path?: string, json?: string }, number>;

                constructor() {
                    super("DatabaseTest");
                    this.version(1).stores({
                        main: "++id, path, json"
                    });
                };
            });
            constructor() { this.db = new this.DB(); };
            async read(path: string) { return await this.db.main.get({ path: path }) };
            async write(json: { id?: number, path?: string, json?: string }) { await this.db.main.put(json); };
            async delete(path: string) {
                const id = (await this.db.main.get({ path: path }))?.id;
                if (id) {
                    this.db.main.delete(id);
                    return true;
                } else return false;
            };
        };
        this.easyDB = new easyDB();
    }
    private async rootCheck() {
        if (!await this.checkIs("/", "Folder")) await this.easyDB.write({ path: "/", json: JSON.stringify({ type: "Folder", index: [] }) });
    };
    /**
     * 検証し一致するかを確認します。
     * @param path パスを入力
     * @param type 一致させる種類を選択
     * @returns 
     */
    async checkIs(path: string, type: "File" | "Folder" | "breaked" | "notype" | "noexist") { return (await this.check(path)) === type; };
    /**
     * 検証します。
     * @param path パスを入力
     * @returns 
     */
    async check(path: string) {
        const infoRaw = await this.easyDB.read(path);
        if (infoRaw === undefined) return "noexist";
        if (infoRaw.json === undefined) return "breaked";
        let errorIs = false;
        const infoJSON = (() => { try { return JSON.parse(infoRaw.json) as fileInfo; } catch (e) { errorIs = true; }; })();
        if (errorIs || typeof infoJSON !== "object" || infoJSON.type === undefined) return "breaked";
        if (infoJSON.type === "File") {
            return "File";
        } else if (infoJSON.type === "Folder") {
            return "Folder";
        } else return "notype";
    };
    /**
     * フォルダを作成します。
     * @param path 新しいフォルダへのパスを入力(パスの最後がフォルダ名になります。)
     */
    async mkdir(path: string) {
        await this.rootCheck();
        const folderName = path.split("/")[path.split("/").length - 1];
        const folderPath = path.slice(0, (path.length - folderName.length <= 1) ? path.length - folderName.length : path.length - folderName.length - 1);
        const infoRaw = await this.easyDB.read(folderPath);
        if (infoRaw === undefined) throw new Error("パスが存在しません。");
        if (infoRaw.json === undefined) throw new Error("パスが存在しません。");
        const infoJSON = (() => { try { return JSON.parse(infoRaw.json) as fileInfo; } catch (e) { throw new Error("パス情報が壊れています。"); }; })();
        if (typeof infoJSON !== "object" || infoJSON.type === undefined) throw new Error("パス情報が壊れています。");
        if (infoJSON.type !== "Folder") throw new Error("フォルダではありません。");
        if (infoJSON.index === undefined || typeof infoJSON.index !== "object" || infoJSON.index.length === undefined) throw new Error("パス情報が壊れています。");

        const newFolder = await this.easyDB.read(path);
        if (newFolder !== undefined && newFolder.json !== undefined) {
            const infoJSON = (() => { try { return JSON.parse(newFolder.json) as fileInfo; } catch (e) { throw new Error("パス情報が壊れています。"); }; })();
            if (typeof infoJSON !== "object" || infoJSON.type === undefined) throw new Error("パス情報が壊れています。");
            if (infoJSON.type !== "Folder") throw new Error("フォルダではありません。");
        };

        if (!infoJSON.index.includes(folderName)) infoJSON.index.push(folderName);
        await this.easyDB.write({ path: path, json: newFolder ? newFolder.json : JSON.stringify({ type: "Folder", index: [] }), id: newFolder ? newFolder.id : undefined });
        await this.easyDB.write({ path: folderPath, json: JSON.stringify(infoJSON), id: infoRaw.id });
    };
    /**
     * データを読み込みます。
     * @param path ファイルへのパスを入力
     * @returns 
     */
    async read(path: string) {
        await this.rootCheck();
        const infoRaw = await this.easyDB.read(path);
        if (infoRaw === undefined) throw new Error("パスが存在しません。");
        if (infoRaw.json === undefined) throw new Error("パスが存在しません。");
        const infoJSON = (() => { try { return JSON.parse(infoRaw.json) as fileInfo; } catch (e) { throw new Error("パス情報が壊れています。"); }; })();
        if (typeof infoJSON !== "object" || infoJSON.type === undefined) throw new Error("パス情報が壊れています。");
        if (infoJSON.type !== "File") throw new Error("ファイルではありません。");
        if (infoJSON.data === undefined || typeof infoJSON.data !== "string") throw new Error("パス情報が壊れています。");

        return infoJSON.data;
    };
    /**
     * データを書き込みます。
     * @param path ファイルへのパスを入力
     * @param data データを入力
     */
    async write(path: string, data: string) {
        await this.rootCheck();
        const folderName = path.split("/")[path.split("/").length - 1];
        const folderPath = path.slice(0, (path.length - folderName.length <= 1) ? path.length - folderName.length : path.length - folderName.length - 1);
        const infoRaw = await this.easyDB.read(folderPath);
        if (infoRaw === undefined) throw new Error("パスが存在しません。");
        if (infoRaw.json === undefined) throw new Error("パスが存在しません。");
        const infoJSON = (() => { try { return JSON.parse(infoRaw.json) as fileInfo; } catch (e) { throw new Error("パス情報が壊れています。"); }; })();
        if (typeof infoJSON !== "object" || infoJSON.type === undefined) throw new Error("パス情報が壊れています。");
        if (infoJSON.type !== "Folder") throw new Error("フォルダではありません。");
        if (infoJSON.index === undefined || typeof infoJSON.index !== "object" || infoJSON.index.length === undefined) throw new Error("パス情報が壊れています。");

        if (!infoJSON.index.includes(folderName)) infoJSON.index.push(folderName);

        const newFile = await this.easyDB.read(path);

        if (newFile !== undefined && newFile.json !== undefined) {
            const infoJSON = (() => { try { return JSON.parse(newFile.json) as fileInfo; } catch (e) { throw new Error("パス情報が壊れています。"); }; })();
            if (typeof infoJSON !== "object" || infoJSON.type === undefined) throw new Error("パス情報が壊れています。");
            if (infoJSON.type !== "File") throw new Error("ファイルではありません。: " + path);
        };

        await this.easyDB.write({ path: path, json: JSON.stringify({ type: "File", data: data }), id: newFile ? newFile.id : undefined });
        await this.easyDB.write({ path: folderPath, json: JSON.stringify(infoJSON), id: infoRaw.id });
    };
    /**
     * 削除します。
     * @param path パスを入力
     */
    async delete(path: string) {
        await this.rootCheck();
        if (path === "/") throw new Error("ルートは削除できません。");
        const infoRaw = await this.easyDB.read(path);
        if (infoRaw === undefined) throw new Error("パスが存在しません。");
        if (infoRaw.json === undefined) throw new Error("パスが存在しません。");
        const infoJSON = (() => { try { return JSON.parse(infoRaw.json) as fileInfo; } catch (e) { throw new Error("パス情報が壊れています。"); }; })();
        if (typeof infoJSON !== "object" || infoJSON.type === undefined) throw new Error("パス情報が壊れています。");
        if (infoJSON.type === "Folder") {
            if (infoJSON.index === undefined || typeof infoJSON.index !== "object" || infoJSON.index.length === undefined) throw new Error("パス情報が壊れています。");
            for (const fileName of infoJSON.index) await this.delete(path + (path[path.length - 1] === "/" ? "" : "/") + fileName);

            await this.easyDB.delete(path);
        } else {
            await this.easyDB.delete(path);
            const removeFileName = path.split("/")[path.split("/").length - 1];
            const folderPath = path.slice(0, (path.length - removeFileName.length <= 1) ? path.length - removeFileName.length : path.length - removeFileName.length - 1);
            {
                const infoRaw = await this.easyDB.read(folderPath);
                if (infoRaw === undefined) throw new Error("パスが存在しません。");
                if (infoRaw.json === undefined) throw new Error("パスが存在しません。");
                const infoJSON = (() => { try { return JSON.parse(infoRaw.json) as fileInfo; } catch (e) { throw new Error("パス情報が壊れています。"); }; })();
                if (typeof infoJSON !== "object" || infoJSON.type === undefined) throw new Error("パス情報が壊れています。");
                if (infoJSON.type !== "Folder") throw new Error("フォルダではありません。");
                if (infoJSON.index === undefined || typeof infoJSON.index !== "object" || infoJSON.index.length === undefined) throw new Error("パス情報が壊れています。");
                const deletePositionNo = infoJSON.index.indexOf(removeFileName);
                infoJSON.index.splice(deletePositionNo, 1);
                await this.easyDB.write({ path: folderPath, json: JSON.stringify(infoJSON), id: infoRaw.id });
            };
        };
    };
};
