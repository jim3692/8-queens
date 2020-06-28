function runInSandbox ({ board: parentBoard, cells: parentCells }, cb) {
  const currentBoard = [...parentBoard]

  const currentCells = parentCells.filter(cell => !cell.value).map(cell => {
    cell.subscription && cell.subscription.unsubscribe()

    cell.subscription = cell.subject.subscribe(v => {
      if (!currentBoard[cell.index]) {
        currentBoard[cell.index] = v
      }
    })

    Object.defineProperty(cell, 'value', {
      get: () => currentBoard[cell.index],
      configurable: true
    })

    return cell
  })

  const restoreSubscribers = () => parentCells.map(cell => {
    cell.subscription && cell.subscription.unsubscribe()

    cell.subscription = cell.subject.subscribe(v => {
      if (!parentBoard[cell.index]) {
        parentBoard[cell.index] = v
      }
    })

    Object.defineProperty(cell, 'value', {
      get: () => parentBoard[cell.index],
      configurable: true
    })

    return cell
  })

  const currentCellsContainer = { board: currentBoard, cells: currentCells }

  cb(currentCellsContainer)
  restoreSubscribers()
}

module.exports = runInSandbox
