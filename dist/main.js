"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const request = require("request");
const cheerio = require("cheerio");
const Iconv = require("iconv").Iconv;
const moment = require("moment");
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
// jsonデータを扱う
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// テスト用のエンドポイント
app.get('/', (req, res) => {
    const options = {
        url: process.env.ROOT_PATH,
        method: "GET",
        encoding: null,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36"
        }
    };
    request(options, (err, response, body) => {
        if (err) {
            console.error(err);
        }
        try {
            const $ = cheerio.load(new Iconv("euc-jp", "UTF-8//TRANSLIT//IGNORE").convert(body).toString());
            const title = $("h1").text();
            const yesterday = moment().add(-1, "days").format("YYYY-MM-DD");
            let yesterdayUpdates = getSpecificDateUpdates(yesterday, getRecentUpdates($));
            if (yesterdayUpdates.length) {
                // 投稿用の文字列の構築
                // Twitterへの投稿
            }
            res.status(200).send({ message: title, pages: getRecentUpdates($) });
        }
        catch (err) {
            console.error(err);
        }
    });
});
// サーバー接続
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log('listen on port:', port);
});
function getPages($) {
    let wikiPages = [];
    $("#sub .user-area li").each(function () {
        let wikiPage = {
            "title": $(this).children().html(),
            "path": $(this).children().attr("href").replace(process.env.ROOT_PATH, "")
        };
        wikiPages.push(wikiPage);
    });
    return wikiPages;
}
function getRecentUpdates($) {
    let updatesGroupedByDate = [];
    $("#extra .side-box.recent ul.parent-list").children().each(function () {
        const date = $(this).find("h3").text();
        let pages = [];
        $(this).find("ul.child-list").children().each(function () {
            const aTag = $(this).find("a");
            let page = {
                title: aTag.html(),
                url: aTag.attr("href")
            };
            pages.push(page);
        });
        let updates = {
            date: date,
            pages: pages
        };
        updatesGroupedByDate.push(updates);
    });
    return updatesGroupedByDate;
}
function getSpecificDateUpdates(date, updates) {
    const found = updates.find(updates => updates.date == date);
    if (found) {
        return found.pages;
    }
    else {
        return [];
    }
}
//# sourceMappingURL=main.js.map