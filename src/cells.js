const { Subject } = require('rxjs')
const { filter } = require('rxjs/operators')

function diagonalsGenerator (boardWidth, boardHeight, fn) {
  // Calculate diagonals
  const diagonals = [...Array(boardWidth)].flatMap((_, x) => [...Array(boardHeight)].map((_, y) => fn(x, y)))

  // Filter duplicate values
  const set = new Set(diagonals)

  // Map subjects to diagonals
  const subjects = [...set].reduce((acc, curr) => {
    acc[curr] = new Subject()
    return acc
  }, {})

  return subjects
}

function instantiateCells (boardWidth, boardHeight) {
  const boardSize = boardWidth * boardHeight

  const columns = [...Array(boardWidth)].map(_ => new Subject())
  const rows = [...Array(boardHeight)].map(_ => new Subject())

  const diagonalsA = diagonalsGenerator(boardWidth, boardHeight, (x, y) => x + y)
  const diagonalsD = diagonalsGenerator(boardWidth, boardHeight, (x, y) => x - y)

  const cells = [...Array(boardSize)].map((_, i) => ({
    subject: new Subject(),
    x: i % boardWidth,
    y: Math.floor(i / boardWidth),
    index: i
  }))

  cells.forEach(cell => {
    [
      columns[cell.x],
      rows[cell.y],
      diagonalsA[cell.x + cell.y],
      diagonalsD[cell.x - cell.y]
    ].forEach(subject => {
      subject
        .pipe(filter(v => v === 1))
        .subscribe(v => cell.subject.next(v + 1))
    })

    cell.subject
      .pipe(filter(v => v === 1))
      .subscribe(v => {
        columns[cell.x].next(v)
        rows[cell.y].next(v)
        diagonalsA[cell.x + cell.y].next(v)
        diagonalsD[cell.x - cell.y].next(v)
      })
  })

  return cells
}

module.exports = instantiateCells
