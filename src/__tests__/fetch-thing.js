import React from 'react'
import {render} from '@testing-library/react'
import FetchThing from '../fetch-thing'

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
  const {findByText} = render(<FetchThing url={url} />)
  await findByText(/data: true/i)
  expect(window.fetch).toHaveBeenCalledTimes(1)
  expect(window.fetch).toHaveBeenCalledWith(url)
})
