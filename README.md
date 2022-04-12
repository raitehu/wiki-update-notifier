# wiki-update-notifier

## 主な処理の概要

1. 環境変数 `ROOT_PATH` で指定されたURLにアクセスする
2. メニュー欄 `id="sub" > class="user-area"` に含まれるURLを取得する
   - ページタイトル: aタグで囲まれた文字列
   - path: aタグのhref対象からROOT_PATHを引いた文字列
3. pathをkeyとしてDBを検索する
   - DBにキーが存在しない場合
      1. `class="page-body" > class="user-area"` 内のDOMをvalueとして登録
      2. ページタイトルを新規ページとして保持
   - DBにキーが存在する 且つ 突合の結果差異がある場合
      1. ページタイトルを変更ページとして保持
4. 新規ページ・変更ページが存在する場合、Twitterに投稿をする

## 環境変数

| key | type | description |
| --- | ---- | ----------- |
| ROOT_PATH | String | wikiのルートパス。トレイリングスラッシュも含む |
| TW_TOKEN | String | Twitter投稿用のアクセストークン |
