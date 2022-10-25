import { render, screen } from '@testing-library/react'
import Output from '../src/pages/index'
import '@testing-library/jest-dom'

describe('Index page', () => {
  it('Checks if status text is rendered on page', async () => {
    render(<Output />)
    const found = await screen.findByText('Status')

    console.log(found)
    expect(found).toBeInTheDocument()
  })
})