const instantiateCells = require('./cells')
const runInSandbox = require('./sandbox')

const DEFAULT_BOARD_WIDTH = 8
const DEFAULT_BOARD_HEIGHT = 8

function runScanner ({ boardWidth, boardHeight, begin, end } = {}) {
  if (!boardWidth) boardWidth = DEFAULT_BOARD_WIDTH
  if (!boardHeight) boardHeight = DEFAULT_BOARD_HEIGHT

  const boardSize = boardWidth * boardHeight

  if (!begin) begin = 0
  if (!end) end = boardWidth

  const cells = instantiateCells(boardWidth, boardHeight)

  const fens = new Set()

  const timeStart = Date.now()

  function scanRecursively (parentCellsContainer, positions, row) {
    positions = positions || []
    row = row || 0

    const currentCells = positions.length
      ? parentCellsContainer.cells.filter(c => c.y === row)
      : parentCellsContainer.cells.slice(begin, end)

    for (const { index } of currentCells) {
      runInSandbox(parentCellsContainer, newCellsContainer => {
        const cell = cells[index]
        cell.mark()
        positions.push({ x: cell.x, y: cell.y })

        if (positions.length === 1) {
          console.log('[!] Current start position:', `${'ABCDEFGH'[positions[0].x]}${positions[0].y + 1}`)
        }

        if (positions.length === 8) {
          const positionsCopy = [...positions]
          positionsCopy.sort((a, b) => b.y - a.y)
          const fen = positionsCopy.map(p => `${p.x || ''}Q${(boardWidth - p.x - 1) || ''}`).join('/') + ' w - - 0 1'

          if (!fens.has(fen)) {
            fens.add(fen)

            console.log(positionsCopy.map(p => `${'ABCDEFGH'[p.x]}${p.y + 1}`).join(' '))
            console.log(fen)
            console.log(`[!] Found ${fens.size} solution(s) in ${Date.now() - timeStart} ms`)

            let preview = ''
            for (const pos of [...positions].reverse()) {
              preview += '-'.repeat(pos.x) + 'o' + '-'.repeat(7 - pos.x) + '\n'
            }
            console.log(preview)
          }
        } else {
          runInSandbox(newCellsContainer, nextCellsContainer => scanRecursively(nextCellsContainer, positions, row + 1))
        }

        positions.pop()
      })
    }
  }

  runInSandbox({ board: [...Array(boardSize)], cells }, initialCells => scanRecursively(initialCells))

  return fens
}

if (typeof onmessage !== 'undefined') {
  // eslint-disable-next-line
  onmessage = function (e) {
    const [boardWidth, boardHeight, begin, end] = e.data || []

    const fens = runScanner({ boardWidth, boardHeight, begin, end })

    // eslint-disable-next-line
    postMessage([...fens])
  }
} else {
  runScanner()
}
