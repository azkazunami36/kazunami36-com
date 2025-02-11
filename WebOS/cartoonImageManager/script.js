import { databaseManager } from "./databaseManager.js";
import { getUrlQueries } from "./getUrlQueriesModule.js";
const database = new databaseManager();
addEventListener("load", async () => {
    if (!await database.checkIs("/imageInfo.json", "File"))
        await database.write("/imageInfo.json", "{}");
    if (!await database.checkIs("/cartoonInfo.json", "File"))
        await database.write("/cartoonInfo.json", "{}");
    if (!await database.checkIs("/images", "Folder"))
        await database.mkdir("/images");
    const collectionListTab = new class {
        async func() {
            const collectionListElement = document.getElementById("collectionList");
            if (!collectionListElement)
                return;
            const sampleButton = collectionListElement.getElementsByClassName("sampleButton")[0];
            collectionListElement.innerHTML = "";
            const json = JSON.parse(await database.read("/cartoonInfo.json"));
            for (const cartoonId of Object.keys(json)) {
                if (!json[cartoonId])
                    continue;
                const button = sampleButton.cloneNode(true);
                const title = button.getElementsByClassName("title")[0];
                const author = button.getElementsByClassName("author")[0];
                if (json[cartoonId].title)
                    title.innerText = json[cartoonId].title;
                if (json[cartoonId].authorName)
                    author.innerText = json[cartoonId].authorName;
                button.addEventListener("click", async () => {
                    const queries = getUrlQueries();
                    queries["selectCartoonID"] = cartoonId;
                    window.history.pushState({}, "", window.location.origin + window.location.pathname + "?" + new URLSearchParams(queries));
                });
                collectionListElement.appendChild(button);
            }
        }
    };
    const imageListTab = new class {
        imageListSortArray = {};
        async func() {
            const imageList = document.getElementById("imageList");
            const sampleButton = document.getElementById("sampleButton");
            const json = JSON.parse(await database.read("/imageInfo.json"));
            if (!imageList || !sampleButton)
                return;
            imageList.innerHTML = "";
            const fileNames = Object.keys(json);
            for (const filename of fileNames) {
                if (!json[filename])
                    continue;
                if (!this.imageListSortArray[String(json[filename].addedTime)])
                    this.imageListSortArray[String(json[filename].addedTime)] = {};
                if (!this.imageListSortArray[String(json[filename].addedTime)][filename]) {
                    const button = sampleButton.cloneNode(true);
                    const title = button.getElementsByClassName("title")[0];
                    const img = button.getElementsByTagName("img")[0];
                    button.style.display = "flex";
                    title.innerText = filename;
                    if (!json[filename].path)
                        return;
                    img.src = "data:image/png;base64," + await database.read(json[filename].path);
                    this.imageListSortArray[String(json[filename].addedTime)][filename] = button;
                }
            }
            const timeList = Object.keys(this.imageListSortArray);
            timeList.sort();
            for (const time of timeList) {
                const filenameList = Object.keys(this.imageListSortArray[time]);
                filenameList.sort();
                const h = document.createElement("h2");
                const date = new Date();
                date.setTime(Number(time));
                h.innerText = date.toLocaleString();
                imageList.appendChild(h);
                for (const filename of filenameList)
                    imageList.appendChild(this.imageListSortArray[time][filename]);
            }
            await database.write("/imageInfo.json", JSON.stringify(json));
        }
    };
    const cartoonEditTab = new class {
        editElement;
        storyEditWindow;
        storyEditElements;
        storyEditWindowViewIs = false;
        title;
        authorName;
        genre;
        saveInfoButton;
        list;
        sampleListButton;
        constructor() {
            const edit = document.getElementById("edit");
            if (edit) {
                this.editElement = edit;
                this.storyEditWindow = this.editElement.getElementsByClassName("storyEditWindow")[0];
                this.title = this.editElement.getElementsByClassName("title")[0];
                this.authorName = this.editElement.getElementsByClassName("authorName")[0];
                this.genre = this.editElement.getElementsByClassName("genre")[0];
                this.saveInfoButton = this.editElement.getElementsByClassName("saveInfo")[0];
                this.list = this.editElement.getElementsByClassName("list")[0];
                this.sampleListButton = this.list.getElementsByClassName("sampleButton")[0];
                const imageListToolBar = this.storyEditWindow.getElementsByClassName("imageListToolBar")[0];
                this.storyEditElements = {
                    imageListToolBar: imageListToolBar,
                    toolBars: {
                        add: imageListToolBar.getElementsByClassName("add")[0],
                        delete: imageListToolBar.getElementsByClassName("delete")[0],
                        up: imageListToolBar.getElementsByClassName("up")[0],
                        down: imageListToolBar.getElementsByClassName("down")[0]
                    }
                };
            }
            else
                throw new Error("");
        }
        async func() {
            const queries = getUrlQueries();
            const editId = queries["selectCartoonID"];
            const json = JSON.parse(await database.read("/cartoonInfo.json"));
            const cartoonInfo = json[editId];
            if (!cartoonInfo)
                return;
            if (cartoonInfo.title)
                this.title.value = cartoonInfo.title;
            if (cartoonInfo.authorName)
                this.authorName.value = cartoonInfo.authorName;
            if (cartoonInfo.genre)
                this.genre.value = cartoonInfo.genre;
            this.saveInfoButton.addEventListener("click", async () => {
                if (this.title.value)
                    cartoonInfo.title = this.title.value;
                if (this.authorName.value)
                    cartoonInfo.authorName = this.authorName.value;
                if (this.genre.value)
                    cartoonInfo.genre = this.genre.value;
                await database.write("/cartoonInfo.json", JSON.stringify(json));
            });
            if (cartoonInfo.storys)
                for (let i = 0; i < cartoonInfo.storys.length; i++) {
                    const story = cartoonInfo.storys[i];
                    const button = this.sampleListButton.cloneNode(true);
                    const number = button.getElementsByClassName("number")[0];
                    const storyTitle = button.getElementsByClassName("storyTitle")[0];
                    number.innerText = String(i + 1);
                    storyTitle.innerText = story.storyName || "No Title";
                    this.list.appendChild(button);
                }
        }
        ;
    };
    const sideBar = new class {
        sideBarIDList = ["collectionList", "genre", "author", "tag", "info", "edit", "imageList", "imageAdd", "cartoonAdd"];
        sideBarClickFunction = {
            "collectionList": async () => { await collectionListTab.func(); },
            "imageList": async () => { await imageListTab.func(); },
            "edit": async () => { await cartoonEditTab.func(); }
        };
        async init() {
            const queries = getUrlQueries();
            if (!queries["viewTab"])
                queries["viewTab"] = this.sideBarIDList[0];
            window.history.pushState({}, "", window.location.origin + window.location.pathname + "?" + new URLSearchParams(queries));
            for (const sideBarID of this.sideBarIDList) {
                const clickFunc = this.sideBarClickFunction[sideBarID];
                if (clickFunc)
                    await clickFunc();
                const queries = getUrlQueries();
                const sideBarButton = document.getElementById(sideBarID + "SideBar");
                const viewElement = document.getElementById(sideBarID);
                if (!sideBarButton || !viewElement)
                    return;
                if (queries["viewTab"] === sideBarID) {
                    sideBarButton.classList.add("viewed");
                    viewElement.classList.add("viewed");
                }
                sideBarButton.addEventListener("click", async () => {
                    await this.tabChange(sideBarID);
                });
            }
            ;
        }
        async tabChange(id) {
            const clickFunc = this.sideBarClickFunction[id];
            if (clickFunc)
                await clickFunc();
            const queries = getUrlQueries();
            if (queries["viewTab"] === id)
                return;
            const viewedButton = document.getElementById(queries["viewTab"] + "SideBar");
            const viewedElement = document.getElementById(queries["viewTab"]);
            if (!viewedButton || !viewedElement)
                return;
            viewedButton.classList.remove("viewed");
            viewedElement.classList.remove("viewed");
            queries["viewTab"] = id;
            window.history.pushState({}, "", window.location.origin + window.location.pathname + "?" + new URLSearchParams(queries));
            const sideBarButton = document.getElementById(id + "SideBar");
            const viewElement = document.getElementById(id);
            if (!sideBarButton || !viewElement)
                return;
            sideBarButton.classList.add("viewed");
            viewElement.classList.add("viewed");
        }
    };
    await sideBar.init();
    const newImageInputTab = new class {
        constructor() {
            const newImageInput = document.getElementById("newImageInput");
            if (!newImageInput)
                return;
            newImageInput.addEventListener("click", e => {
                const element = e.target;
                if (element)
                    element.value = "";
            });
            newImageInput.addEventListener("change", async () => {
                if (!newImageInput.files || newImageInput.files.length === 0)
                    return;
                const nowTime = Date.now();
                for (const file of newImageInput.files) {
                    const name = file.name;
                    function arrayBufferToBinaryString(arrayBuffer) {
                        let binaryString = "";
                        const bytes = new Uint8Array(arrayBuffer);
                        const len = bytes.byteLength;
                        for (let i = 0; i < len; i++)
                            binaryString += String.fromCharCode(bytes[i]);
                        return binaryString;
                    }
                    const ab = await file.arrayBuffer();
                    const text = btoa(arrayBufferToBinaryString(ab));
                    if (!await database.checkIs("/images/" + name, "File")) {
                        await database.write("/images/" + name, text);
                        const json = JSON.parse(await database.read("/imageInfo.json"));
                        json[name] = { path: "/images/" + name, addedTime: nowTime };
                        await database.write("/imageInfo.json", JSON.stringify(json));
                    }
                }
            });
        }
    };
    const cartoonAddTab = new class {
        constructor() {
            const cartoonAddElement = document.getElementById("cartoonAdd");
            if (!cartoonAddElement)
                return;
            const input = cartoonAddElement.getElementsByTagName("input")[0];
            const button = cartoonAddElement.getElementsByTagName("button")[0];
            button.addEventListener("click", async () => {
                const id = input.value;
                const json = JSON.parse(await database.read("/cartoonInfo.json"));
                json[id] = {};
                await database.write("/cartoonInfo.json", JSON.stringify(json));
                const queries = getUrlQueries();
                queries["selectCartoonID"] = id;
                window.history.pushState({}, "", window.location.origin + window.location.pathname + "?" + new URLSearchParams(queries));
                await sideBar.tabChange("edit");
            });
        }
    };
});
