require("dotenv").config()

const request = require("request")
const cheerio = require("cheerio")
const Iconv   = require("iconv").Iconv
const moment  = require("moment")

const RootPath: string            = process.env.ROOT_PATH ? process.env.ROOT_PATH : ""
const TwApiKey: string            = process.env.API_KEY ? process.env.API_KEY : ""
const TwApiKeySecret: string      = process.env.API_KEY_SECRET ? process.env.API_KEY_SECRET : ""
const TwAccessToken: string       = process.env.ACCESS_TOKEN ? process.env.ACCESS_TOKEN : ""
const TwAccessTokenSecret: string = process.env.ACCESS_TOKEN_SECRET ? process.env.ACCESS_TOKEN_SECRET : ""

//import express from "express"
import Twitter from "twitter-api-v2"

//const app = express()
// jsonデータを扱う
//app.use(express.json())
//app.use(express.urlencoded({ extended: true }))

// テスト用のエンドポイント
//app.get('/', (req, res) => {
//})
const options = {
  url: RootPath,
  method: "GET",
  encoding: null,
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36"
  }
}

request(options, (err: Error, response: String, body: String) => {
  if (err) {
    console.error(err)
  }

  try {
    const $ = cheerio.load(new Iconv("euc-jp", "UTF-8//TRANSLIT//IGNORE").convert(body).toString())
    const title = $("h1").text()
    const yesterday: String = moment().add(-1, "days").format("YYYY-MM-DD")
    let yesterdayUpdates = getSpecificDateUpdates(yesterday, getRecentUpdates($))

    if (yesterdayUpdates.length) {
      // TODO: API認証キー周りは別関数に切り出し
      const client = new Twitter({
        appKey: TwApiKey,
        appSecret: TwApiKeySecret,
        accessToken: TwAccessToken,
        accessSecret: TwAccessTokenSecret,
      })

      // TODO: message構築は別関数に切り出し
      const messages: String[] = [
        "🎪VALIS非公式wiki更新情報🎪",
        `${yesterday}に以下のページが更新されました`,
        yesterdayUpdates.map(updates => `・${updates.title}`),
        "是非遊びに来てください!!",
        process.env.ROOT_PATH ? process.env.ROOT_PATH : ""
      ].flat()

      client.v2.tweet(messages.join("\n"))
    }

    //res.status(200).send({ message: title , pages: getRecentUpdates($)})
  } catch (err) {
    console.error(err)
  }
})

//const port = process.env.PORT || 3001
//app.listen(port, () => {
//  console.log('listen on port:', port)
//})

function getRecentUpdates($: any): Updates[] {
  let updatesGroupedByDate: Updates[] = []

  $("#extra .side-box.recent ul.parent-list").children().each(function(this: String) {
    const date = $(this).find("h3").text()
    let pages: Page[] = []

    $(this).find("ul.child-list").children().each(function(this: String) {
      const aTag = $(this).find("a")
      let page: Page = {
        title: aTag.html(),
        url: aTag.attr("href")
      }
      pages.push(page)
    })

    let updates: Updates = {
      date: date,
      pages: pages
    }
    updatesGroupedByDate.push(updates)
  })

  return updatesGroupedByDate
}

function getSpecificDateUpdates(date: String, updates: Updates[]): Page[] | [] {
  const found = updates.find(updates => updates.date == date)
  if (found) {
    return found.pages
  } else {
    return []
  }
}

type Page = {
  title: String
  url : String
}

type Updates = {
  date: String
  pages: Page[]
}
