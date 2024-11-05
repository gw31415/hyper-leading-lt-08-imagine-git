# Typst + Slidev

## これは何？

[typst](https://typst.app) と [Slidev](https://sli.dev) を組み合わせたプレゼンテーションの資料リポジトリです。

## ファイル構成

- `doc/` : 原稿
  - `img/`
    - 原稿中で使用する画像ファイル
  - `hello-rust-world.bib`
    - 原稿中で使用する参考文献
  - `hello-rust-world.typ`
    - 原稿のエントリポイント
  - `template.typ`
    - 原稿のテンプレートファイル
- `slidev/` : スライド
  - `public/`
    - スライド中の静的ファイル(画像ファイルなど)
  - `slides.md`
    - スライドのエントリポイント
- `.github/workflows/release.yml`
  - ビルドとリリースの自動化設定
- `LICENSE`
  - このプロジェクトのライセンス

## PDFのビルド方法

### 共通

1. [mise](https://mise.jdx.dev)をインストールしてください。
2. プロジェクトルートで `mise install` を実行してください。

### 原稿のビルド

`doc` ディレクトリで以下のコマンドを実行してください。

```sh
typst compile hello-rust-world.typ
```

### スライドのビルド

`slidev` ディレクトリで以下のコマンドを実行してください。

```sh
pnpm export

```

## スライドの閲覧方法

`slidev` ディレクトリで以下のコマンドを実行してください。

```sh
pnpm dev
```
