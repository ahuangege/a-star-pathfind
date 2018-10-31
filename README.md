a-star-pathfind
===========================


## installation

```bash
npm install a-star-pathfind
```

## usage

* 代码示例
```
let pathFind = require("a-star-pathfind")
let pathFind = new pathFind.default();

let tiles = [];
for (let i = 0; i < 10; i++) {
    tiles[i] = [];
    for (let j = 0; j < 10; j++) {
        tiles[i][j] = 1;
    }
}

pathFind.init(tiles);

// pathFind.changeTileValue(3,3,3)

let path = pathFind.findPath(0, 0, 6, 6);

for (var i = 0; i < path.length; i++) {
    tiles[path[i].y][path[i].x] = 8;
}

for (var i = 0; i < tiles.length; i++) {
    console.log(tiles[i])
}
```
## 可选参数<br>
1、是否可走对角线。<br>
  allowDiagonal 。默认为true。<br>
2、格子权重代价。<br>
  值越大，代价越高。 0表示不可行走区域。<br>
3、关闭列表上限。<br>
  maxSearch 。关闭列表中最多可容纳的格子数。当点击不可行走区域时，通过此值，防止遍历所有格子。<br>
4、可选启发函数。<br>
  heuristicFunc 。默认曼哈顿距离。<br>
