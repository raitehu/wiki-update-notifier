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

## 開発にあたって

### 前提

- npm: 8.6.0
- node: v16.13.2

```bash
# リポジトリのクローン
git clone git@github.com:raitehu/wiki-update-notifier.git

# ライブラリのインストール
cd wiki-update-notifier
npm install

# dotenvファイルの作成
touch .env
echo 'ROOT_PATH="XXXXXXXXX"' >> .env
echo 'API_KEY="XXXXXXXXX"' >> .env
echo 'API_KEY_SECRET="XXXXXXXXX"' >> .env
echo 'ACCESS_TOKEN="XXXXXXXXX"' >> .env
echo 'ACCESS_TOKEN_SECRET="XXXXXXXXX"' >> .env

# 自動コンパイルの起動
tsc -w

# 実行
node dist/main.js
```

### 環境変数

| key | type | description |
| --- | ---- | ----------- |
| ROOT_PATH | String | wikiのルートパス。トレイリングスラッシュも含む |
| API_KEY | String | Twitter投稿用APIキー |
| API_KEY_SECRET | String | Twitter投稿用APIキーのシークレット |
| ACCESS_TOKEN | String | Twitterアクセストークン |
| ACCESS_TOKEN_SECRET | String | Twitterアクセストークンのシークレット |

## Q&A

- Q. seesaa wikiでもTwitter連携できますが？^^
  - A.保存押すたびにTwitterに投稿されるの邪魔くさいじゃん
- Q. これってスクレイピングですよね？
  - A. 1回実行につき1アクセスだけだから許してにゃん
- Q. 1回目はツイートできたのに2回目実行しても投稿されないんだが～～～～？？？
  - A. 仕様です(マジレスするとTwitterは同じ投稿を連続で投げれないので前の投稿を消せば動くはず)
- Q. このQ&A、深夜テンションで書きましたね？
  - A. はい。
