import React from 'react'

function debounce(fn, time) {
  let id
  return () => {
    clearTimeout(id)
    id = setTimeout(() => {
      fn()
    }, time)
  }
}

function DebouncedCounter() {
  const [count, setCount] = React.useState(0)
  const debouncedIncrement = debounce(() => setCount(c => c + 1), 300)
  React.useEffect(() => {
    console.info(count)
  }, [count])
  return (
    <div>
      <div>{count}</div>
      <button onClick={debouncedIncrement}>click me</button>
    </div>
  )
}

export default DebouncedCounter
