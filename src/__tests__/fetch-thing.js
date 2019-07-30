import React from 'react'
import {render} from '@testing-library/react'

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

beforeAll(() => {
  jest.spyOn(window, 'fetch').mockImplementation(() => {
    throw new Error('fetch should be mocked')
  })
})

afterAll(() => {
  window.fetch.mockRestore()
})

afterEach(() => {
  window.fetch.mockClear()
})

test('no act needed', async () => {
  window.fetch.mockResolvedValueOnce({json: async () => ({foo: 'bar'})})
  const url = 'https://api.example.com/foo'
  // render is wrapped in `act`
  const {findByText} = render(<FetchThing url={url} />)

  // findByText leaverages waitForDomChange under the hood which is wrapped in an async act.
  await findByText(/data: true/i)
  expect(window.fetch).toHaveBeenCalledTimes(1)
  expect(window.fetch).toHaveBeenCalledWith(url)
})
