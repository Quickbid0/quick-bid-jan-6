import { describe, it, expect } from 'vitest'
import { render, screen } from '../utils'
import Terms from '../../pages/Terms'
import Privacy from '../../pages/Privacy'
import Refunds from '../../pages/Refunds'
import GrievanceOfficer from '../../pages/GrievanceOfficer'

describe('Legal Pages', () => {
  describe('Terms Page', () => {
    it('renders without crashing', () => {
      render(<Terms />)
      expect(screen.getByText('Terms & Conditions')).toBeInTheDocument()
    })

    it('displays acceptance of terms section', () => {
      render(<Terms />)
      expect(screen.getByText('1. Acceptance of Terms')).toBeInTheDocument()
    })

    it('has navigation links', () => {
      render(<Terms />)
      expect(screen.getByText('View Privacy Policy')).toBeInTheDocument()
    })
  })

  describe('Privacy Policy Page', () => {
    it('renders without crashing', () => {
      render(<Privacy />)
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
    })

    it('displays information collection section', () => {
      render(<Privacy />)
      expect(screen.getByText('1. Information We Collect')).toBeInTheDocument()
    })
  })

  describe('Refund Policy Page', () => {
    it('renders without crashing', () => {
      render(<Refunds />)
      expect(screen.getByText('Refund Policy')).toBeInTheDocument()
    })

    it('displays refund eligibility section', () => {
      render(<Refunds />)
      expect(screen.getByText('1. Refund Eligibility')).toBeInTheDocument()
    })
  })

  describe('Grievance Officer Page', () => {
    it('renders without crashing', () => {
      render(<GrievanceOfficer />)
      expect(screen.getByText('Grievance Officer')).toBeInTheDocument()
    })

    it('displays nodal officer details', () => {
      render(<GrievanceOfficer />)
      expect(screen.getByText('Nodal Officer Details')).toBeInTheDocument()
    })
  })
})
