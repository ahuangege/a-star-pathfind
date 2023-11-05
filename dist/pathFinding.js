"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class a_star_pathfind {
    constructor() {
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
    init(tiles, options) {
        options = options ? options : {};
        this.maxSearch = options.maxSearch || Infinity;
        this.allowDiagonal = options.allowDiagonal === false ? false : true;
        if (options.heuristicFunc) {
            this.heuristicFunc = options.heuristicFunc;
        }
        this.max_y = tiles.length - 1;
        this.max_x = tiles[0].length - 1;
        for (let j = 0; j <= this.max_y; j++) {
            this.tiles[j] = [];
            for (let i = 0; i <= this.max_x; i++) {
                this.tiles[j][i] = {
                    x: i,
                    y: j,
                    val: tiles[j][i],
                    state: 0 /* tileState.clean */,
                    f_s: 0,
                    g_s: 0,
                    h_s: 0,
                    pre: null,
                    index: 0
                };
            }
        }
    }
    /**
     * 改变格子代价值
     * @param x
     * @param y
     * @param val 值越大，代价越大。 0表示不可行走
     */
    changeTileValue(x, y, val) {
        if (x < 0 || x > this.max_x || y < 0 || y > this.max_y) {
            console.warn("changeTileWeight out of range pos(" + x + "," + y + ")");
            return;
        }
        this.tiles[y][x].val = val;
    }
    /**
     * 寻路
     * @param sx 起点 x
     * @param sy 起点 y
     * @param ex 终点 x
     * @param ey 终点 y
     */
    findPath(sx, sy, ex, ey) {
        if (sx < 0 || sx > this.max_x || sy < 0 || sy > this.max_y) {
            console.warn("findPath out of range start pos(" + sx + "," + sy + ")");
            return null;
        }
        if (ex < 0 || ex > this.max_x || ey < 0 || ey > this.max_y) {
            console.warn("findPath out of range end pos (" + ex + "," + ey + ")");
            return null;
        }
        let tiles = this.tiles;
        let startTile = tiles[sy][sx];
        let endTile = tiles[ey][ex];
        // 搜索序号超过整数精度时，需要重置
        if (this.findIndex > 9999999) {
            this.resetFindIndex();
        }
        let findIndex = ++this.findIndex;
        startTile.g_s = 0;
        startTile.h_s = this.heuristicFunc(startTile.x, startTile.y, ex, ey);
        startTile.f_s = startTile.g_s + startTile.h_s;
        startTile.index = findIndex;
        startTile.state = 0 /* tileState.clean */;
        let openList = new queue();
        openList.enqueue(startTile);
        let findNum = 0;
        let closestTile = startTile; // 离目标格子最近的格子
        while (openList.getLen() > 0) {
            let oneTile = openList.dequeue();
            oneTile.state = 2 /* tileState.closed */;
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
            let neighbors = this.getNeighbors(oneTile);
            for (let i = 0; i < neighbors.length; i++) {
                let neighbor = neighbors[i];
                // 搜索序号不是本次的，重置
                if (neighbor.index !== findIndex) {
                    neighbor.index = findIndex;
                    neighbor.state = 0 /* tileState.clean */;
                }
                if (neighbor.state === 2 /* tileState.closed */) {
                    continue;
                }
                let distance = (oneTile.x === neighbor.x || oneTile.y === neighbor.y) ? neighbor.val : 1.414 * neighbor.val;
                if (neighbor.state === 0 /* tileState.clean */) {
                    neighbor.g_s = oneTile.g_s + distance;
                    neighbor.h_s = this.heuristicFunc(neighbor.x, neighbor.y, ex, ey);
                    neighbor.f_s = neighbor.g_s + neighbor.h_s;
                    neighbor.state = 1 /* tileState.open */;
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
        let path = [];
        let tmpTile = closestTile;
        while (tmpTile !== startTile) {
            path.push({ "x": tmpTile.x, "y": tmpTile.y });
            tmpTile = tmpTile.pre;
        }
        path.reverse();
        return path;
    }
    /**
     * 寻找邻居节点
     * @param tile
     */
    getNeighbors(tile) {
        let neighbors = [], x = tile.x, y = tile.y, tiles = this.tiles, l = false, r = false, u = false, d = false, max_x = this.max_x, max_y = this.max_y;
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
    }
    /**
     * 重置所有格子的搜索序号
     */
    resetFindIndex() {
        for (let i = this.tiles.length - 1; i >= 0; i--) {
            let row = this.tiles[i];
            for (let j = row.length - 1; j >= 0; j--) {
                row[j].index = 0;
            }
        }
        this.findIndex = 0;
    }
}
exports.default = a_star_pathfind;
class queue {
    constructor() {
        this.arr = [];
    }
    enqueue(tile) {
        this.arr.push(tile);
        this.move_up(this.arr.length - 1);
    }
    dequeue() {
        if (this.arr.length === 0) {
            return undefined;
        }
        let min = this.arr[0];
        this.arr[0] = this.arr[this.arr.length - 1];
        this.arr.pop();
        this.move_down(0);
        return min;
    }
    peek() {
        return this.arr[0];
    }
    remove(tile) {
        let index = this.arr.indexOf(tile);
        if (index === -1) {
            return;
        }
        this.arr[index] = this.arr[this.arr.length - 1];
        this.arr.pop();
        const parentIdx = Math.floor((index - 1) / 2);
        if (this.arr[index] && this.arr[parentIdx] && this.arr[index].f_s < this.arr[parentIdx].f_s) {
            this.move_up(index);
        }
        else {
            this.move_down(index);
        }
    }
    rescore(tile) {
        let index = this.arr.indexOf(tile);
        if (index === -1) {
            return;
        }
        const parentIdx = Math.floor((index - 1) / 2);
        if (this.arr[index] && this.arr[parentIdx] && this.arr[index].f_s < this.arr[parentIdx].f_s) {
            this.move_up(index);
        }
        else {
            this.move_down(index);
        }
    }
    move_up(idx) {
        let parentIdx = Math.floor((idx - 1) / 2);
        while (0 <= parentIdx) {
            if (this.arr[idx].f_s >= this.arr[parentIdx].f_s) {
                break;
            }
            let tmp = this.arr[idx];
            this.arr[idx] = this.arr[parentIdx];
            this.arr[parentIdx] = tmp;
            idx = parentIdx;
            parentIdx = Math.floor((idx - 1) / 2);
        }
    }
    move_down(idx) {
        while (true) {
            let leftChildIdx = idx * 2 + 1;
            let rightChildIdx = idx * 2 + 2;
            let targetPos = idx;
            if (leftChildIdx < this.arr.length && this.arr[targetPos].f_s > this.arr[leftChildIdx].f_s) {
                targetPos = leftChildIdx;
            }
            if (rightChildIdx < this.arr.length && this.arr[targetPos].f_s > this.arr[rightChildIdx].f_s) {
                targetPos = rightChildIdx;
            }
            if (targetPos === idx) {
                break;
            }
            let tmp = this.arr[idx];
            this.arr[idx] = this.arr[targetPos];
            this.arr[targetPos] = tmp;
            idx = targetPos;
        }
    }
    getLen() {
        return this.arr.length;
    }
}
