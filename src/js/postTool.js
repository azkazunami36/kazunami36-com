export async function postTool(path, json) {
    return await new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();
        req.open("POST", "http://" + window.location.hostname + path);
        req.send(JSON.stringify(json));
        req.onreadystatechange = async () => { if (req.readyState === 4 && req.status === 200)
            resolve(req.responseText);
        else if (req.readyState === 4 && req.status === 404)
            reject(404); };
    });
}
;
export default postTool;
