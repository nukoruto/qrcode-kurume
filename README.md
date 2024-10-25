### 使用するコマンド
初心者向け:ブランチの使い方(下のほうのブランチの活用方法ってとこ)  
https://www.kagoya.jp/howto/rentalserver/webtrend/vscode/
周りの変更を確認したいとき  
https://envader.plus/article/368
**リポジトリをクローンしたらやる必要があること**
https://git-lfs.com/ でダウンロード
```
git lfs install
```
**electronでデスクトップアプリ化する**
```
npm start
```
なお、ディレクトリはリポジトリのホームディレクトリで実行
**パッケージに変更・追加があった場合**
```
npm install
```
**htmlの画面を確認したい場合**
.htmlを開き、エディター部分で右クリック→プレビューの表示(view preview)
## ログ
10/10:リポジトリ作成  
10/15:要件定義(11:00～:久留米市環境部施設課(杉谷埋立地):藤田様)  
10/17:デモ版作成
10/22:がんばってる

## 目次

## プロジェクトについて
**日常点検簿やマニュアルのQRコード化**
## 環境
<img src="https://img.shields.io/badge/Node.js-v20.18.0-339933.svg?logo=node.js&style=plastic">
<img src="https://img.shields.io/badge/-Html5-E34F26.svg?logo=html5&style=plastic">
<img src="https://img.shields.io/badge/-Css3-1572B6.svg?logo=css3&style=plastic">
<img src="https://img.shields.io/badge/-Javascript-F7DF1E.svg?logo=javascript&style=plastic">
<img src="https://img.shields.io/badge/npm-v10.8.2-CB3837.svg?logo=npm&style=plastic">

├── electron@33.0.1
├── express@4.21.1
├── ip@2.0.1
├── multer@1.4.5-lts.1
└── sqlite3@5.1.7

## gitコマンドを用いる場合

### 開発する時の流れ
```
$ git pull origin main
$ git checkout -b *ブランチ名*
・・・ 開発する ・・・
$ git add *変更したファイル名*
$ git commit -m *コミットメッセージ*
$ git push origin *ブランチ名（上のブランチ名と同じやつ）*
```

### 新しいブランチを切る
新しいブランチを切る.
```
$ git checkout -b *ブランチ名*
```
例 \
README.mdというファイルを変更するのでupdate-READMEというブランチを切る
```
$ git checkout -b update-README
```
`git branch`コマンドで現在のブランチを取得できる.
```
$ git branch
  main
* update-README
```

### 現在の情報を取得
`git status`コマンドで現在の変更されたファイルの状態を確認できる.
下の例ではステージングされていない状態の`README.md`があることが確認できる.
```
git status
On branch update-README-for-github-command
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   README.md

no changes added to commit (use "git add" and/or "git commit -a")
```

### 変更したファイルをステージングする
`git add`コマンドでステージングされていないファイルをステージングする.
下の例ではREADME.mdをステージングしている.
```
git add README.md
```

### ステージングされたファイルをコミットする
`git commit`コマンドでファイルをコミットする.
`-m`の後にコミットメッセージを書く.
```
git commit -m *コミットメッセージ*
```
`README.md`ファイルを更新した場合のコミットの例
```
git commit -m "update-README"
```

### リモートリポジトリへプッシュ
リモートに変更した内容を送る
```
git push origin *ブランチ名*
```
ブランチ名は`git checkout -b`コマンドで作成したブランチ名と同じにする.
現在のブランチ名は`git branch`コマンドで確認できる. \
今回の例ではブランチ名は`update-README`なので
```
git push origin update-README
```

### プルリクエストの作成
githubへアクセスして, プルリクエストを作成する.

## ヘルプ
カスタムアイコン:https://t8csp.csb.app/  
markdown記法:https://qiita.com/Qiita/items/c686397e4a0f4f11683d

