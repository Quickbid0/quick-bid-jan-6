import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '../utils'
import Footer from '../../components/Footer'

describe('Footer Component', () => {
  it('renders without crashing', () => {
    render(<Footer />)
    expect(screen.getByText('Quick Mela')).toBeInTheDocument()
  })

  it('displays branding and description', () => {
    render(<Footer />)
    expect(screen.getByText('Your trusted platform for online bidding and auctions.')).toBeInTheDocument()
  })

  it('renders all legal page links', () => {
    render(<Footer />)
    
    expect(screen.getByText('Terms of Service')).toBeInTheDocument()
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
    expect(screen.getByText('Refund Policy')).toBeInTheDocument()
    expect(screen.getByText('Grievance Officer')).toBeInTheDocument()
  })

  it('legal links have correct href attributes', () => {
    render(<Footer />)
    
    const termsLink = screen.getByText('Terms of Service').closest('a')
    const privacyLink = screen.getByText('Privacy Policy').closest('a')
    const refundsLink = screen.getByText('Refund Policy').closest('a')
    const grievanceLink = screen.getByText('Grievance Officer').closest('a')
    
    expect(termsLink).toHaveAttribute('href', '/terms')
    expect(privacyLink).toHaveAttribute('href', '/privacy')
    expect(refundsLink).toHaveAttribute('href', '/refunds')
    expect(grievanceLink).toHaveAttribute('href', '/grievance')
  })

  it('renders social media links', () => {
    render(<Footer />)
    
    const facebookLink = screen.getByRole('link', { name: /facebook/i })
    const twitterLink = screen.getByRole('link', { name: /twitter/i })
    const instagramLink = screen.getByRole('link', { name: /instagram/i })
    
    expect(facebookLink).toHaveAttribute('href', 'https://facebook.com')
    expect(twitterLink).toHaveAttribute('href', 'https://twitter.com')
    expect(instagramLink).toHaveAttribute('href', 'https://instagram.com')
  })

  it('renders quick links section', () => {
    render(<Footer />)
    
    expect(screen.getByText('Quick Links')).toBeInTheDocument()
    expect(screen.getByText('Product Catalog')).toBeInTheDocument()
    expect(screen.getByText('Advanced Search')).toBeInTheDocument()
  })
})
