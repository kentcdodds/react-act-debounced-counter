import React from 'react'

function FetchThing({url}) {
  const [state, setState] = React.useState({
    loading: false,
    error: null,
    data: null,
  })
  React.useEffect(() => {
    window
      .fetch(url)
      .then(
        r =>
          r.json().then(data => setState({loading: false, error: null, data})),
        error => setState({loading: false, error, data: null}),
      )
  }, [url])
  return (
    <div>
      <div>Loading: {String(state.loading)}</div>
      <div>Error: {String(Boolean(state.error))}</div>
      <div>Data: {String(Boolean(state.data))}</div>
    </div>
  )
}

export default FetchThing
