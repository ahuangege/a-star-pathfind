import A_star_pathfinder from "../src/pathFinding";

let pathFind = new A_star_pathfinder();

let tiles: number[][] = [];
for (let i = 0; i < 10; i++) {
    tiles[i] = [];
    for (let j = 0; j < 10; j++) {
        tiles[i][j] = 1;
    }
}

pathFind.init(tiles);

// pathFind.changeTileValue(3,3,3)

let path = pathFind.findPath(0, 0, 6, 6);

for(var i = 0; i < path.length; i++){
    tiles[path[i].y][path[i].x] = 8;
}

for(var i = 0; i < tiles.length; i++){
    console.log(tiles[i])
}
