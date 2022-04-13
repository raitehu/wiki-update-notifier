# wiki-update-notifier

## 主な処理の概要

1. 環境変数 `ROOT_PATH` で指定されたseesaa wikiのURLにアクセスする
2. 「最近更新したページ」を取得
3. 起動時刻の前日に更新したページが存在していた場合APIキーに紐づくアカウントでツイートする

## ツイートフォーマット

```plain
🎪VALIS非公式wiki更新情報🎪
YYYY-MM-DDに以下のページが更新されました
・${更新されたページタイトル}
・${更新されたページタイトル}
是非遊びに来てください!!
```

## 環境変数

| key | type | description |
| --- | ---- | ----------- |
| ROOT_PATH | String | wikiのルートパス。トレイリングスラッシュも含む |
| API_KEY | String | Twitter投稿用APIキー |
| API_KEY_SECRET | String | Twitter投稿用APIキーのシークレット |
| ACCESS_TOKEN | String | Twitterアクセストークン |
| ACCESS_TOKEN_SECRET | String | Twitterアクセストークンのシークレット |
