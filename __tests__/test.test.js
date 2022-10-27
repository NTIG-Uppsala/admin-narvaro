import { render, screen } from '@testing-library/react'
import Output from '../src/pages/index'
import '@testing-library/jest-dom'

// https://lightrun.com/answers/prisma-prisma-jest-27-errors-with-referenceerror-setimmediate-is-not-defined
global.setImmediate = global.setImmediate || ((fn, ...args) => global.setTimeout(fn, 0, ...args));

describe('Index page', () => {
  it('Checks if status text is rendered on page', async () => {
    render(<Output />)
    const found = await screen.findByText('Status')
    expect(found).toBeInTheDocument()
  })
})