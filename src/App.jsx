import { useState, useEffect, useCallback } from 'react'
import './App.css'

const GRID_SIZE = 4
const WINNING_SCORE = 2048

function generateInitialGrid() {
  const grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0))
  return addRandomTile(addRandomTile(grid))
}

function addRandomTile(grid) {
  const emptyTiles = []
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (grid[i][j] === 0) emptyTiles.push({ i, j })
    }
  }
  if (emptyTiles.length === 0) return grid

  const { i, j } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)]
  grid[i][j] = Math.random() < 0.9 ? 2 : 4
  return grid
}

function moveGrid(grid, direction) {
  const newGrid = JSON.parse(JSON.stringify(grid))
  let moved = false

  const move = (row) => {
    const filteredRow = row.filter((tile) => tile !== 0)
    for (let i = 0; i < filteredRow.length - 1; i++) {
      if (filteredRow[i] === filteredRow[i + 1]) {
        filteredRow[i] *= 2
        filteredRow[i + 1] = 0
        moved = true
      }
    }
    const newRow = filteredRow.filter((tile) => tile !== 0)
    return newRow.concat(Array(GRID_SIZE - newRow.length).fill(0))
  }

  if (direction === 'left' || direction === 'right') {
    for (let i = 0; i < GRID_SIZE; i++) {
      const row = newGrid[i]
      const newRow = direction === 'left' ? move(row) : move(row.reverse()).reverse()
      if (JSON.stringify(newGrid[i]) !== JSON.stringify(newRow)) moved = true
      newGrid[i] = newRow
    }
  } else {
    for (let j = 0; j < GRID_SIZE; j++) {
      const column = newGrid.map((row) => row[j])
      const newColumn = direction === 'up' ? move(column) : move(column.reverse()).reverse()
      if (JSON.stringify(column) !== JSON.stringify(newColumn)) moved = true
      for (let i = 0; i < GRID_SIZE; i++) {
        newGrid[i][j] = newColumn[i]
      }
    }
  }

  return moved ? addRandomTile(newGrid) : newGrid
}

function App() {
  const [grid, setGrid] = useState(generateInitialGrid)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)

  const handleMove = useCallback((direction) => {
    if (gameOver) return

    const newGrid = moveGrid(grid, direction)
    if (JSON.stringify(newGrid) !== JSON.stringify(grid)) {
      setGrid(newGrid)
      setScore(calculateScore(newGrid))
    }
  }, [grid, gameOver])

  const handleKeyDown = useCallback((event) => {
    const keyDirections = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
    }

    const direction = keyDirections[event.key]
    if (direction) {
      handleMove(direction)
    }
  }, [handleMove])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    if (isGameOver(grid)) {
      setGameOver(true)
    }
  }, [grid])

  function calculateScore(grid) {
    return grid.flat().reduce((sum, tile) => sum + tile, 0)
  }

  function isGameOver(grid) {
    if (grid.flat().includes(WINNING_SCORE)) return true
    if (grid.flat().includes(0)) return false
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (
          (i < GRID_SIZE - 1 && grid[i][j] === grid[i + 1][j]) ||
          (j < GRID_SIZE - 1 && grid[i][j] === grid[i][j + 1])
        ) {
          return false
        }
      }
    }
    return true
  }

  function resetGame() {
    setGrid(generateInitialGrid())
    setGameOver(false)
    setScore(0)
  }

  return (
    <div className="game-container">
      <h1>2048 Game</h1>
      <div className="score">Score: {score}</div>
      <div className="grid">
        {grid.map((row, i) =>
          row.map((tile, j) => (
            <div key={`${i}-${j}`} className={`tile tile-${tile}`}>
              {tile !== 0 && tile}
            </div>
          ))
        )}
      </div>
      <div className="direction-buttons">
        <button onClick={() => handleMove('up')}>↑</button>
        <button onClick={() => handleMove('left')}>←</button>
        <button onClick={() => handleMove('down')}>↓</button>
        <button onClick={() => handleMove('right')}>→</button>
      </div>
      {gameOver && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <button onClick={resetGame}>Play Again</button>
        </div>
      )}
    </div>
  )
}

export default App
