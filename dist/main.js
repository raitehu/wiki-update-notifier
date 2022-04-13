"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const twitter_api_v2_1 = __importDefault(require("twitter-api-v2"));
require("dotenv").config();
const request = require("request");
const cheerio = require("cheerio");
const Iconv = require("iconv").Iconv;
const moment = require("moment-timezone");
const yesterday = moment().tz("Asia/Tokyo").add(-1, "days").format("YYYY-MM-DD");
const RootPath = process.env.ROOT_PATH ? process.env.ROOT_PATH : "";
const TwApiKey = process.env.API_KEY ? process.env.API_KEY : "";
const TwApiKeySecret = process.env.API_KEY_SECRET ? process.env.API_KEY_SECRET : "";
const TwAccessToken = process.env.ACCESS_TOKEN ? process.env.ACCESS_TOKEN : "";
const TwAccessTokenSecret = process.env.ACCESS_TOKEN_SECRET ? process.env.ACCESS_TOKEN_SECRET : "";
request(requestOptions(), (err, response, body) => {
    if (err) {
        console.error(err);
    }
    try {
        const $ = cheerio.load(new Iconv("euc-jp", "UTF-8//TRANSLIT//IGNORE").convert(body).toString());
        let yesterdayUpdates = getSpecificDateUpdates(yesterday, getRecentUpdates($));
        if (yesterdayUpdates.length) {
            const client = new twitter_api_v2_1.default(twAuthentication());
            client.v2.tweet(buildMessage(yesterday, yesterdayUpdates));
        }
    }
    catch (err) {
        console.error(err);
    }
});
function buildMessage(date, yesterdayUpdates) {
    return [
        "🎪VALIS非公式wiki更新情報🎪",
        `${date}に以下のページが更新されました`,
        yesterdayUpdates.map(updates => `・${updates.title}`),
        "是非遊びに来てください!!",
        RootPath
    ].flat().join("\n");
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
function requestOptions() {
    return {
        url: RootPath,
        method: "GET",
        encoding: null,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36"
        }
    };
}
function twAuthentication() {
    return {
        appKey: TwApiKey,
        appSecret: TwApiKeySecret,
        accessToken: TwAccessToken,
        accessSecret: TwAccessTokenSecret,
    };
}
//# sourceMappingURL=main.js.map