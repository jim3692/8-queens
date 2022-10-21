const { Subject } = require('rxjs')
const { filter } = require('rxjs/operators')

function generateCells (boardWidth, boardHeight, name) {
  const boardSize = boardWidth * boardHeight
  return [...Array(boardSize)].map((_, i) => newCellFromIndex(boardWidth, boardHeight, i).extend({ name }))
}

function cellCoordsToIndex (boardWidth, xCoord, yCoord) {
  return yCoord * boardWidth + xCoord
}

function newCellFromIndex (boardWidth, boardHeight, index) {
  return newCellFromCoords(boardWidth, boardHeight, index % boardWidth, Math.floor(index / boardWidth))
}

function newCellFromCoords (boardWidth, boardHeight, xCoord, yCoord) {
  const cell = {
    x: xCoord,
    y: yCoord,
    index: cellCoordsToIndex(boardWidth, xCoord, yCoord),
    subject: new Subject(),

    extend (obj) {
      Object.keys(obj)
        .forEach(key => { cell[key] = obj[key] })

      Object.keys(obj)
        .filter(key => typeof obj[key] === 'function')
        .forEach(key => cell[key].bind(cell))

      return cell
    },

    mark (previousCells = []) {
      const fullName = `${this.name}-${this.index}`
      const set = new Set(previousCells)
      const next = [...previousCells, fullName]
      // console.log(next)
      if (set.size < 5 && !set.has(fullName)) {
        cell.subject.next(next)
      }
    }
  }

  return cell
}

function connectCellsToNextLocations (cells, nextLocations) {
  nextLocations.forEach((from, fromIndex) => {
    cells[fromIndex].subject
      .pipe(filter(previousCells => previousCells.length < 3))
      .subscribe(previousCells => {
        from.forEach(to => {
          to.mark(previousCells)
        })
      })
  })

  nextLocations.forEach(from => from.forEach(to => {
    to.subject.subscribe(previousCells => {
      cells[to.index].mark(previousCells)
    })
  }))
}

function straightsGenerator (boardWidth, boardHeight) {
  const cells = generateCells(boardWidth, boardHeight, 'straight')

  const nextLocations = cells
    .map(c => cells
      .filter(({ x, y }) => x === c.x || y === c.y)
      .filter(({ x, y }) => x !== c.x || y !== c.y)
      .map(({ x, y }) => newCellFromCoords(boardWidth, boardHeight, x, y)
        .extend({ name: 'straightNext', parent: c.index }))
    )

  connectCellsToNextLocations(cells, nextLocations)
  return cells
}

function diagonalsGenerator (boardWidth, boardHeight) {
  const cells = generateCells(boardWidth, boardHeight, 'diagonal')

  const nextLocations = cells
    .map(c => cells
      .filter(({ x, y }) => x - y === c.x - c.y || x + y === c.x + c.y)
      .filter(({ x, y }) => x !== c.x && y !== c.y)
      .map(({ x, y }) => newCellFromCoords(boardWidth, boardHeight, x, y)
        .extend({ name: 'diagonalNext', parent: c.index }))
    )

  connectCellsToNextLocations(cells, nextLocations)
  return cells
}

function instantiateCells (boardWidth, boardHeight) {
  const straights = straightsGenerator(boardWidth, boardHeight)
  const diagonals = diagonalsGenerator(boardWidth, boardHeight)

  const cells = generateCells(boardWidth, boardHeight, 'main')

  cells.forEach(cell => {
    [
      straights[cell.index],
      diagonals[cell.index]
    ].forEach(nextLocation => {
      nextLocation.subject
        .subscribe(v => cell.mark(v))
    })

    cell.subject
      .pipe(filter(v => v.length === 1))
      .subscribe(v => {
        straights[cell.index].mark(v)
        diagonals[cell.index].mark(v)
      })
  })

  return cells
}

module.exports = instantiateCells
