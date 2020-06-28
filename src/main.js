/* global Worker */

window.onload = () => {
  const worker = new Worker('./scan-bundle.js')

  worker.postMessage([])
  worker.onmessage = e => {
    const fens = e.data
    document.getElementById('calculating').remove()
    const solutions = document.getElementById('solutions');

    ([...fens]).forEach(fen => {
      const a = document.createElement('a')
      a.href = 'https://lichess.org/editor/' + fen.split(' ').join('_')
      a.innerText = fen
      a.target = '_blank'

      const li = document.createElement('li')
      li.appendChild(a)

      solutions.appendChild(li)
    })
  }
}
