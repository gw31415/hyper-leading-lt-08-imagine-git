---
theme: apple-basic
title: Gitを「イメージ」する
highlighter: shiki
drawings:
  persist: true
transition: slide-left
image: "/git-logo.jpg"
layout: intro-image
---

# Gitを「イメージ」する

様々な視点から

<div class="absolute bottom-10">Ama / Yuki Okugawa</div>

---
layout: image-right
image: "/me.jpg"
---

# 自己紹介 Ama

- 和歌山県立医科大学<br>医学部4年
- PG歴: 2年目(23年2月~)
- Backend (統括)
- 好きなもの: Neovim
- 最近: [Hono](https://hono.dev)を弄ってます

---
layout: two-cols
transition: slide-up
---

# 今回の目的

<v-clicks>

- Gitの操作を「イメージ」する
- Gitの内部構造を理解する

</v-clicks>

## 想定する読者

<v-clicks>

- Gitの基本操作ができる
- Gitを何となく使っている

</v-clicks>

::right::

# おしながき

<div v-click>

- Git履歴のグラフ
- Gitのデータ構造
- コミットのエイリアス
- その他
  - Packfile
  - Index
- コマンド各論

</div>

<!--
- 目的
	- Gitの操作を「イメージ」する。つまり、Gitの内部構造を理解する。

- 想定する読者
	(スライドを読む)


- おしながき (式次第？)
	- Git履歴のグラフについて：Gitの履歴がどのような変遷になっているのか。
		- なんとなく理解してる人もいるかもしれませんが、改めて確認。
	- Gitのデータ構造について：Gitのデータがどのように保存されているのか。
		- `.git` ディレクトリの中身を見る。
	- コミットのエイリアスについて：普段使っている `main` や `HEAD` はコミットのエイリアスになっている。その仕組みを見ていきます。
	- その他：PackfileやIndexも触れる。
		- Packfile: オブジェクトの圧縮保存
		- Index: ステージングの仕組みに関わる。
-->

---
layout: section
---

# Git履歴のグラフ

---
layout: center
transition: fade
---

# Gitとは？

<v-clicks>

- 分散型
- <u>バージョン</u>管理

</v-clicks>

<!--
- Gitとは何をするソフトと言われていますか？

- 巷では「分散型、バージョン管理システム」と言われていますが、どういう意味でしょうか？
- 特に「バージョン管理」という言葉に注目しましょう。
-->

---
layout: statement
transition: fade
---

<v-switch>
<template #0>

バージョンとは？

</template>
<template #1>

# バージョン ≒ 履歴

</template>
</v-switch>

<!--
- バージョンとは何でしょうか？
- バージョンとは「履歴」のことです。つまり……(次のスライド)
-->


---
layout: image
image: "/undo-redo.jpg"
---

<!--
このイメージです。
- これは Google Sheets の Undo/Redo ボタンです。
- この履歴をGoogle Sheetsのみならず、どんなファイル群に対しても適用するソフトがGitです。

次に、このボタンを押したとき、履歴がどういう風に追加されていくのか、グラフでイメージしていきたいと思います。
-->

---
layout: two-cols
transition: fade
---

# 履歴の変遷イメージ

<ul>
<li v-click=1>変更する</li>
<li v-click=2><strong>コミット</strong>として記録する</li>
<li v-click=4>1つ戻す</li>
<li v-click=6>変更する</li>
<v-switch at=7>
	<template #0-2>
		<li>
			コミットする
		</li>
		<div v-click=7>→ 履歴はどうなる？</div>
	</template>
	<template #2>
		<li>
			コミットする
			<ul>
				<li>"パラレルワールド"</li>
				<li>上書きはされない</li>
			</ul>
		</li>
	</template>
</v-switch>
</ul>

::right::
<div class="h-40"></div>

<v-switch at=1>
<template #0-3>

```mermaid
%%{ init: { 'gitGraph': { 'showCommitLabel': false, 'showBranches': false } } }%%
gitGraph
	commit
	commit
	commit type: HIGHLIGHT
```

</template>
<template #3-5>

```mermaid
%%{ init: { 'gitGraph': { 'showCommitLabel': false, 'showBranches': false } } }%%
gitGraph
	commit
	commit
	commit
	commit type: HIGHLIGHT
```

</template>
<template #5-8>

```mermaid
%%{ init: { 'gitGraph': { 'showCommitLabel': false, 'showBranches': false } } }%%
gitGraph
	commit
	commit
	commit type: HIGHLIGHT
	commit
```

</template>
<template #8>

```mermaid
%%{ init: { 'gitGraph': { 'showCommitLabel': false, 'showBranches': false } } }%%
gitGraph
	commit
	commit
	commit
	branch feature
	switch main
	commit
	switch feature
	commit type: HIGHLIGHT
```

</template>
</v-switch>

<!--
履歴の変遷を順にイメージしていきましょう。

(スライドを読む)

履歴の枝から、他の枝がどんどん生えていくイメージです。これから履歴全体のグラフとしては……(次のスライド)
-->

---
layout: center
transition: fade
---

# 履歴は **木構造** である

```mermaid
%%{ init: { 'gitGraph': { 'showCommitLabel': false, 'showBranches': false } } }%%
gitGraph
	commit
	branch feature/branch1
	switch feature/branch1
	commit
	commit
	branch feature/branch2
	switch feature/branch2
	commit
	commit
	switch feature/branch1
	commit
	branch feature/branch3
	switch feature/branch3
	commit
	switch feature/branch1
	commit
	switch feature/branch3
	commit
	switch feature/branch2
	commit
	switch feature/branch3
	commit
	switch main
	commit
	switch feature/branch1
	commit
```

<!--
こんな風になります。
- ただの直線形ではなく、履歴を戻ったり、分岐したり、分岐している間に他人の更新があったりと、複雑な構造になります。
- このような構造を **木構造** と言います。
- この図だとまだ足りないことがあります。
- 問題：分岐しっぱなしだと1つに纏まらない。<u>更新があるたびに分岐が増えていく→分岐した意味がない</u>。最終的には最新版に更新を取り込む必要がある。
-->

---
layout: center
---

# 分岐の逆： **マージ**

```mermaid
%%{ init: { 'gitGraph': { 'showCommitLabel': false, 'showBranches': false } } }%%
gitGraph
	commit
	branch feature/branch1
	switch feature/branch1
	commit
	commit
	branch feature/branch2
	switch feature/branch2
	commit
	commit
	switch feature/branch1
	commit
	branch feature/branch3
	switch feature/branch3
	commit
	switch feature/branch1
	commit
	switch feature/branch3
	commit
	switch feature/branch2
	commit
	switch feature/branch3
	commit
	switch main
	commit
	switch feature/branch1
	commit
	switch feature/branch1
	merge feature/branch3
	switch main
	merge feature/branch2
	merge feature/branch1
	switch feature/branch1
	commit
```

<v-click>

※ 数学的には <u>**有向非巡回グラフ**</u>

</v-click>

<!--
- このように分岐した履歴を他のブランチに統合させることを **マージ** と言います。
- ちなみに、このような構造を数学的には **有向非巡回グラフ** と言います。
	- 分岐がある
	- 各頂点から頂点に方向が定義されている(時系列がある)
	- 同じ頂点を2回以上通らない
-->

---
transition: slide-up
---

# マージの内部的手順

<ul>
<li class="text-2xl" v-click>各コミット同士の <strong>直近の分岐点</strong> を見つける</li>
<li class="text-2xl" v-click>分岐点からの <strong>変更差分をそれぞれ集計</strong></li>
<li class="text-2xl" v-click>競合していない差分を統合</li>
<li class="text-2xl" v-click>
	競合が発見された場合、 <strong>マージをブロック</strong>
	<ul>
		<li class="text-2xl">手動で解決してもらう(<strong>コンフリクト</strong>)</li>
	</ul>
	
</li>
<li class="text-2xl" v-click>競合が解消されたら、 <strong>親が2つあるコミット (マージコミット)</strong> を作成、ブランチの最新コミットを更新</li>
</ul>

<!--

(スライドを読む)

- 競合発生：
	1. 分岐点以降の変更箇所の中で、
	2. 同じファイルの近い行に変更がある場合

- マージコミット作成が必要ないケースも多々ある
	- 詳しくは「Fast-Forward」で検索してね。

「Git履歴のグラフ」については以上です。
-->

---
layout: section
---

# Gitのデータ構造

<!--

次に、Gitのデータ構造について見ていきます。
情報を保存する場所や、保存される情報の種類についてです。

-->

---

# Gitのデータの場所

- **`.git`** ディレクトリに保存される

```txt {*}{maxHeight:'240px'}
.git/
├── index
│
├── HEAD
├── FETCH_HEAD
├── ORIG_HEAD
├── MERGE_HEAD
│
├── objects/
│   ├── 00/
│   │   └── ...
│   ├── 01/
│   │   └── ...
│   ├ ...
│   ├ ...
│   │
│   ├── ff/
│   │   └── ...
│   │
│   ├── info/
│   └── pack/
│
├── refs/
│   ├── heads/
│   │   ├── feat/
│   │   │   └─ signup
│   │   └── main
│   ├── remotes/
│   │   ├── origin/
│   │   │   ├─ HEAD
│   │   │   └─ main
│   │   └── upstream/
│   │       └── ...
│   ├── stash
│   └── tags/
│       ├── v1.0.0
│       └── v1.0.1
│
│
├── COMMIT_EDITMSG
├── config
├── info/
│   └── exclude
├── hooks/
:

```

<!--

- 情報はどこに保存されているのか。
	- `.git` 隠しディレクトリに保存されている。
- 内部構造はこうなっている。
	- `objects/` に過去のファイルや履歴のグラフの本体が保存されている。
	- `refs/` や `HEAD`, `FETCH_HEAD` などのファイルには `objects/` のエイリアス(人間が扱いやすい名前のショートカット)が保存されている。
	- `index` は「ステージングエリア」の状態を保存している。
		- 「ステージングエリア」簡単に説明すると、`git add` でファイルを追加した後、`git commit` でコミットするまでの状態を保存していると考えてください。

まずは、 `object/` 内に具体的にどんなファイルが保存されているのか見ていきます。

-->

---
layout: two-cols-header
---

# オブジェクトについて

<div class="h-8"></div>

各データは**オブジェクト**として保存。

::left::

<v-clicks>

- テキスト/バイナリ ファイルのコピー
- ディレクトリツリー
- コミット
- (注釈付き)タグ

</v-clicks>

::right::


<v-clicks>

- ファイル関連オブジェクト
	- **Blob** オブジェクト
	- **Tree** オブジェクト
- **Commit** オブジェクト
- **Tag** オブジェクト

</v-clicks>

<!--

- Gitのデータはオブジェクトとして保存されている。
- どんな情報を保存すべきでしょうか？
	- まずはファイル本体を `.git` の中にコピーしなきゃいけない
	- どこに配置するか、ディレクトリ構造も保存しなきゃいけない
	- それに加えて、誰が、いつ、何を変更したか、どのような履歴になっているかも保存しなきゃいけない
	- 詳しい人は、「Gitのタグには軽量タグと注釈付きタグがある」ことを知っているかもしれません。
		- このうち注釈付きタグは固有の情報を持っているので、それも保存しなきゃいけない。

- それぞれをGitのオブジェクトに対応させると次のようになる。
	- ファイルやディレクトリ構造は **Blob** オブジェクトと **Tree** オブジェクト
	- コミットは **Commit** オブジェクト
	- 注釈付きタグは **Tag** オブジェクト


- 次のスライドの導入↓
	- これで、各オブジェクトがどの情報を担当しているかがわかりました。
	- ただ、情報は複雑な構造体になっている。一方、オブジェクトはバイナリファイルである。
	- 次に、これらの構造体の情報を、どのように「オブジェクト」というバイナリファイルに変換するのか

-->

---
layout: center
transition: fade
---

オブジェクトを理解したい。

<v-click>

→ **1コミット** あたり記録している内容を見ていこう。

</v-click>

<!--

- 4種類のオブジェクトそれぞれを見る前に、まずオブジェクトの関係をイメージしたいと思います。
- 「1コミットを保存するためにどのように4種のオブジェクトを分担するか」イメージしながら聞いてください

-->

---
layout: image-right
image: ""
transition: fade
---

# 1コミットの情報

<v-clicks>

- <u>**ファイルとディレクトリ**</u>
	- 各ファイルの配置と<br>バイナリデータ
- <u>**親コミットの _ID_**</u>
- その他のデータ
	- コミットメッセージ, ユーザー, 時刻, ……

</v-clicks>

<!--

- まず、その時点でのファイルがどうなっているのか保存しなきゃいけない
	- ここらへんが Treeオブジェクト や Blobオブジェクト
- 有向非巡回グラフを保存するために、1つ前のコミットがどれか、親のCommitオブジェクトのIDを保存する必要がある
- その他のテキストデータも保存

-->

---
layout: center
---

**ここからは**

<v-click>

**<u>さっきの情報とオブジェクトの対応</u>を**

</v-click>

**想像しながら聞いてください**

<!--

4種類のオブジェクトの相互関係がイメージできたと期待して、

(スライドを読む)

-->

---
transition: fade
---

# ファイル関連オブジェクト

<div class="h-10"></div>

**⚠ よくある誤解**

<v-clicks>

- 誤：コミットは **変更差分** を記録している
- 正：コミットは **スナップショット** を記録している

</v-clicks>

<div class="flex flex-col items-center justify-evenly">
	<p v-click>
		ファイルを一部変更しても<u>別の<strong>オブジェクト</strong></u>が作られる
	</p>
	<p v-click>
		※ 複数オブジェクトの圧縮保管の際に適宜差分を取る (Packfile)
	</p>
</div>

<!--

まずは BlobオブジェクトとTreeオブジェクトについてです。

- 最初に、Gitのファイル関連オブジェクトについて誤解が多いので、その誤解を解消します。
- 「コミットはファイルの変更差分を記録している」と思われがち→実際は違う
- スナップショット = ファイルを丸々コピーし構造化して保存

ということは、Blobオブジェクトは **<u>ファイルの差分ではなく</u>**、ファイルを丸ごとコピーしたものが含まれていればいいということです。

-->

---
transition: fade
---

# ファイル関連オブジェクト

- **Blob** オブジェクト
	- ファイルのバイナリデータ (gzip圧縮)
	- ファイル名は保存されない
- **Tree** オブジェクト
	- ディレクトリの構造
	- ファイル名 → Blobオブジェクトの _ID_ の関連付け
	- サブディレクトリ名 → Treeオブジェクトの _ID_ の関連付け

<!--

- Blobオブジェクト：ファイルのバイナリデータを圧縮保存
- Treeオブジェクト：ディレクトリ構造を保存
	- 説明を書いているが、分かりにくいので次のページでイメージして下さい。
-->

---

<div class="w-full h-110 flex flex-col justify-center items-center">

<img src="/tree-blob-model.png" alt="Tree-Blob Model" class="w-1/2">

引用元：[Gitの内側 - Gitオブジェクト](https://git-scm.com/book/ja/v2/Gitの内側-Gitオブジェクト)

</div>

<!--

(一番下の Treeオブジェクトから説明する)

-->

---

# Commit オブジェクト

**コミット**1つに対応するオブジェクト。

<ul>
  <li v-click><strong>Tree</strong> オブジェクト
    <ul>
      <li>プロジェクトルートのファイル/ディレクトリ配置</li>
    </ul>
  </li>
  <li v-click>親の <strong>Commit</strong> オブジェクトの <em>ID</em>
    <ul>
      <li>1つのコミットには1つ以上の親がある</li>
    </ul>
  </li>
  <li v-click>コミットメッセージ, ユーザー, 時刻, ……</li>
</ul>

<!--

- コミットオブジェクトは、1コミットに対応するオブジェクト。
- 1コミットの状態の再現に必要な情報が記録されます。

- 含まれる情報
	- その時のプロジェクトルートのファイル/ディレクトリ配置
		- つまり…… **Treeオブジェクト** ですね。
	- 1つ前のコミットを辿れるように記録する必要がある
		- つまり…… 親の **Commitオブジェクト** の _ID_ ですね。
	- あとは、コミットメッセージ等の個別情報が含まれます。
-->

---
transition: fade
---

# Tag オブジェクト

**<u v-click>注釈付き</u>タグ**1つに対応するオブジェクト。 <span class="text-lg" v-click><code>git tag -a</code> (<code>-s</code>, <code>-m</code>)</span>

<v-clicks>

<div class="bg-gray-100 px-4 rounded-lg text-dark">
<h3>注釈付きタグとは？</h3>
<hr class="m-2">
<ul>
<li class="text-lg"><strong>軽量タグ</strong>：単なるオブジェクトのエイリアス</li>
<li class="text-lg"><strong>注釈付きタグ</strong>：各オブジェクトにメッセージを保存できる。タグ作成者や時刻も記録</li>
</ul>
</div>

<div class="flex items-end justify-evenly divide-x divide-dashed">
<div class="w-7/20 text-center">

```mermaid
flowchart LR
	LightTag@{ shape: stadium, label: "v1.0.0" } o--o
	Commit["`
	<strong><u>Commit</u></strong>
	<div style="font-size: 8px"><code>a9193f9</code></div>
	`"] -->
	Tree["`
	<strong><u>Tree</u></strong>
	<div style="font-size: 8px"><code>e2383d0</code></div>
	`"]
	
	Commit -->
	MotherCommit["`
	<strong><u>Commit'</u></strong>
	<div style="font-size: 8px"><code>bf05968</code></div>
	`"]
```

<div class="text-sm">軽量タグ</div>

</div>
<div class="w-1/2 text-center">

```mermaid
flowchart LR
	classDef tag stroke:#f00
	LightTag@{ shape: stadium, label: "v1.0.0" } o--o
	Tag["`
	<strong><u>Tag</u></strong>
	<div style="font-size: 8px"><code>f9adc43</code></div>
	`"]:::tag -->
	Commit["`
	<strong><u>Commit</u></strong>
	<div style="font-size: 8px"><code>a9193f9</code></div>
	`"] -->
	B["`
	<strong><u>Tree</u></strong>
	<div style="font-size: 8px"><code>e2383d0</code></div>
	`"]

	Commit -->
	MotherCommit["`
	<strong><u>Commit'</u></strong>
	<div style="font-size: 8px"><code>bf05968</code></div>
	`"]
```

<div class="text-sm">注釈付きタグ</div>

</div>
</div>

</v-clicks>

<!--
- タグオブジェクトは、タグに対応するオブジェクトです。
	- タグはタグでも、注釈付きタグに対応するオブジェクト。
- そもそも注釈付きタグとは、タグにメッセージなどのデータを付与できる機能です。
	- 内部的には、
		- **軽量タグ**はオブジェクトIDに<u>別名を付けただけ</u>
		- **注釈付きタグ**は、オブジェクトを丸々含んだ別オブジェクトを作成し、それに軽量タグを付けたもの
- 図にするとこのようになります
	- この図において、四角はオブジェクトを表し、丸いのはエイリアスを表します。
	- 軽量タグはコミットにエイリアスを付けただけです。
	- 注釈付きタグは、新たにオブジェクトを作成して、そのオブジェクトにエイリアスを付けています。
	- オブジェクトにはメッセージ等の小さな情報を含ませることができるので、タグを注釈付きにすることができるのです。
-->

---

# Tag オブジェクト

**<u>注釈付き</u>タグ**が持つ情報:

<v-click>

- タグが指す オブジェクトの _ID_
- タグ名
- 作成者, 時刻, メッセージ

</v-click>

<!--
- 含まれる情報についてはスライドの通りです。

(スライドを読む)

ここにも記載がありますが、斜体で書いてある _オブジェクトID_ (わざと斜体にしてある) とは何か。
- オブジェクトにオブジェクトを含ませたい場合は、そのIDを指定するようになっています(外部キーみたいなもの)。
- 次のスライドで説明します。
-->

---
transition: slide-up
---

# _オブジェクトID_ とは？

- オブジェクトを表すファイルからハッシュ値を計算したもの
- **SHA-1**ハッシュ関数を使用 <span class="text-lg">(SHA-256に設定も可)</span>

```txt {*}{maxHeight: '120px'}
.git/
└── objects/
    ├── 00/
    │   ├── 97207263d15baa30c1559b4fcb2f98d0f12707
    │   └── ...
    ├── 01/
    │   └── ...
    ├ ...
    │
    ├── ff/
    │   └── ...
    │
    ├── info/
    └── pack/
```

※ `objects/**` 内のファイルから直にSHA-1をとっている訳ではない。
(参照：[Git objects v2](http://www.slideshare.net/chinkouu/git-objects-v2))

<!--
- オブジェクトIDは、オブジェクトを表すファイルを元にハッシュ値を計算したものです。
	- 下の方に書いてあるが、そのまま ハッシュ値を計算しているわけではない(念のため; 色々な情報を付加してからハッシュ値をとっている。詳しくはリンクを参照してね)
	- ハッシュ値というのが分からない方は少し難しいと思うので聞き流していただいても大丈夫です。ハッシュ値というのは、ファイルをミキサーにかけて作ったランダム値のようなものです。
	- 最初の方で、オブジェクトは`.git/objects/`に保存してあると言いましたが、これらの<u>ディレクトリ2文字・ファイル40文字</u>の名前は、<u>オブジェクトIDのSHA-1ハッシュ値42文字</u>に対応しています。

- 実は、これらのハッシュ値のファイルに全てのオブジェクトがあるわけではなく、
	- 下の方に `info/` や `pack/` というディレクトリがある
	- 複数のオブジェクトを圧縮したデータとそのインデックス(後述する)。

- さて、オブジェクトIDはオブジェクトを指すものですが、普段はあまり用いないと思います。実は皆さんも普段、これらに「別名」を付けて間接的に扱っています。
	- 察しが良い人は気付いたかもしれませんが、軽量タグもその「別名」の一例です。
- 以上で、オブジェクトについての説明は終わりとなり、次からは、オブジェクトのエイリアスについて見ていきましょう。
-->

---
layout: section
---

# コミットのエイリアス

<!--

コミットのエイリアスです～。

-->

---
transition: fade
---

# コミットの指定方法

<div class="w-full flex items-center justify-center h-75">

<v-clicks>

**コミットID** (SHA-1ハッシュ値)

だけではないよね……？

</v-clicks>

</div>

<!--

- 普段、皆さんは「特定のコミット」を指定したい時、どのようにして指定していますか？
- ここまでの話から、一番単純なのは、コミットIDを指定することですが、ご存知の通り、コミットIDはあまり入力しないですよね。

-->

---
layout: two-cols-header
---

# コミットの指定方法

::left::

<ul>
<li>
	<v-click at=4><strong>ブランチ</strong></v-click>
	<ul>
		<v-click at=1><li><code>main</code></li></v-click>
		<v-click at=2><li><code>origin/main</code></li></v-click>
		<v-click at=3><li><code>feat/signup</code></li></v-click>
	</ul>
</li>
<li>
	<v-click at=7><strong>タグ</strong></v-click>
	<ul>
		<v-click at=5><li><code>v1.0.0</code></li></v-click>
		<v-click at=6><li><code>v1.0.1</code></li></v-click>
	</ul>
</li>
</ul>

::right::

<v-clicks at=8 depth=2>

- その他
	- **HEAD**
	- **HEAD^**, **HEAD^^**, **HEAD~2**, ……
	- **FETCH_HEAD**
	- **ORIG_HEAD**
	- **MERGE_HEAD**

</v-clicks>

<!--

- 例えば `main` や `origin/main` などのブランチ名、
- `v1.0.0` などのタグ名を指定することがあります。
- その他にも、`HEAD` や `HEAD^` などを入力したこともあるかもしれません。

これらは、実は全て、先程まで説明してきたオブジェクトのIDの別名になっています。

-->

---

# 参照の保存場所

<v-click>

```txt
.git/
├── HEAD
├── FETCH_HEAD
├── ORIG_HEAD
├── MERGE_HEAD
│
├── refs/
│   ├── heads/
│   │   ├── feat/
│   │   │   └─ signup
│   │   └── main
│   ├── remotes/
│   │   ├── origin/
│   │   │   ├─ HEAD
│   │   │   └─ main
│   │   └── upstream/
│   │       └── ...
│   └── tags/
│       ├── v1.0.0
│       └── v1.0.1
:

```

</v-click>

<!--

- これらの別名はどこにあるのか、それはもちろん `.git` ディレクトリ内です。
	- 主に `.git/refs/` ディレクトリ内
	- ものによっては `.git/` 直下

-->

---
transition: fade
---

# コミットの参照の仕組み

<div class="h-10"></div>

参照の中身を見てみよう。

<v-click>

```txt
$ cat .git/HEAD
ref: refs/heads/main

$ cat .git/refs/heads/main
1db14d5578a289819cc0e62d60577f5f4d76187e
```

</v-click>

<div class="py-10 text-center" v-click>

参照は **_オブジェクトID_** や **他の参照** を指す

</div>

<!--

参照の中身はどうなっているのか。

- これらはテキストファイルになっているので、中身を普通にメモ帳やVSCodeなどで見ることができます。
- ターミナルだと `cat` コマンドで中身を見れますね。

このように、参照はオブジェクトIDや他の参照を指しています。

-->

---
layout: section
---

<v-switch>
<template #0-1>

# コミットのエイリアス(?)

</template>
<template #1-2>

# <s>コミット</s>のエイリアス(?)

</template>
</v-switch>
	
<div v-click=1 class="text-red text-5xl">オブジェクト</div>

<!--

実は、参照はコミット限定で付けられるわけではなく、オブジェクト全般に付けられます。

例えば、BlobオブジェクトやTreeオブジェクトにもタグを付けることができます。

ブランチはコミットにしか付けられないなど、一部制限はありますが、基本的にはオブジェクト全般に付けられるような仕組みになっています。

次からは、軽量タグやブランチなど、個別の参照の仕様について説明していきます。

-->

---

# 軽量タグ

<div class="text-lg"><strong>軽量タグ</strong>の配置場所:</div>

<v-click>

```txt
.git/
└── refs/
    └── tags/
        ├── v1.0.0
        └── v1.0.1
```

</v-click>

<ul>
<li class="text-2xl"><strong>軽量タグ</strong>は<strong><i>オブジェクトID</i></strong>のエイリアス
<ul v-click>
	<li class="text-2xl"><u>Commit オブジェクトに限らない！</u></li>
</ul>
</li>
<li class="text-2xl">
<strong>注釈付きタグ</strong>は <v-click><u>他のオブジェクトを指す <strong>Tag オブジェクト</strong> </u>を作成して</v-click>から、その軽量タグを作成している
</li>
</ul>

<!--

- 軽量タグは一番シンプルな参照です。
- 指定したオブジェクトに対して、ユーザーが適当な名前でタグを付けることができます。
- 配置場所はここです
- 実は、コミット以外のオブジェクトにも付けられます。
- 先程も述べたとおり、注釈付きタグはオブジェクトを指すタグオブジェクトを作成してから、その軽量タグを作成しています。

-->

---
layout: two-cols-header
---

# ブランチ

<div class="text-center">

**ローカルブランチ** と **リモートブランチ** がある。

</div>

::left::

<ul>
<v-click at=1><li><strong>Commit オブジェクト</strong> or <strong>他の Branch 参照</strong>に対してのみ作れる</li></v-click>
<v-click at=2><li>系譜の<u>一番終端のコミット</u>を指すことになっている</li></v-click>
</ul>

::right::

<v-switch at=1>
<template #0-3>

```mermaid
%%{ init: { 'gitGraph': { 'showCommitLabel': false, 'showBranches': false } } }%%
gitGraph
	commit
	branch feat
	switch feat
	commit
	switch main
	commit type: HIGHLIGHT

```

</template>
<template #3>

```mermaid
%%{ init: { 'gitGraph': { 'showCommitLabel': false, 'showBranches': false } } }%%
gitGraph
	commit
	branch feat
	switch feat
	commit
	switch main
	commit type: HIGHLIGHT tag: "main"

```

</template>
</v-switch>

<!--

- 次は、皆さんが一番馴染みのあるブランチについてです。
- ブランチは、ローカルブランチとリモートブランチで動作が変わりますが、どちらも <u>**Commitオブジェクト**や他の **Branch 参照**以外には作れません</u>。
- ブランチは「履歴の枝のようなもの」なイメージを持たれていると思います。そのイメージは正しいのですが、 **Commit オブジェクト** の参照としては、一番終端のコミットを指すことになっています。

-->

---

# ローカルブランチ

<div class="h-80 flex justify-around items-center">
<div class="w-1/2">

- 新規コミットを付け加えると **自動的に移動する**

</div>
<div class="w-1/3">

<v-switch at=1>
<template #0-1>

```mermaid
%%{ init: { 'gitGraph': { 'showCommitLabel': false, 'showBranches': false } } }%%
gitGraph
	commit
	branch feat
	switch feat
	commit
	switch main
	commit type: HIGHLIGHT tag: "main"

```

</template>
<template #1>

```mermaid
%%{ init: { 'gitGraph': { 'showCommitLabel': false, 'showBranches': false } } }%%
gitGraph
	commit
	branch feat
	switch feat
	commit
	switch main
	commit type: HIGHLIGHT tag: "main"
	commit

```

</template>
<template #2>

```mermaid
%%{ init: { 'gitGraph': { 'showCommitLabel': false, 'showBranches': false } } }%%
gitGraph
	commit
	branch feat
	switch feat
	commit
	switch main
	commit
	commit type: HIGHLIGHT tag: "main"

```

</template>
</v-switch>

</div>
</div>

<!-- (スライドを読む) -->

---
transition: slide-up
---

# リモートブランチ

ローカルブランチとは少し動作が異なる

<div class="h-50 flex justify-center items-center">

<v-clicks>

- **読み込み専用**
- `git fetch` で自動更新

</v-clicks>

</div>

<!--
(スライドを読む)

以上で参照の各論は終わりになります。
-->

---
layout: section
---

# その他

- Packfile について
- Index について

<!--
最後に、`.git` の残りの項目：PackfileやIndexについて話していきます。

- Packfileは圧縮
- Indexはステージングエリア

に関わるものでしたね。
-->

---
transition: fade
---

# Packfile

<div class="text-2xl">ここにあるやつ ↓</div>
<v-click>

```txt
.git/
└── objects/
    ├── pack/
    └── info/
        
```

</v-click>
<v-clicks>

- <u>**複数オブジェクト**の共通部分をとって</u> `pack`に圧縮
- `info/` は `pack` 内にあるオブジェクトの場所を保持
- 圧縮は **`zlib`** を使用

</v-clicks>

<!--
Packfile は `.git/objects/` 内の、後回しにしていた `pack/`, `info/` ディレクトリの中に保存されているデータでした。

これらは<u>一部しか変更されていない</u> データの共通部分をとることで圧縮するアイデアに関係しています。

- `pack` : データの本体
- `info`: `pack` のどこにどのIDのオブジェクトがあるか

圧縮はDeflate 圧縮 (`zip` や `gzip` と同じ)、 `zlib` を用いている
-->

---
transition: fade
---

# Packfile

## 差分の方向

実は時系列の<v-click>**逆向き**</v-click>に差分をとって圧縮されている！

<v-clicks>

※ **新しいオブジェクト**を**基準**に、**古いオブジェクト**との差分。

← 最新のオブジェクトになるほどアクセス頻度が向上するため。

</v-clicks>

<!--
- 差分のとり方ですが、実は時系列の逆！
  - 今のデータから順に差分をとって昔のデータを求めていく

理由：最新のオブジェクトほどたくさんアクセス
-->

---

# Packfile

## 圧縮タイミング

基本的には操作の度時折自動で行われます。

<div v-click>

手動でも **`gc`** コマンドで実行できます。

```txt {*}{maxHeight: '200px'}
$ git gc
Enumerating objects: 93, done.
Counting objects: 100% (93/93), done.
Delta compression using up to 8 threads
Compressing objects: 100% (89/89), done.
Writing objects: 100% (93/93), done.
Total 93 (delta 42), reused 26 (delta 1), pack-reused 0 (from 0)
Enumerating cruft objects: 21, done.
Traversing cruft objects: 38, done.
Counting objects: 100% (21/21), done.
Delta compression using up to 8 threads
Compressing objects: 100% (21/21), done.
Writing objects: 100% (21/21), done.
Total 21 (delta 10), reused 0 (delta 0), pack-reused 0 (from 0)
```

</div>

<!--
(スライドを読む)
-->

---
transition: fade
---

# Index

```txt
.git/
└── index
```

- **ステージングエリア**の状態に対応
- **ファイルのスナップショット**を保存
- ツリーオブジェクトと同等 (ツリーオブジェクトではない)

<!--
次に、最後に残っていた Index について。

- Indexは、 **ステージングエリア** の状態を保存しているファイル
- `git add` などで編集

気づいた人もいるかもしれないけど、 **ツリーオブジェクト** の情報と同じ。

ただし、<u>ツリーオブジェクトをコピーしたものではない</u>
- ツリーオブジェクト：Blobオブジェクトへのリンクの他、他のTreeオブジェクトなどとリンクしてディレクトリの親子関係を保持
- Index：Blobオブジェクトのみとリンクする1つのバイナリファイル
-->

---
transition: fade
---

# Index

## いつ更新される？

→ <v-click> **`git add` などで編集**</v-click>、 <v-click>**HEAD移動でリセット**</v-click>

<v-clicks>

- ブランチ移動→ **HEAD** の **Tree** オブジェクトを取得
- **Tree** オブジェクトの内容を **Index** に変換
- `git add` などで **Index** を編集
- `git commit` で **Index** の内容を **Tree** オブジェクトに変換

</v-clicks>

<!--
Indexの編集方法について

- `git add` などで編集、HEADの移動でリセット

要するに、
- HEADが変更されると、**HEADのTreeオブジェクトとIndexが同期される**
- ステージングエリアの実体なので、当然**ステージングエリアの編集コマンドで編集される**
-->

---
layout: two-cols-header
transition: slide-up
---

# Index
##  Indexの役割

<v-click>

→ **Tree オブジェクトの編集場所** と考えています

</v-click>

::left::

## Blob オブジェクト

<ul>
	<li class="text-1.4rem" v-click><code>git add</code> で即時 <code>.git/objects/</code> に追加</li>
</ul>

::right::

## Tree オブジェクト

<ul>
	<li class="text-1.4rem" v-click><code>git add</code> の度にTreeオブジェクト作成は複雑</li>
	<li class="text-1.4rem" v-click><strong>Index</strong> 編集、完成後に変換</li>
</ul>

::bottom::

<div v-click class="text-center">

→ Index で <u>Tree オブジェクト作成を遅延</u>している (?)

</div>

<!--
Indexの役割について、自分の考え(開発者の意図を読んだわけではないが)
→ **Treeオブジェクトを編集する場所**

(スライドを読む)

難しいので言いかえると：
- Treeオブジェクトは<u>複数のオブジェクトが互いにリンクしているので</u>編集が大変。
- 編集は1つのファイルであるIndexの方が適している。
- 編集後にIndexをTreeオブジェクトに変換する戦略をとっている

このページの締め：

- 長かったですが、以上で内部構造についての解説は終わり
- 次からはコマンドそれぞれについて解説していく
-->

---
layout: section
---

# コマンド各論

<!--
コマンド各論と題しまして、解説に入ります。
-->

---
layout: statement
---

これからGitのコマンドを例示していきます。

`.git` 内のオブジェクト操作をイメージできますか？

<!--
(スライドを読む)

最初に Git コマンドを示すので、どのような操作が行われているか想像しながら聞いてください。
-->

---

# `git add`

<v-clicks>

- **Blob** オブジェクトを作成
- **Index** に **Blob** オブジェクトを追加

</v-clicks>

<!--
(題目を読んでから「このコマンドは何をしているか」想像させてスライドを読む)
-->

---

# `git commit`

<v-clicks>

- **Index** の内容を **Tree** オブジェクトに変換
- **Commit** オブジェクトを作成
	- 新規作成した **Tree** オブジェクトを指す
	- Parent コミットは <u>HEAD の _ID_</u> を指す

</v-clicks>

<!--
(題目を読んでから「このコマンドは何をしているか」想像させてスライドを読む)
-->

---
layout: two-cols
---

# `git branch`

<v-click>

- **Branch** の参照を作成
	- <u>HEAD の _ID_</u> を指す

</v-click>

# `git tag`

<v-click>

- **Tag** の参照を作成
	- <u>HEAD の _ID_</u> を指す

</v-click>

::right::

# `git tag -a`

<v-clicks>

- **Tag** オブジェクトを作成
- **Tag** の参照を作成
	- <u>HEAD の _ID_</u> を指す

</v-clicks>

<!--
(題目を読んでから「このコマンドは何をしているか」想像させてスライドを読む)

x3
-->

---
transition: fade
---

# `git switch`

<v-clicks>

- **HEAD** の参照を変更
- **Commit** オブジェクト & **Tree** オブジェクトを取得
- **Tree** オブジェクトを **Index** に変換
- **Working Directory** を **Index** に合わせる

</v-clicks>

<!--
(題目を読んでから「このコマンドは何をしているか」想像させてスライドを読む)
-->

---

# `git switch`

<h3>注意</h3>

<v-click>

- ブランチ以外のコミットを指定することもできるが、**危ないので** `--detach` を指定しなければ使えなくなっている
- <u>ブランチで辿れないコミット</u>を作ってしまう可能性があるから
	- **Dangling Commit** と呼ばれる

</v-click>

<!--
さて、`git switch` についての注意点です。

当然、処理としては**Commitオブジェクトに対するIDであれば移動先として指定できるが**、
ブランチ以外を指定するのは<u>**危ない**</u>ので、`--detach` オプションを指定しないといけない。

「危ない」というのは何故か？

- ブランチから離れた状態で操作すると、**ブランチで辿れないコミットを作成できてしまう**。
- <u>ブランチから辿れないコミットのIDなんて覚えている訳がない</u>ので、後で戻れない意味のないコミットになっちゃう
- こういうコミットは **Dangling Commit** と呼ばれる。
-->

---
transition: fade
---

# `git restore`

<v-clicks>

- **HEAD** から **Commit** オブジェクトを取得
- **Tree** オブジェクトを取得
- **Tree** オブジェクトから指定された **Blob** オブジェクトを取得
- **Blob** オブジェクトをファイル変換
- **Working Directory** にファイルを復元

</v-clicks>

<!--
(題目を読んでから「このコマンドは何をしているか」想像させてスライドを読む)
-->

---
transition: slide-up
---

# `git restore`

<h3>参考</h3>

<v-clicks>

- `--source` オプション: **HEAD** 以外の **Commit** オブジェクトから取得可能
- `--staged` オプション: **Index** を編集

<div>
<h3>例</h3>

```bash
git restore --source=origin/main dir/file.txt
# origin/main が指す Commit オブジェクトから dir/file.txt を取り出して Working Directory に復元

git restore --source=HEAD^ --staged file.txt
# HEAD の1つ前が指す Commit オブジェクトから file.txt を取り出して Index に追加
```

</div>

</v-clicks>

<!--
`git restore` で良く使うオプションについても触れておきます。 `--source` オプションと`--staged` オプションがあると思いますが、それぞれ内部でやっている操作はこれです。

(スライドを読む)

普段はこういう動作について気にすることはないかもしれませんが、あえて説明するならこうなります。
-->

---
layout: section
---

# まとめ

<!--
最後に、今回の発表についての要点についてまとめていきたいと思います。
-->

---

# まとめ

<ul>
<li class="text-1.4rem">Gitの履歴は<v-click><strong>有向非巡回グラフ</strong></v-click>。</li>
<li class="text-1.4rem">Gitのデータは<v-click><strong>オブジェクト</strong></v-click>で保存され、 <v-click><strong>Blob, Tree, Commit, Tag</strong></v-click> などの種類がある。</li>
	<li class="text-1.4rem">
		オブジェクトは<v-click><strong>SHA-1ハッシュによるID</strong></v-click>で識別される。
		<ul><li class="text-1.4rem">オブジェクトIDにはブランチ・タグ等、多様な<v-click><strong>参照</strong></v-click>がある。</li></ul>
	</li>
<li class="text-1.4rem">オブジェクトは纏めて<v-click><strong>圧縮</strong></v-click>、Packfileにアーカイブされる。</li>
<li class="text-1.4rem">
	<code>.git/index</code> は<v-click><strong>ステージングエリア</strong></v-click>の状態を保存。
	<ul><li class="text-1.4rem"><v-click><strong>Treeオブジェクトの編集場所</strong></v-click>として考えると理解しやすい。</li></ul>
</li>
</ul>

<!--
(スライド操作で穴を埋めながらスライドを読む)
-->

---
transition: slide-up
---

# 参考文献

- [Chacon, S., & Straub, B. (2014). Pro Git. Apress.](http://progit-ja.github.io)
- [ロボ太Researcher. (2021, October 6). Gitのオブジェクトの中身. Zenn. Retrieved 2024-11-20.](https://zenn.dev/kaityo256/articles/objects_of_git)
- [Guangyu, C. (2013, November 2). Git objects V2. SlideShare. Retrieved 2024-11-20.](http://www.slideshare.net/chinkouu/git-objects-v2)

<!--
参考文献です。

この中で主に助けになったのが**一番上の「Pro Git」**です。

こちらは日本語訳の PDF や epub (KindleやAppleのブックで共通に用いられる電子書籍のフォーマット)が公式から出ているので、よかったら調べてみてね。
(少し情報が古いけど)
-->

---
layout: end
---

<!--
ご清聴ありがとうございました。
-->
