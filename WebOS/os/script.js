import { externalScriptStarter } from "./scripts/externalScriptStarter.js";
(async () => {
    const javascript = `"use strict";
    (async (manager) => {
        if (!manager)
            return;
        manager.change("hoge");
    });
    `;
    const manager = new class manager {
        data = "none";
        change(string) {
            this.data = string;
        }
    };
    const promise = externalScriptStarter(javascript, manager);
    await promise;
    console.log(manager.data, JSON.parse(JSON.stringify(manager)));
})();
