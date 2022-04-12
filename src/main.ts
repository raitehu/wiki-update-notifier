require("dotenv").config()

const request = require("request")
const cheerio = require("cheerio")
const Iconv   = require("iconv").Iconv

import express from 'express';

const app = express()
// jsonデータを扱う
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// テスト用のエンドポイント
app.get('/', (req, res) => {
  const options = {
    url: process.env.ROOT_PATH,
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
      res.status(200).send({ message: title , pages: getPages($)})
    } catch (err) {
      console.error(err)
    }
  })
})

// サーバー接続
const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log('listen on port:', port)
})

function getPages($: any): Array<object> {
  let wikiPages: Array<object> = []

  $("#sub .user-area li").each(function() {
    let wikiPage = {
      "title": $(this).children().html(),
      "path" : $(this).children().attr("href").replace(process.env.ROOT_PATH, "")
    }
    wikiPages.push(wikiPage)
  })
  return wikiPages
}
