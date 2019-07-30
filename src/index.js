import React from 'react'
import ReactDOM from 'react-dom'
import DebouncedCounter from './debounced-counter'

function App() {
  return <DebouncedCounter />
}

ReactDOM.render(<App />, document.getElementById('root'))
