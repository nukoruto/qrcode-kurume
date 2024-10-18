## ヘルプ
カスタムアイコン:https://t8csp.csb.app/  
markdown記法:https://qiita.com/Qiita/items/c686397e4a0f4f11683d
## ログ
10/10:リポジトリ作成  
10/15:要件定義(11:00～:久留米市環境部施設課(杉谷埋立地):藤田様)  
10/17:デモ版作成

## 目次

## プロジェクトについて
**日常点検簿やマニュアルのQRコード化**
## 環境
<img src="https://img.shields.io/badge/-Html-E34F26.svg?logo=&style=for-the-badge"> <img src="https://img.shields.io/badge/-Css-1572B6.svg?logo=&style=for-the-badge"> <img src="https://img.shields.io/badge/-Javascript-F7DF1E.svg?logo=&style=for-the-badge">

## vscodeの機能を用いる場合  
### ブランチの作り方及びマージ  
https://www.kagoya.jp/howto/rentalserver/webtrend/vscode/

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

