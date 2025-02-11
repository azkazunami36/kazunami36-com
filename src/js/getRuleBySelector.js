/** CSSのセレクタ(.class、#idなど)を入力しそれに対応したスタイルを返す */
export function getRuleBySelector(selecter) {
    for (let i = 0; i !== document.styleSheets.length; i++) //cssの数だけ
        for (let is = 0; is !== document.styleSheets[i].cssRules.length; is++) //ルールの数だけ
            if (selecter === document.styleSheets[i].cssRules[is].selectorText) //ルール名と一致するか
                return document.styleSheets[i].cssRules[is]; //見つけたら返す
}
