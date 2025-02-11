export function cookieValueGet(key) {
    return document.cookie.split("; ").find((row) => row.startsWith(key + "="))?.split("=")[1];
}
export default cookieValueGet;
