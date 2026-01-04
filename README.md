# Minecraft BlockCounter
範囲内のブロックを簡単に数えれるアドオンです

# 使い方
始点、終点を指定し!countコマンドをチャットで送信します

棒の場合は左クリックで始点、右クリックで終点を指定します

# コマンド
### ・!pos1
プレイヤーの座標を始点として保存します
### ・!pos2
プレイヤーの座標を終点として保存します
### ・!count [stack] [include/exclude] [block.id,...]
範囲内のブロックの総数と各ブロックの使用数をチャットに表示します
## !count引数
### ・stack
各ブロックの使用数をスタックと余りの形式で表示します
### ・include
後述するブロックのIDのみを表示します(複数選択可)
### ・exclude
後述するブロックのIDを省いて表示します(複数選択可)

ブロックのIDは,で区切ります
"minecraft:"は省略可能です

#### 例：
!count include stone_bricks
!count stack exclude grass_block,dirt
