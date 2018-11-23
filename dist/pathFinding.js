"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var a_star_pathfind = /** @class */ (function () {
    function a_star_pathfind() {
        /**
         * 所有的格子节点
         */
        this.tiles = [];
        this.max_x = 0;
        this.max_y = 0;
        /**
         * 搜索序号
         */
        this.findIndex = 0;
        /**
         * 关闭列表中最大的格子数
         */
        this.maxSearch = Infinity;
        /**
         * 是否可走对角线
         */
        this.allowDiagonal = true;
        /**
         * 启发函数
         */
        this.heuristicFunc = function (x0, y0, x1, y1) {
            return Math.abs(x0 - x1) + Math.abs(y0 - y1);
        };
    }
    /**
     * 初始化
     * @param tiles 格子数组（值越大，代价越大。0 表示不可行走区域）
     * @param options 寻路参数配置
     */
    a_star_pathfind.prototype.init = function (tiles, options) {
        options = options ? options : {};
        this.maxSearch = options.maxSearch || Infinity;
        this.allowDiagonal = options.allowDiagonal === false ? false : true;
        if (options.heuristicFunc) {
            this.heuristicFunc = options.heuristicFunc;
        }
        this.max_y = tiles.length - 1;
        this.max_x = tiles[0].length - 1;
        for (var j = 0; j <= this.max_y; j++) {
            this.tiles[j] = [];
            for (var i = 0; i <= this.max_x; i++) {
                this.tiles[j][i] = {
                    x: i,
                    y: j,
                    val: tiles[j][i],
                    state: 0 /* clean */,
                    f_s: 0,
                    g_s: 0,
                    h_s: 0,
                    pre: null,
                    index: 0
                };
            }
        }
    };
    /**
     * 改变格子代价值
     * @param x
     * @param y
     * @param val 值越大，代价越大。 0表示不可行走
     */
    a_star_pathfind.prototype.changeTileValue = function (x, y, val) {
        if (x < 0 || x > this.max_x || y < 0 || y > this.max_y) {
            console.warn("changeTileWeight out of range pos(" + x + "," + y + ")");
            return;
        }
        this.tiles[y][x].val = val;
    };
    /**
     * 寻路
     * @param sx 起点 x
     * @param sy 起点 y
     * @param ex 终点 x
     * @param ey 终点 y
     */
    a_star_pathfind.prototype.findPath = function (sx, sy, ex, ey) {
        if (sx < 0 || sx > this.max_x || sy < 0 || sy > this.max_y) {
            console.warn("findPath out of range start pos(" + sx + "," + sy + ")");
            return null;
        }
        if (ex < 0 || ex > this.max_x || ey < 0 || ey > this.max_y) {
            console.warn("findPath out of range end pos (" + ex + "," + ey + ")");
            return null;
        }
        var tiles = this.tiles;
        var startTile = tiles[sy][sx];
        var endTile = tiles[ey][ex];
        // 搜索序号超过整数精度时，需要重置
        if (this.findIndex > 9999999) {
            this.resetFindIndex();
        }
        var findIndex = ++this.findIndex;
        startTile.g_s = 0;
        startTile.h_s = this.heuristicFunc(startTile.x, startTile.y, ex, ey);
        startTile.f_s = startTile.g_s + startTile.h_s;
        startTile.index = findIndex;
        startTile.state = 0 /* clean */;
        var openList = new queue();
        openList.enqueue(startTile);
        var findNum = 0;
        var closestTile = startTile; // 离目标格子最近的格子
        while (openList.getLen() > 0) {
            var oneTile = openList.dequeue();
            oneTile.state = 2 /* closed */;
            if (oneTile.h_s < closestTile.h_s) {
                closestTile = oneTile;
            }
            if (oneTile === endTile) {
                break;
            }
            findNum++;
            if (findNum > this.maxSearch) {
                break;
            }
            var neighbors = this.getNeighbors(oneTile);
            for (var i = 0; i < neighbors.length; i++) {
                var neighbor = neighbors[i];
                // 搜索序号不是本次的，重置
                if (neighbor.index !== findIndex) {
                    neighbor.index = findIndex;
                    neighbor.state = 0 /* clean */;
                }
                if (neighbor.state === 2 /* closed */) {
                    continue;
                }
                var distance = (oneTile.x === neighbor.x || oneTile.y === neighbor.y) ? neighbor.val : 1.414 * neighbor.val;
                if (neighbor.state === 0 /* clean */) {
                    neighbor.g_s = oneTile.g_s + distance;
                    neighbor.h_s = this.heuristicFunc(neighbor.x, neighbor.y, ex, ey);
                    neighbor.f_s = neighbor.g_s + neighbor.h_s;
                    neighbor.state = 1 /* open */;
                    neighbor.pre = oneTile;
                    openList.enqueue(neighbor);
                }
                else if (oneTile.g_s + distance < neighbor.g_s) {
                    neighbor.g_s = oneTile.g_s + distance;
                    neighbor.f_s = neighbor.g_s + neighbor.h_s;
                    neighbor.pre = oneTile;
                    openList.rescore(neighbor);
                }
            }
        }
        var path = [];
        var tmpTile = closestTile;
        while (tmpTile !== startTile) {
            path.push({ "x": tmpTile.x, "y": tmpTile.y });
            tmpTile = tmpTile.pre;
        }
        path.reverse();
        return path;
    };
    /**
     * 寻找邻居节点
     * @param tile
     */
    a_star_pathfind.prototype.getNeighbors = function (tile) {
        var neighbors = [], x = tile.x, y = tile.y, tiles = this.tiles, l = false, r = false, u = false, d = false, max_x = this.max_x, max_y = this.max_y;
        // 右
        if (x + 1 <= max_x && tiles[y][x + 1].val !== 0) {
            neighbors.push(tiles[y][x + 1]);
            r = true;
        }
        // 左
        if (x - 1 >= 0 && tiles[y][x - 1].val !== 0) {
            neighbors.push(tiles[y][x - 1]);
            l = true;
        }
        // 上
        if (y + 1 <= max_y && tiles[y + 1][x].val !== 0) {
            neighbors.push(tiles[y + 1][x]);
            u = true;
        }
        // 下
        if (y - 1 >= 0 && tiles[y - 1][x].val !== 0) {
            neighbors.push(tiles[y - 1][x]);
            d = true;
        }
        if (!this.allowDiagonal) {
            return neighbors;
        }
        // 左下
        if ((l || d) && x - 1 >= 0 && y - 1 >= 0 && tiles[y - 1][x - 1].val !== 0) {
            neighbors.push(tiles[y - 1][x - 1]);
        }
        // 右下
        if ((r || d) && y - 1 >= 0 && x + 1 <= max_x && tiles[y - 1][x + 1].val !== 0) {
            neighbors.push(tiles[y - 1][x + 1]);
        }
        // 左上
        if ((l || u) && y + 1 <= max_y && x - 1 >= 0 && tiles[y + 1][x - 1].val !== 0) {
            neighbors.push(tiles[y + 1][x - 1]);
        }
        // 右上
        if ((r || u) && y + 1 <= max_y && x + 1 <= max_x && tiles[y + 1][x + 1].val !== 0) {
            neighbors.push(tiles[y + 1][x + 1]);
        }
        return neighbors;
    };
    /**
     * 重置所有格子的搜索序号
     */
    a_star_pathfind.prototype.resetFindIndex = function () {
        for (var i = this.tiles.length - 1; i >= 0; i--) {
            var row = this.tiles[i];
            for (var j = row.length - 1; j >= 0; j--) {
                row[j].index = 0;
            }
        }
        this.findIndex = 0;
    };
    return a_star_pathfind;
}());
exports.default = a_star_pathfind;
var queue = /** @class */ (function () {
    function queue() {
        this.arr = [];
    }
    /**
     * 入栈
     */
    queue.prototype.enqueue = function (tile) {
        this.arr.push(tile);
        this.move_up(this.arr.length - 1);
    };
    /**
     * 出栈
     */
    queue.prototype.dequeue = function () {
        if (this.arr.length === 0) {
            return undefined;
        }
        var min = this.arr[0];
        this.arr[0] = this.arr[this.arr.length - 1];
        this.arr.pop();
        this.move_down(0);
        return min;
    };
    /**
     * 移除
     */
    queue.prototype.remove = function (tile) {
        var index = this.arr.indexOf(tile);
        if (index === -1) {
            return;
        }
        this.arr[index] = this.arr[this.arr.length - 1];
        this.arr.pop();
        this.move_down(index);
    };
    /**
     * 赋值更小值时，重新计算
     */
    queue.prototype.rescore = function (tile) {
        var index = this.arr.indexOf(tile);
        if (index === -1) {
            return;
        }
        this.move_up(index);
    };
    queue.prototype.move_up = function (idx) {
        var parentIdx = Math.floor((idx - 1) / 2);
        while (0 <= parentIdx) {
            if (this.arr[idx].f_s > this.arr[parentIdx].f_s) {
                break;
            }
            var tmp = this.arr[idx];
            this.arr[idx] = this.arr[parentIdx];
            this.arr[parentIdx] = tmp;
            idx = parentIdx;
            parentIdx = Math.floor((idx - 1) / 2);
        }
    };
    queue.prototype.move_down = function (idx) {
        while (true) {
            var leftChildIdx = idx * 2 + 1;
            var rightChildIdx = idx * 2 + 2;
            var targetPos = idx;
            if (leftChildIdx < this.arr.length && this.arr[targetPos].f_s > this.arr[leftChildIdx].f_s) {
                targetPos = leftChildIdx;
            }
            if (rightChildIdx < this.arr.length && this.arr[targetPos].f_s > this.arr[rightChildIdx].f_s) {
                targetPos = rightChildIdx;
            }
            if (targetPos === idx) {
                break;
            }
            var tmp = this.arr[idx];
            this.arr[idx] = this.arr[targetPos];
            this.arr[targetPos] = tmp;
            idx = targetPos;
        }
    };
    /**
     * 长度
     */
    queue.prototype.getLen = function () {
        return this.arr.length;
    };
    return queue;
}());
