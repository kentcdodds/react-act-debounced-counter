import React from 'react'
import ReactDOM from 'react-dom'
import {act} from 'react-dom/test-utils'
import {render, fireEvent, waitForDomChange} from '@testing-library/react'

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

beforeAll(() => {
  jest.spyOn(console, 'info').mockImplementation(() => {})
})

afterAll(() => {
  console.info.mockRestore()
})

afterEach(() => {
  console.info.mockClear()
})

// I'd really like to see if there's a way we can make it so people using
// React Testing Library utilities very rarely need to use `act`
// And after further investigation, it does work! woo!
test('increments count after 300ms', async () => {
  const {getByText} = render(<DebouncedCounter />)
  const count = getByText('0')
  const button = getByText(/click me/i)
  // fireEvent.click is wrapped in a sync `act` call:
  // https://github.com/testing-library/react-testing-library/blob/929748f092013b4045f65866edea5df9680f1f3a/src/index.js#L108-L110
  fireEvent.click(button)

  // waitForDomChange is wrapped in an async `act` call:
  // It's a little complicated, but RTL configures DTL with the following "asyncWrapper" (built specifically for async act):
  // https://github.com/testing-library/react-testing-library/blob/929748f092013b4045f65866edea5df9680f1f3a/src/index.js#L14-L16
  // then DTL runs the `waitForElement` code within the async wrapper. Hence, this is wrapped in an async act.
  // https://github.com/testing-library/dom-testing-library/blob/d719edd658ce6ad616f2632f378b3a7f4bf03897/src/wait-for-element.js#L65
  await waitForDomChange(() => expect(count).toHaveTextContent('1'))

  expect(console.info).toHaveBeenCalledTimes(2)
  expect(console.info).toHaveBeenNthCalledWith(1, 0)
  expect(console.info).toHaveBeenNthCalledWith(2, 1)
})

// I understand that if people are using jest's fake timers feature they'll have
// to wrap their code in `act` manually. I'm not sure how we can help that.
// In particular, for this code, I would recommend fake timers because nobody
// wants their test waiting for the 300ms
test('increments count with fake timers', () => {
  const {getByText} = render(<DebouncedCounter />)
  const count = getByText('0')
  const button = getByText(/click me/i)
  jest.useFakeTimers()
  fireEvent.click(button)
  act(() => jest.runAllTimers())
  jest.useRealTimers()
  expect(count).toHaveTextContent('1')
  expect(console.info).toHaveBeenCalledTimes(2)
  expect(console.info).toHaveBeenNthCalledWith(1, 0)
  expect(console.info).toHaveBeenNthCalledWith(2, 1)
})

describe('react by itself', () => {
  let container
  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('hopefully works', () => {
    act(() => {
      ReactDOM.render(<DebouncedCounter />, container)
    })

    const button = container.querySelector('button')
    const count = Array.from(container.querySelectorAll('div')).find(
      n => n.innerHTML === '0',
    )

    jest.useFakeTimers()
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      button: 0,
    })
    act(() => {
      button.dispatchEvent(clickEvent)
      jest.runAllTimers()
    })
    jest.useRealTimers()
    expect(count.textContent).toBe('1')
    expect(console.info).toHaveBeenCalledTimes(2)
    expect(console.info).toHaveBeenNthCalledWith(1, 0)
    expect(console.info).toHaveBeenNthCalledWith(2, 1)
  })
})
