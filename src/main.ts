import Twitter from "twitter-api-v2"

require("dotenv").config()

const request = require("request")
const cheerio = require("cheerio")
const Iconv   = require("iconv").Iconv
const moment  = require("moment-timezone")

const yesterday: string           = moment().tz("Asia/Tokyo").add(-1, "days").format("YYYY-MM-DD")
const RootPath: string            = process.env.ROOT_PATH ? process.env.ROOT_PATH : ""
const TwApiKey: string            = process.env.API_KEY ? process.env.API_KEY : ""
const TwApiKeySecret: string      = process.env.API_KEY_SECRET ? process.env.API_KEY_SECRET : ""
const TwAccessToken: string       = process.env.ACCESS_TOKEN ? process.env.ACCESS_TOKEN : ""
const TwAccessTokenSecret: string = process.env.ACCESS_TOKEN_SECRET ? process.env.ACCESS_TOKEN_SECRET : ""
const TruncateLength: number      = 30
const TweetMessageLimit: number   = 140

request(requestOptions(), (err: Error, response: String, body: String) => {
  if (err) {
    console.error(err)
  }

  try {
    const $ = cheerio.load(new Iconv("euc-jp", "UTF-8//TRANSLIT//IGNORE").convert(body).toString())
    let yesterdayUpdates = getSpecificDateUpdates(yesterday, getRecentUpdates($))

    if (yesterdayUpdates.length) {
      const client = new Twitter(twAuthentication())
      client.v2.tweetThread(buildMessage(yesterday, yesterdayUpdates))
    }
  } catch (err) {
    console.error(err)
  }
})

function truncatePageTitle(pageTitle: String): String {
  if (pageTitle.length <= TruncateLength) {
    return pageTitle
  } else {
    return `${pageTitle.substring(0, TruncateLength - 3)}...`
  }
}

function buildMessage(date: string, yesterdayUpdates: Page[]): string[] {
  const messageArray = [preamble(date), yesterdayUpdates.map(updates => `・${truncatePageTitle(updates.title)}`), postamble()].flat()
  const postTime = `posted at ${moment().unix()}`
  let singleTweetMessagesArray: string[] = []
  let multipleTweetMessagesArray: string[] = []

  messageArray.forEach(function(message, index) {
    const addedCaseMessageLength = singleTweetMessagesArray.join('\n').length + message.length + postTime.length
    if (addedCaseMessageLength <= TweetMessageLimit) {
      // 追加してもツイート長を超えない場合、追加する
      singleTweetMessagesArray.push(message)
    } else {
      // 追加したらツイート長を超える場合、1つのツイートとして完成する
      singleTweetMessagesArray.push(postTime)
      multipleTweetMessagesArray.push(singleTweetMessagesArray.join("\n"))
      // あふれて追加出来なかったメッセージを新たなツイートとして作成する
      singleTweetMessagesArray = [message]
    }

    // 最後のメッセージの処理
    if (index === messageArray.length - 1 && singleTweetMessagesArray.length) {
      singleTweetMessagesArray.push(postTime)
      multipleTweetMessagesArray.push(singleTweetMessagesArray.join("\n"))
    }
  })
  return multipleTweetMessagesArray
}

function preamble(date: string): string {
  return ["🎪VALIS非公式wiki更新情報🎪", `${date}に以下のページが更新されました`].join("\n")
}

function postamble(): string {
  return ["是非遊びに来てください!!", RootPath].join("\n")
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
