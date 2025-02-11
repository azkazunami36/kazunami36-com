export async function externalScriptStarter(javascript, object) {
    const fixedJavascript = (() => {
        let string = "";
        const arrayJavaScript = javascript.split("\n");
        if (arrayJavaScript[0] === "\"use strict\";" || arrayJavaScript[0] === "\"use strict\"")
            for (const str of arrayJavaScript.slice(1))
                string += str + "\n";
        return string;
    })();
    try {
        await new Function("object", "return " + fixedJavascript)()(object);
    }
    catch (e) {
        throw e;
    }
}
