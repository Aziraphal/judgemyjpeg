import { render, screen } from '@testing-library/react'
import Footer from '../Footer'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'fr',
  }),
}))

describe('Footer Component', () => {
  it('renders without crashing', () => {
    render(<Footer />)
    expect(screen.getByText(/judgemyjpeg/i)).toBeInTheDocument()
  })

  it('contains copyright information', () => {
    render(<Footer />)
    expect(screen.getByText(/codecraft plus/i)).toBeInTheDocument()
  })
})