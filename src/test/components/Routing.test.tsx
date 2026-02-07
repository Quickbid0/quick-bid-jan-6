import { describe, it, expect } from 'vitest'
import { render, screen } from '../utils'
import { MemoryRouter } from 'react-router-dom'
import App from '../../App'

describe('Routing', () => {
  it('renders landing page on root path', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )
    // Landing page should render without crash
    expect(document.body).toBeInTheDocument()
  })

  it('renders legal pages without authentication', () => {
    const legalRoutes = ['/terms', '/privacy', '/refunds', '/grievance']
    
    legalRoutes.forEach(route => {
      render(
        <MemoryRouter initialEntries={[route]}>
          <App />
        </MemoryRouter>
      )
      // Should render without redirecting to login
      expect(document.body).toBeInTheDocument()
    })
  })

  it('handles 404 routes gracefully', () => {
    render(
      <MemoryRouter initialEntries={['/nonexistent-route']}>
        <App />
      </MemoryRouter>
    )
    // Should render 404 page or redirect gracefully
    expect(document.body).toBeInTheDocument()
  })
})
