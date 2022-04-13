import Twitter from "twitter-api-v2"

require("dotenv").config()

const request = require("request")
const cheerio = require("cheerio")
const Iconv   = require("iconv").Iconv
const moment  = require("moment")

const yesterday: string           = moment().add(-1, "days").format("YYYY-MM-DD")
const RootPath: string            = process.env.ROOT_PATH ? process.env.ROOT_PATH : ""
const TwApiKey: string            = process.env.API_KEY ? process.env.API_KEY : ""
const TwApiKeySecret: string      = process.env.API_KEY_SECRET ? process.env.API_KEY_SECRET : ""
const TwAccessToken: string       = process.env.ACCESS_TOKEN ? process.env.ACCESS_TOKEN : ""
const TwAccessTokenSecret: string = process.env.ACCESS_TOKEN_SECRET ? process.env.ACCESS_TOKEN_SECRET : ""

request(requestOptions(), (err: Error, response: String, body: String) => {
  if (err) {
    console.error(err)
  }

  try {
    const $ = cheerio.load(new Iconv("euc-jp", "UTF-8//TRANSLIT//IGNORE").convert(body).toString())
    let yesterdayUpdates = getSpecificDateUpdates(yesterday, getRecentUpdates($))

    if (yesterdayUpdates.length) {
      const client = new Twitter(twAuthentication())
      client.v2.tweet(buildMessage(yesterday, yesterdayUpdates))
    }
  } catch (err) {
    console.error(err)
  }
})

function buildMessage(date: string, yesterdayUpdates: Page[]): string {
  return [
    "🎪VALIS非公式wiki更新情報🎪",
    `${date}に以下のページが更新されました`,
    yesterdayUpdates.map(updates => `・${updates.title}`),
    "是非遊びに来てください!!",
    RootPath
  ].flat().join("\n")
}

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

function requestOptions(): object {
  return {
    url: RootPath,
    method: "GET",
    encoding: null,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36"
    }
  }
}

function twAuthentication(): any {
  return {
    appKey:       TwApiKey,
    appSecret:    TwApiKeySecret,
    accessToken:  TwAccessToken,
    accessSecret: TwAccessTokenSecret,
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
