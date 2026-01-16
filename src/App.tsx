import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from './context/SessionContext';

// Layout Components
import GlobalLayout from './components/layout/GlobalLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { RouteErrorBoundary } from './components/error/RouteErrorBoundary';
import CookieConsent from './components/CookieConsent';
import RoleGuard from './components/RoleGuard';
import SalesProtectedRoute from './components/SalesProtectedRoute';

// Public Pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const About = lazy(() => import('./pages/About'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const FAQ = lazy(() => import('./pages/FAQ'));
const NotFound = lazy(() => import('./pages/NotFound'));
const DemoLogin = lazy(() => import('./pages/DemoLogin'));

// Additional Pages
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Shipping = lazy(() => import('./pages/Shipping'));
const Refunds = lazy(() => import('./pages/Refunds'));
const Help = lazy(() => import('./pages/Help'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));
const Notifications = lazy(() => import('./pages/Notifications'));
const SeizedVehicles = lazy(() => import('./pages/SeizedVehicles'));
const VehicleDetail = lazy(() => import('./pages/VehicleDetail'));
const CampaignsPage = lazy(() => import('./pages/CampaignsPage'));
const SalesPage = lazy(() => import('./pages/SalesPage'));
const MarketingPage = lazy(() => import('./pages/MarketingPage'));
const SalesLogin = lazy(() => import('./pages/SalesLogin'));
const SalesDashboardPage = lazy(() => import('./pages/SalesDashboardPage'));
const CampaignCreatePage = lazy(() => import('./pages/CampaignCreatePage'));
const CampaignLaunchPage = lazy(() => import('./pages/CampaignLaunchPage'));
const SupportSales = lazy(() => import('./pages/SupportSales'));

// Protected User Pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products') as Promise<{ default: React.ComponentType<any> }>);
const WalletPage = lazy(() => import('./pages/WalletPage'));
const WatchlistPage = lazy(() => import('./pages/WatchlistPage'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const MyWins = lazy(() => import('./pages/MyWins'));
const MyWonAuctions = lazy(() => import('./pages/MyWonAuctions'));
const DeliveryPreferences = lazy(() => import('./pages/DeliveryPreferences'));
const WinInvoice = lazy(() => import('./pages/WinInvoice'));
const MyIssueDetail = lazy(() => import('./pages/MyIssueDetail'));
const MyInspections = lazy(() => import('./pages/MyInspections'));
const AddProduct = lazy(() => import('./pages/AddProduct'));
const AuctionPreview = lazy(() => import('./pages/AuctionPreview'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const VerifySeller = lazy(() => import('./pages/VerifySeller'));
const SellerAnalytics = lazy(() => import('./pages/SellerAnalytics'));
const SellerDashboard = lazy(() => import('./pages/SellerDashboard'));
const SellerMembership = lazy(() => import('./pages/SellerMembership'));
const BuyerDashboard = lazy(() => import('./pages/BuyerDashboard').then(m => ({ default: m.BuyerDashboard })));
const WinnerConfirmation = lazy(() => import('./pages/WinnerConfirmation'));
const PayForWin = lazy(() => import('./pages/PayForWin'));
const InspectionReport = lazy(() => import('./pages/InspectionReport'));
const ShareVerificationBadge = lazy(() => import('./pages/ShareVerificationBadge'));
const LoanApplyPage = lazy(() => import('./pages/finance/LoanApplyPage'));
const ApplicationStatusPage = lazy(() => import('./pages/finance/ApplicationStatusPage'));
const InsuranceApplyPage = lazy(() => import('./pages/finance/InsuranceApplyPage'));
const InsuranceStatusPage = lazy(() => import('./pages/finance/InsuranceStatusPage'));
const InsuranceDashboard = lazy(() => import('./pages/finance/InsuranceDashboard'));
const InsuranceClaimPage = lazy(() => import('./pages/finance/InsuranceClaimPage'));

// Company Pages
const CompanyDashboard = lazy(() => import('./pages/CompanyDashboard'));
const BulkUpload = lazy(() => import('./pages/BulkUpload'));
const CompanyRegistration = lazy(() => import('./pages/CompanyRegistration'));
const CompanyVerificationPending = lazy(() => import('./pages/CompanyVerificationPending'));
const LiveStreamControl = lazy(() => import('./pages/LiveStreamControl'));
const AIModelTraining = lazy(() => import('./pages/AIModelTraining'));
const ComplianceTracking = lazy(() => import('./pages/ComplianceTracking'));

// Creative & AI Pages
const CreativeVerification = lazy(() => import('./pages/CreativeVerification'));
const AIRecommendations = lazy(() => import('./pages/AIRecommendations'));
const AIDashboard = lazy(() => import('./pages/AIDashboard'));
const SellerProfile = lazy(() => import('./pages/SellerProfile'));

// Auction Type Pages
const TimedAuctionPage = lazy(() => import('./pages/TimedAuctionPage'));
const TenderAuctionPage = lazy(() => import('./pages/TenderAuctionPage'));
// Explicitly resolve to the TypeScript implementation to avoid using the legacy JSX mock
const LiveAuctionPage = lazy(() => import('./pages/LiveAuctionPage.tsx'));
const LiveBidding = lazy(() => import('./pages/LiveBidding'));
const AuctionCalendar = lazy(() => import('./pages/AuctionCalendar'));
const ProductCatalog = lazy(() => import('./pages/ProductCatalog'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const AdvancedSearch = lazy(() => import('./pages/AdvancedSearch'));
const BiddingHistory = lazy(() => import('./pages/BiddingHistory'));
const SellerCenter = lazy(() => import('./pages/SellerCenter'));
const TrustSafety = lazy(() => import('./pages/TrustSafety'));
const BusinessSolutions = lazy(() => import('./pages/BusinessSolutions'));
const SupportTickets = lazy(() => import('./pages/SupportTickets'));
const SupportTicketDetail = lazy(() => import('./pages/SupportTicketDetail'));

// Admin Pages
const AdminSalesDashboard = lazy(() => import('./pages/admin/AdminSalesDashboard'));
const AdminSalesLeads = lazy(() => import('./pages/admin/AdminSalesLeads'));
const AdminBanners = lazy(() => import('./pages/admin/AdminBanners'));
const AdminSupportChat = lazy(() => import('./pages/admin/AdminSupportChat'));
const ReferralBonuses = lazy(() => import('./pages/admin/ReferralBonuses'));
const AdminFinanceLeads = lazy(() => import('./pages/admin/AdminFinanceLeads'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const ProductVerification = lazy(() => import('./pages/admin/ProductVerification'));
const AdminProductsList = lazy(() => import('./pages/admin/AdminProductsList'));
const AdminProductDetail = lazy(() => import('./pages/admin/AdminProductDetail'));
const AdminEventsList = lazy(() => import('./pages/admin/AdminEventsList'));
const AdminEventCreate = lazy(() => import('./pages/admin/AdminEventCreate'));
const AdminEventDetail = lazy(() => import('./pages/admin/AdminEventDetail'));
const SystemSettings = lazy(() => import('./pages/admin/SystemSettings'));
const LiveStreamSetup = lazy(() => import('./pages/admin/LiveStreamSetup'));
const LiveWebcastSetup = lazy(() => import('./pages/admin/LiveWebcastSetup'));
const ContentModeration = lazy(() => import('./pages/admin/ContentModeration'));
const AnalyticsDashboard = lazy(() => import('./pages/admin/AnalyticsDashboard'));
const InvestorAdmin = lazy(() => import('./pages/admin/InvestorAdmin'));
const AdminKYCReview = lazy(() => import('./pages/admin/AdminKYCReview'));
const AdminFraudReview = lazy(() => import('./pages/admin/AdminFraudReview'));
const AdminLocations = lazy(() => import('./pages/admin/AdminLocations'));
const AdminYardTokens = lazy(() => import('./pages/admin/AdminYardTokens'));
import AIReports from './pages/admin/AIReports';
const AdminTicketDesk = lazy(() => import('./pages/admin/TicketDesk'));
const AdminDeliveries = lazy(() => import('./pages/admin/AdminDeliveries'));
const MarketAnalytics = lazy(() => import('./pages/MarketAnalytics'));
const PaymentGateway = lazy(() => import('./pages/PaymentGateway'));
const MobileApp = lazy(() => import('./pages/MobileApp'));

// Missing Admin Pages
const CategoryManagement = lazy(() => import('./pages/admin/CategoryManagement'));
const AdminRolesPermissions = lazy(() => import('./pages/admin/AdminRolesPermissions'));
const PermissionsMatrix = lazy(() => import('./pages/admin/PermissionsMatrix'));
const AdminTasks = lazy(() => import('./pages/admin/AdminTasks'));
const APIDocumentation = lazy(() => import('./pages/APIDocumentation'));
const Careers = lazy(() => import('./pages/Careers'));
const Partnerships = lazy(() => import('./pages/Partnerships'));
const InvestorRelations = lazy(() => import('./pages/InvestorRelations'));
const InvestorMarketplace = lazy(() => import('./pages/InvestorMarketplace'));
const SecurityCenter = lazy(() => import('./pages/SecurityCenter'));
const ReportsAnalytics = lazy(() => import('./pages/ReportsAnalytics'));
import GrievanceOfficer from './pages/GrievanceOfficer';
const InvestorPitch = lazy(() => import('./pages/InvestorPitch'));
const CatalogSettings = lazy(() => import('./pages/admin/CatalogSettings'));
const AdminFees = lazy(() => import('./pages/admin/AdminFees'));
const AdminAlertsTest = lazy(() => import('./pages/admin/AdminAlertsTest'));
const NotificationSettings = lazy(() => import('./pages/NotificationSettings'));
const CampaignLanding = lazy(() => import('./pages/CampaignLanding'));
const SocialLinks = lazy(() => import('./pages/SocialLinks'));
const AdminMarketing = lazy(() => import('./pages/admin/AdminMarketing'));
const AdminCampaigns = lazy(() => import('./pages/admin/AdminCampaigns'));
const AdminInvestments = lazy(() => import('./pages/admin/AdminInvestments'));

// Public Events Page
const EventsPage = lazy(() => import('./pages/EventsPage'));

// Investor Program Pages
const InvestLanding = lazy(() => import('./pages/InvestLanding'));
const InvestApply = lazy(() => import('./pages/InvestApply'));
const InvestConfirm = lazy(() => import('./pages/InvestConfirm'));
const InvestorDashboard = lazy(() => import('./pages/InvestorDashboard'));
const MonitoringDashboard = lazy(() => import('./pages/MonitoringDashboard'));

// Super Admin Pages
const SuperAdmin = lazy(() => import('./pages/SuperAdmin'));
const VerifyEmployee = lazy(() => import('./pages/VerifyEmployee'));
const QRScanner = lazy(() => import('./pages/QRScanner'));
const AdminEmployees = lazy(() => import('./pages/admin/AdminEmployees'));
const AdminDepositPolicies = lazy(() => import('./pages/admin/AdminDepositPolicies'));
const PhoneVerification = lazy(() => import('./pages/PhoneVerification'));
const Verification = lazy(() => import('./pages/Verification'));
const TokenCheckout = lazy(() => import('./pages/TokenCheckout'));
const DepositCheckout = lazy(() => import('./pages/DepositCheckout'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PaymentFailed = lazy(() => import('./pages/PaymentFailed'));
const VisitBooking = lazy(() => import('./pages/VisitBooking'));
const AdminWinners = lazy(() => import('./pages/admin/AdminWinners'));
const AdminSellerEarnings = lazy(() => import('./pages/admin/AdminSellerEarnings'));
const AdminWinPayments = lazy(() => import('./pages/admin/AdminWinPayments'));
const AdminSellerPayouts = lazy(() => import('./pages/admin/AdminSellerPayouts'));
const AdminPayouts = lazy(() => import('./pages/admin/AdminPayouts'));
const AdminDeliverySlip = lazy(() => import('./pages/admin/AdminDeliverySlip'));
const AdminDepartments = lazy(() => import('./pages/admin/AdminDepartments'));
const AdminBranches = lazy(() => import('./pages/admin/AdminBranches'));
const AdminStaff = lazy(() => import('./pages/admin/AdminStaff'));
const InspectorInspectionsList = lazy(() => import('./pages/inspector/InspectionsList'));
const InspectorInspectionReview = lazy(() => import('./pages/inspector/InspectionReview'));

// Legal Pages
const LegalIndex = lazy(() => import('./pages/legal/LegalIndex'));
const LegalTermsAndConditions = lazy(() => import('./pages/legal/TermsAndConditions'));
const LegalPrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const LegalEContractDigitalAgreementPolicy = lazy(() => import('./pages/legal/EContractDigitalAgreementPolicy'));
const LegalAuctionRulesBiddingPolicy = lazy(() => import('./pages/legal/AuctionRulesBiddingPolicy'));
const LegalAntiFraudShillBiddingPolicy = lazy(() => import('./pages/legal/AntiFraudShillBiddingPolicy'));
const LegalSellerPolicy = lazy(() => import('./pages/legal/SellerPolicy'));
const LegalBuyerPolicy = lazy(() => import('./pages/legal/BuyerPolicy'));
const LegalRefundCancellationDisputePolicy = lazy(() => import('./pages/legal/RefundCancellationDisputePolicy'));
const LegalWalletDepositInvestmentPolicy = lazy(() => import('./pages/legal/WalletDepositInvestmentPolicy'));
const LegalSARFAESICompliancePolicy = lazy(() => import('./pages/legal/SARFAESICompliancePolicy'));
const LegalIntellectualPropertyPolicy = lazy(() => import('./pages/legal/IntellectualPropertyPolicy'));
const LegalVendorBankPartnerAgreement = lazy(() => import('./pages/legal/VendorBankPartnerAgreement'));
const LegalBankNBFCMOU = lazy(() => import('./pages/legal/BankNBFCMOU'));
const LegalVendorServiceLevelAgreement = lazy(() => import('./pages/legal/VendorServiceLevelAgreement'));
const LegalRecoveryAgencyAgreement = lazy(() => import('./pages/legal/RecoveryAgencyAgreement'));
const LegalCommissionRateSheet = lazy(() => import('./pages/legal/CommissionRateSheet'));
const LegalWhiteLabelPartnerAgreement = lazy(() => import('./pages/legal/WhiteLabelPartnerAgreement'));
const LegalBankNBFCOnboardingSOP = lazy(() => import('./pages/legal/BankNBFCOnboardingSOP'));
const LegalInvestorPolicy = lazy(() => import('./pages/legal/InvestorPolicy'));
const LegalBrandingPolicy = lazy(() => import('./pages/legal/BrandingPolicy'));
const LegalManualsSOPs = lazy(() => import('./pages/legal/ManualsSOPs'));
const LegalPlatformUsageAcceptancePolicy = lazy(() => import('./pages/legal/PlatformUsageAcceptancePolicy'));
const LegalTransportPartnerAgreement = lazy(() => import('./pages/legal/TransportPartnerAgreement'));
const LegalVendorRegistrationApprovalPolicy = lazy(
  () => import('./pages/legal/VendorRegistrationApprovalPolicy'),
);
const LegalAntiReverseEngineeringTamperingApplicationSecurityProtectionPolicy = lazy(
  () => import('./pages/legal/AntiReverseEngineeringTamperingApplicationSecurityProtectionPolicy'),
);
const LegalIncidentResponseBreachHandlingCybersecurityCrisisManagementPolicy = lazy(
  () => import('./pages/legal/IncidentResponseBreachHandlingCybersecurityCrisisManagementPolicy'),
);
const LegalAuditLogsMonitoringEvidencePreservationAdminAccountabilityPolicy = lazy(
  () => import('./pages/legal/AuditLogsMonitoringEvidencePreservationAdminAccountabilityPolicy'),
);
const LegalCrossBorderTradeImportExportCustomsComplianceInternationalSellerBuyerPolicy = lazy(
  () => import('./pages/legal/CrossBorderTradeImportExportCustomsComplianceInternationalSellerBuyerPolicy'),
);
const LegalDisputeResolutionComplaintHandlingArbitrationFairPracticePolicy = lazy(
  () => import('./pages/legal/DisputeResolutionComplaintHandlingArbitrationFairPracticePolicy'),
);
const LegalEmergencyResponseSafetyIncidentsLawEnforcementCrisisManagementPolicy = lazy(
  () => import('./pages/legal/EmergencyResponseSafetyIncidentsLawEnforcementCrisisManagementPolicy'),
);
const LegalDataProtectionPrivacyGovernancePersonalDataHandlingDPDPCompliancePolicy = lazy(
  () => import('./pages/legal/DataProtectionPrivacyGovernancePersonalDataHandlingDPDPCompliancePolicy'),
);
const LegalDataAccuracyIntegrityAssuranceErrorPreventionCorrectionPolicy = lazy(
  () => import('./pages/legal/DataAccuracyIntegrityAssuranceErrorPreventionCorrectionPolicy'),
);
const LegalMarketingAdvertisingPromotionEthicsBrandCommunicationPolicy = lazy(
  () => import('./pages/legal/MarketingAdvertisingPromotionEthicsBrandCommunicationPolicy'),
);
const LegalVendorPartnerServiceProviderOnboardingCompliancePolicy = lazy(
  () => import('./pages/legal/VendorPartnerServiceProviderOnboardingCompliancePolicy'),
);
const LegalUserGrievanceRedressalComplaintEscalationNodalOfficerCompliancePolicy = lazy(
  () => import('./pages/legal/UserGrievanceRedressalComplaintEscalationNodalOfficerCompliancePolicy'),
);
const LegalEthicalConductIntegrityAntiCorruptionProfessionalBehaviourCodeOfConductPolicy = lazy(
  () => import('./pages/legal/EthicalConductIntegrityAntiCorruptionProfessionalBehaviourCodeOfConductPolicy'),
);
const LegalPlatformModerationContentReviewListingApprovalTakedownPolicy = lazy(
  () => import('./pages/legal/PlatformModerationContentReviewListingApprovalTakedownPolicy'),
);
const LegalSecurityAuthenticationPasswordProtectionAccessControlEncryptionPolicy = lazy(
  () => import('./pages/legal/SecurityAuthenticationPasswordProtectionAccessControlEncryptionPolicy'),
);
const LegalAMLFinancialCrimesFraudPreventionCompliancePolicy = lazy(
  () => import('./pages/legal/AMLFinancialCrimesFraudPreventionCompliancePolicy'),
);
const LegalAuditLoggingMonitoringComplianceReviewRegulatoryReportingPolicy = lazy(
  () => import('./pages/legal/AuditLoggingMonitoringComplianceReviewRegulatoryReportingPolicy'),
);
const LegalAPIUsageDeveloperAccessIntegrationSecurityRateLimitingCompliancePolicy = lazy(
  () => import('./pages/legal/APIUsageDeveloperAccessIntegrationSecurityRateLimitingCompliancePolicy'),
);
const LegalBusinessContinuityDisasterRecoverySystemAvailabilityOutageCommunicationPolicy = lazy(
  () => import('./pages/legal/BusinessContinuityDisasterRecoverySystemAvailabilityOutageCommunicationPolicy'),
);
const LegalIntellectualPropertyCopyrightTrademarkBrandProtectionPolicy = lazy(
  () => import('./pages/legal/IntellectualPropertyCopyrightTrademarkBrandProtectionPolicy'),
);
const LegalAIUsageMonitoringFairnessSafetyResponsibleAutomationPolicy = lazy(
  () => import('./pages/legal/AIUsageMonitoringFairnessSafetyResponsibleAutomationPolicy'),
);
const LegalDataRetentionArchivalLifecycleManagementMigrationOffboardingPolicy = lazy(
  () => import('./pages/legal/DataRetentionArchivalLifecycleManagementMigrationOffboardingPolicy'),
);
const LegalLegalNoticeTermsUpdateUserNotificationVersioningPolicy = lazy(
  () => import('./pages/legal/LegalNoticeTermsUpdateUserNotificationVersioningPolicy'),
);
const LegalQuickMelaLegalComplianceManual = lazy(
  () => import('./pages/legal/QuickMelaLegalComplianceManual'),
);
const LegalSellerOnboardingProductApprovalVerificationCompliancePolicy = lazy(
  () => import('./pages/legal/SellerOnboardingProductApprovalVerificationCompliancePolicy'),
);
const LegalBuyerOnboardingIdentityVerificationWalletSafetyResponsibleParticipationPolicy = lazy(
  () => import('./pages/legal/BuyerOnboardingIdentityVerificationWalletSafetyResponsibleParticipationPolicy'),
);
const LegalAuctionParticipationRulesBidConductAntiManipulationPolicy = lazy(
  () => import('./pages/legal/AuctionParticipationRulesBidConductAntiManipulationPolicy'),
);
const LegalBuyerDepositEscrowHandlingRefundsPaymentCompliancePolicy = lazy(
  () => import('./pages/legal/BuyerDepositEscrowHandlingRefundsPaymentCompliancePolicy'),
);
const LegalHighRiskItemsProhibitedAssetsRestrictedListingsPolicy = lazy(
  () => import('./pages/legal/HighRiskItemsProhibitedAssetsRestrictedListingsPolicy'),
);
const LegalVehicleDocumentationConditionDisclosureAuthenticityVerificationPolicy = lazy(
  () => import('./pages/legal/VehicleDocumentationConditionDisclosureAuthenticityVerificationPolicy'),
);
const LegalInternalAccessControlRBACAdminAccountabilityAuditPolicy = lazy(
  () => import('./pages/legal/InternalAccessControlRBACAdminAccountabilityAuditPolicy'),
);
const LegalTransportYardSafetyDeliveryHandoverCompliancePolicy = lazy(
  () => import('./pages/legal/TransportYardSafetyDeliveryHandoverCompliancePolicy'),
);
const LegalAIFraudDetectionPolicy = lazy(() => import('./pages/legal/AIFraudDetectionPolicy'));
const LegalAIRiskScorePolicy = lazy(() => import('./pages/legal/AIRiskScorePolicy'));
const LegalDeviceFingerprintingPolicy = lazy(() => import('./pages/legal/DeviceFingerprintingPolicy'));
const LegalMultiAccountDetectionPolicy = lazy(() => import('./pages/legal/MultiAccountDetectionPolicy'));
const LegalLocationGPSVerificationPolicy = lazy(() => import('./pages/legal/LocationGPSVerificationPolicy'));
const LegalBehaviouralMonitoringPolicy = lazy(() => import('./pages/legal/BehaviouralMonitoringPolicy'));
const LegalIPReputationNetworkSecurityPolicy = lazy(() => import('./pages/legal/IPReputationNetworkSecurityPolicy'));
const LegalAutomatedFraudEscalationPolicy = lazy(() => import('./pages/legal/AutomatedFraudEscalationPolicy'));
const LegalAuctionIntegrityMonitoringPolicy = lazy(() => import('./pages/legal/AuctionIntegrityMonitoringPolicy'));
const LegalAMLPolicy = lazy(() => import('./pages/legal/AMLPolicy'));
const LegalAIModelOwnershipPolicy = lazy(() => import('./pages/legal/AIModelOwnershipPolicy'));
const LegalAIExplainabilityPolicy = lazy(() => import('./pages/legal/AIExplainabilityPolicy'));
const LegalAIModelTransparencyAuditPolicy = lazy(() => import('./pages/legal/AIModelTransparencyAuditPolicy'));

// Scroll to Top on Route Change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <SessionProvider>
        <ScrollToTop />
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-indigo-600 focus:text-white focus:px-3 focus:py-2 focus:rounded">Skip to main content</a>
        <Toaster position="top-center" reverseOrder={false} />
        <GlobalLayout>
          <ErrorBoundary>
            <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>}>
              <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<RouteErrorBoundary routeName="Landing"><LandingPage /></RouteErrorBoundary>} />
                  <Route path="/login" element={<RouteErrorBoundary routeName="Login"><Login /></RouteErrorBoundary>} />
                  <Route path="/register" element={<RouteErrorBoundary routeName="Register"><Register /></RouteErrorBoundary>} />
                  <Route path="/demo" element={<RouteErrorBoundary routeName="Demo Login"><DemoLogin /></RouteErrorBoundary>} />
                  <Route path="/product/:id" element={<RouteErrorBoundary routeName="Product Detail"><ProductDetail /></RouteErrorBoundary>} />
                  <Route path="/seller/:id" element={<RouteErrorBoundary routeName="Seller Profile"><SellerProfile /></RouteErrorBoundary>} />
                  <Route path="/about" element={<RouteErrorBoundary routeName="About"><About /></RouteErrorBoundary>} />
                  <Route path="/faq" element={<RouteErrorBoundary routeName="FAQ"><FAQ /></RouteErrorBoundary>} />
                  <Route path="/contactus" element={<RouteErrorBoundary routeName="Contact Us"><ContactUs /></RouteErrorBoundary>} />
                  <Route path="/terms" element={<RouteErrorBoundary routeName="Terms"><Terms /></RouteErrorBoundary>} />
                  <Route path="/privacy" element={<RouteErrorBoundary routeName="Privacy"><Privacy /></RouteErrorBoundary>} />
                  <Route path="/shipping" element={<RouteErrorBoundary routeName="Shipping"><Shipping /></RouteErrorBoundary>} />
                  <Route path="/refunds" element={<RouteErrorBoundary routeName="Refunds"><Refunds /></RouteErrorBoundary>} />
                  <Route path="/grievance-officer" element={<RouteErrorBoundary routeName="Grievance Officer"><GrievanceOfficer /></RouteErrorBoundary>} />
                  <Route path="/help" element={<RouteErrorBoundary routeName="Help"><Help /></RouteErrorBoundary>} />
                  <Route path="/campaigns" element={<RouteErrorBoundary routeName="Campaigns"><CampaignsPage /></RouteErrorBoundary>} />
                  <Route path="/campaigns/new" element={<RouteErrorBoundary routeName="Campaign Create"><CampaignCreatePage /></RouteErrorBoundary>} />
                  <Route path="/campaigns/launch" element={<RouteErrorBoundary routeName="Campaign Launch"><CampaignLaunchPage /></RouteErrorBoundary>} />
                  <Route path="/sales" element={<RouteErrorBoundary routeName="Sales"><SalesPage /></RouteErrorBoundary>} />
                  <Route path="/sales/login" element={<RouteErrorBoundary routeName="Sales Login"><SalesLogin /></RouteErrorBoundary>} />
                  <Route path="/sales/dashboard" element={<RouteErrorBoundary routeName="Sales Dashboard"><SalesProtectedRoute><SalesDashboardPage /></SalesProtectedRoute></RouteErrorBoundary>} />
                  <Route path="/top-sellers" element={<RouteErrorBoundary routeName="Seller Center"><SellerCenter /></RouteErrorBoundary>} />
                  <Route path="/marketing" element={<RouteErrorBoundary routeName="Marketing"><MarketingPage /></RouteErrorBoundary>} />
                  <Route path="/legal" element={<LegalIndex />} />
                  <Route path="/legal/manuals-sops" element={<LegalManualsSOPs />} />
                  <Route path="/legal/platform-usage-acceptance-policy" element={<LegalPlatformUsageAcceptancePolicy />} />
                  <Route
                    path="/legal/anti-reverse-engineering-tampering-application-security-protection-policy"
                    element={<LegalAntiReverseEngineeringTamperingApplicationSecurityProtectionPolicy />}
                  />
                  <Route
                    path="/legal/incident-response-breach-handling-cybersecurity-crisis-management-policy"
                    element={<LegalIncidentResponseBreachHandlingCybersecurityCrisisManagementPolicy />}
                  />
                  <Route
                    path="/legal/auditlogs-monitoring-evidencepreservation-adminaccountability-policy"
                    element={<LegalAuditLogsMonitoringEvidencePreservationAdminAccountabilityPolicy />}
                  />
                  <Route
                    path="/legal/crossbordertrade-importexport-customscompliance-internationalsellerbuyer-policy"
                    element={<LegalCrossBorderTradeImportExportCustomsComplianceInternationalSellerBuyerPolicy />}
                  />
                  <Route
                    path="/legal/disputeresolution-complainthandling-arbitration-fairpractice-policy"
                    element={<LegalDisputeResolutionComplaintHandlingArbitrationFairPracticePolicy />}
                  />
                  <Route
                    path="/legal/emergencyresponse-safetyincidents-lawenforcement-crisismanagement-policy"
                    element={<LegalEmergencyResponseSafetyIncidentsLawEnforcementCrisisManagementPolicy />}
                  />
                  <Route
                    path="/legal/dataprotection-privacygovernance-personaldatahandling-dpdpcompliance-policy"
                    element={<LegalDataProtectionPrivacyGovernancePersonalDataHandlingDPDPCompliancePolicy />}
                  />
                  <Route
                    path="/legal/dataaccuracy-integrityassurance-errorprevention-correction-policy"
                    element={<LegalDataAccuracyIntegrityAssuranceErrorPreventionCorrectionPolicy />}
                  />
                  <Route
                    path="/legal/marketing-advertising-promotionethics-brandcommunication-policy"
                    element={<LegalMarketingAdvertisingPromotionEthicsBrandCommunicationPolicy />}
                  />
                  <Route
                    path="/legal/vendor-partner-serviceprovider-onboarding-compliance-policy"
                    element={<LegalVendorPartnerServiceProviderOnboardingCompliancePolicy />}
                  />
                  <Route
                    path="/legal/usergrievance-redressal-complaintescalation-nodalofficer-policy"
                    element={<LegalUserGrievanceRedressalComplaintEscalationNodalOfficerCompliancePolicy />}
                  />
                  <Route
                    path="/legal/ethicalconduct-integrity-anticorruption-professionalbehaviour-codeofconduct-policy"
                    element={<LegalEthicalConductIntegrityAntiCorruptionProfessionalBehaviourCodeOfConductPolicy />}
                  />
                  <Route
                    path="/legal/platformmoderation-contentreview-listingapproval-takedown-policy"
                    element={<LegalPlatformModerationContentReviewListingApprovalTakedownPolicy />}
                  />
                  <Route
                    path="/legal/security-authentication-passwordprotection-accesscontrol-encryption-policy"
                    element={<LegalSecurityAuthenticationPasswordProtectionAccessControlEncryptionPolicy />}
                  />
                  <Route
                    path="/legal/aml-fraudprevention-financialcrimescompliance-policy"
                    element={<LegalAMLFinancialCrimesFraudPreventionCompliancePolicy />}
                  />
                  <Route
                    path="/legal/audit-logging-monitoring-compliancereview-regulatoryreporting-policy"
                    element={<LegalAuditLoggingMonitoringComplianceReviewRegulatoryReportingPolicy />}
                  />
                  <Route
                    path="/legal/apiusage-developeraccess-integrationsecurity-ratelimiting-policy"
                    element={<LegalAPIUsageDeveloperAccessIntegrationSecurityRateLimitingCompliancePolicy />}
                  />
                  <Route
                    path="/legal/businesscontinuity-disasterrecovery-systemavailability-outagecommunication-policy"
                    element={<LegalBusinessContinuityDisasterRecoverySystemAvailabilityOutageCommunicationPolicy />}
                  />
                  <Route
                    path="/legal/intellectualproperty-copyright-trademark-brandprotection-policy"
                    element={<LegalIntellectualPropertyCopyrightTrademarkBrandProtectionPolicy />}
                  />
                  <Route
                    path="/legal/aiusage-monitoring-fairness-safety-responsibleautomation-policy"
                    element={<LegalAIUsageMonitoringFairnessSafetyResponsibleAutomationPolicy />}
                  />
                  <Route
                    path="/legal/dataretention-archival-lifecyclemanagement-migration-offboarding-policy"
                    element={<LegalDataRetentionArchivalLifecycleManagementMigrationOffboardingPolicy />}
                  />
                  <Route
                    path="/legal/legalnotice-termsupdate-usernotification-versioning-policy"
                    element={<LegalLegalNoticeTermsUpdateUserNotificationVersioningPolicy />}
                  />
                  <Route
                    path="/legal/seller-onboarding-productapproval-verification-compliance-policy"
                    element={<LegalSellerOnboardingProductApprovalVerificationCompliancePolicy />}
                  />
                  <Route
                    path="/legal/buyer-onboarding-identityverification-walletsafety-responsibleparticipation-policy"
                    element={<LegalBuyerOnboardingIdentityVerificationWalletSafetyResponsibleParticipationPolicy />}
                  />
                  <Route
                    path="/legal/auction-participation-rules-bidconduct-antimanipulation-policy"
                    element={<LegalAuctionParticipationRulesBidConductAntiManipulationPolicy />}
                  />
                  <Route
                    path="/legal/buyer-deposit-escrowhandling-refunds-paymentcompliance-policy"
                    element={<LegalBuyerDepositEscrowHandlingRefundsPaymentCompliancePolicy />}
                  />
                  <Route
                    path="/legal/highrisk-items-prohibitedassets-restrictedlistings-policy"
                    element={<LegalHighRiskItemsProhibitedAssetsRestrictedListingsPolicy />}
                  />
                  <Route
                    path="/legal/vehicle-documentation-conditiondisclosure-authenticityverification-policy"
                    element={<LegalVehicleDocumentationConditionDisclosureAuthenticityVerificationPolicy />}
                  />
                  <Route
                    path="/legal/internal-accesscontrol-rbac-adminaccountability-audit-policy"
                    element={<LegalInternalAccessControlRBACAdminAccountabilityAuditPolicy />}
                  />
                  <Route
                    path="/legal/transport-yardsafety-delivery-handover-compliance-policy"
                    element={<LegalTransportYardSafetyDeliveryHandoverCompliancePolicy />}
                  />
                  <Route
                    path="/legal/quickmela-legal-compliance-manual"
                    element={<LegalQuickMelaLegalComplianceManual />}
                  />
                  <Route path="/legal/transport-partner-agreement" element={<LegalTransportPartnerAgreement />} />
                  <Route
                    path="/legal/vendor-registration-approval-policy"
                    element={<LegalVendorRegistrationApprovalPolicy />}
                  />
                  <Route path="/legal/ai-fraud-detection-policy" element={<LegalAIFraudDetectionPolicy />} />
                  <Route path="/legal/ai-risk-score-policy" element={<LegalAIRiskScorePolicy />} />
                  <Route path="/legal/device-fingerprinting-policy" element={<LegalDeviceFingerprintingPolicy />} />
                  <Route path="/legal/multi-account-detection-policy" element={<LegalMultiAccountDetectionPolicy />} />
                  <Route path="/legal/location-gps-verification-policy" element={<LegalLocationGPSVerificationPolicy />} />
                  <Route path="/legal/behavioural-monitoring-policy" element={<LegalBehaviouralMonitoringPolicy />} />
                  <Route path="/legal/ip-reputation-network-security-policy" element={<LegalIPReputationNetworkSecurityPolicy />} />
                  <Route path="/legal/automated-fraud-escalation-policy" element={<LegalAutomatedFraudEscalationPolicy />} />
                  <Route path="/legal/auction-integrity-monitoring-policy" element={<LegalAuctionIntegrityMonitoringPolicy />} />
                  <Route path="/legal/aml-financial-integrity-policy" element={<LegalAMLPolicy />} />
                  <Route path="/legal/ai-model-ownership-policy" element={<LegalAIModelOwnershipPolicy />} />
                  <Route path="/legal/ai-explainability-human-oversight-policy" element={<LegalAIExplainabilityPolicy />} />
                  <Route path="/legal/ai-model-transparency-audit-policy" element={<LegalAIModelTransparencyAuditPolicy />} />
                  {/* Legal Routes */}
                  <Route path="/legal/terms-and-conditions" element={<LegalTermsAndConditions />} />
                  <Route path="/legal/privacy-policy" element={<LegalPrivacyPolicy />} />
                  <Route path="/legal/e-contract-digital-agreement" element={<LegalEContractDigitalAgreementPolicy />} />
                  <Route path="/legal/auction-rules-bidding" element={<LegalAuctionRulesBiddingPolicy />} />
                  <Route path="/legal/anti-fraud-shill-bidding" element={<LegalAntiFraudShillBiddingPolicy />} />
                  <Route path="/legal/seller-policy" element={<LegalSellerPolicy />} />
                  <Route path="/legal/buyer-policy" element={<LegalBuyerPolicy />} />
                  <Route path="/legal/refund-cancellation-dispute" element={<LegalRefundCancellationDisputePolicy />} />
                  <Route path="/legal/wallet-deposit-investment" element={<LegalWalletDepositInvestmentPolicy />} />
                  <Route path="/legal/sarfaesi-property-compliance" element={<LegalSARFAESICompliancePolicy />} />
                  <Route path="/legal/intellectual-property" element={<LegalIntellectualPropertyPolicy />} />
                  <Route path="/legal/vendor-bank-partner-agreement" element={<LegalVendorBankPartnerAgreement />} />
                  <Route path="/legal/bank-nbfc-mou" element={<LegalBankNBFCMOU />} />
                  <Route path="/legal/vendor-service-level-agreement" element={<LegalVendorServiceLevelAgreement />} />
                  <Route path="/legal/recovery-agency-agreement" element={<LegalRecoveryAgencyAgreement />} />
                  <Route path="/legal/commission-rate-sheet" element={<LegalCommissionRateSheet />} />
                  <Route path="/legal/white-label-partner-agreement" element={<LegalWhiteLabelPartnerAgreement />} />
                  <Route path="/legal/bank-nbfc-onboarding-sop" element={<LegalBankNBFCOnboardingSOP />} />
                  <Route path="/legal/investor-policy" element={<LegalInvestorPolicy />} />
                  <Route path="/legal/branding-policy" element={<LegalBrandingPolicy />} />
                  <Route path="/campaign/:source?" element={<CampaignLanding />} />
                  <Route path="/links" element={<SocialLinks />} />
                  <Route path="/seized-vehicles" element={<SeizedVehicles />} />
                  <Route path="/vehicle/:id" element={<VehicleDetail />} />
                  <Route path="/verify/employee/:token" element={<VerifyEmployee />} />
                  <Route path="/scan" element={<QRScanner />} />
                  <Route path="/inspection-report/:inspectionId" element={<InspectionReport />} />
                  <Route path="/share/verification/:inspectionId" element={<ShareVerificationBadge />} />
                  <Route path="/verify-phone" element={<ProtectedRoute><PhoneVerification /></ProtectedRoute>} />
                  <Route path="/verification" element={<ProtectedRoute><Verification /></ProtectedRoute>} />
                  <Route path="/checkout/token" element={<ProtectedRoute><TokenCheckout /></ProtectedRoute>} />
                  <Route path="/checkout/deposit/:productId" element={<ProtectedRoute><DepositCheckout /></ProtectedRoute>} />
                  <Route path="/visit/:productId?" element={<ProtectedRoute><VisitBooking /></ProtectedRoute>} />
                  <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
                  <Route path="/payment/failed" element={<ProtectedRoute><PaymentFailed /></ProtectedRoute>} />
                  <Route path="/delivery-preferences/:auctionId" element={<ProtectedRoute><DeliveryPreferences /></ProtectedRoute>} />
                  <Route path="/invoice/:auctionId" element={<ProtectedRoute><WinInvoice /></ProtectedRoute>} />
                  <Route path="/finance/loans/apply" element={<ProtectedRoute><LoanApplyPage /></ProtectedRoute>} />
                  <Route path="/finance/loans/:id" element={<ProtectedRoute><ApplicationStatusPage /></ProtectedRoute>} />
                  <Route path="/finance/insurance/apply" element={<ProtectedRoute><InsuranceApplyPage /></ProtectedRoute>} />
                  <Route path="/finance/insurance/:id" element={<ProtectedRoute><InsuranceStatusPage /></ProtectedRoute>} />
                  <Route path="/finance/insurance/dashboard" element={<ProtectedRoute><InsuranceDashboard /></ProtectedRoute>} />
                  <Route path="/finance/insurance/claim/:policyId" element={<ProtectedRoute><InsuranceClaimPage /></ProtectedRoute>} />
 

              {/* Protected User Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/ai-dashboard" element={<ProtectedRoute><AIDashboard /></ProtectedRoute>} />
              <Route path="/buyer/dashboard" element={<ProtectedRoute><BuyerDashboard /></ProtectedRoute>} />
              <Route path="/my/won-auctions" element={<ProtectedRoute><MyWonAuctions /></ProtectedRoute>} />
              <Route path="/my/issues/:issueId" element={<ProtectedRoute><MyIssueDetail /></ProtectedRoute>} />
              <Route path="/seller/dashboard" element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
              <Route path="/seller/membership" element={<ProtectedRoute><SellerMembership /></ProtectedRoute>} />
              <Route path="/company/dashboard" element={<ProtectedRoute><CompanyDashboard /></ProtectedRoute>} />
              <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
              <Route path="/company/register" element={<CompanyRegistration />} />
              <Route path="/company/verification-pending" element={<ProtectedRoute><CompanyVerificationPending /></ProtectedRoute>} />
              <Route path="/compliance" element={<ProtectedRoute><ComplianceTracking /></ProtectedRoute>} />
              <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
              <Route path="/my-bids" element={<ProtectedRoute><BiddingHistory /></ProtectedRoute>} />
              <Route path="/watchlist" element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} />
              <Route path="/my/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
              <Route path="/my/inspections" element={<ProtectedRoute><MyInspections /></ProtectedRoute>} />
              <Route
                path="/inspector"
                element={
                  <ProtectedRoute>
                    <RoleGuard allow={['inspector', 'admin']}>
                      <InspectorInspectionsList />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inspector/inspections/:inspectionId"
                element={
                  <ProtectedRoute>
                    <RoleGuard allow={['inspector', 'admin']}>
                      <InspectorInspectionReview />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />
              <Route path="/my/wins" element={<ProtectedRoute><MyWins /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
              <Route path="/add-product" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
              <Route path="/bulk-upload" element={<ProtectedRoute><BulkUpload /></ProtectedRoute>} />
              <Route path="/verify-seller" element={<ProtectedRoute><VerifySeller /></ProtectedRoute>} />
              <Route path="/seller/analytics" element={<ProtectedRoute><SellerAnalytics /></ProtectedRoute>} />
              <Route path="/creative-verification" element={<ProtectedRoute><CreativeVerification /></ProtectedRoute>} />
              <Route path="/ai-recommendations" element={<ProtectedRoute><AIRecommendations /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/settings/notifications" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
              <Route path="/support" element={<ProtectedRoute><SupportTickets /></ProtectedRoute>} />
              <Route path="/support/:id" element={<ProtectedRoute><SupportTicketDetail /></ProtectedRoute>} />
              <Route path="/support/sales" element={<SupportSales />} />
              <Route path="/order-tracking/:orderId?" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
              <Route path="/winner/:auctionId" element={<ProtectedRoute><WinnerConfirmation /></ProtectedRoute>} />
              <Route path="/pay/:auctionId" element={<ProtectedRoute><PayForWin /></ProtectedRoute>} />
              <Route path="/market-analytics" element={<ProtectedRoute><MarketAnalytics /></ProtectedRoute>} />
              <Route path="/payment-gateway" element={<ProtectedRoute><PaymentGateway /></ProtectedRoute>} />
              <Route path="/security-center" element={<ProtectedRoute><SecurityCenter /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><ReportsAnalytics /></ProtectedRoute>} />

              {/* Auction Pages */}
              <Route path="/auction-preview" element={<ProtectedRoute><AuctionPreview /></ProtectedRoute>} />
              <Route path="/live-auction/:id?" element={<ProtectedRoute><LiveAuctionPage /></ProtectedRoute>} />
              <Route path="/timed-auction/:id?" element={<ProtectedRoute><TimedAuctionPage /></ProtectedRoute>} />
              <Route path="/tender-auction/:id?" element={<ProtectedRoute><TenderAuctionPage /></ProtectedRoute>} />
              <Route path="/live-bidding/:id?" element={<ProtectedRoute><LiveBidding /></ProtectedRoute>} />
              <Route path="/auction-calendar" element={<ProtectedRoute><AuctionCalendar /></ProtectedRoute>} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/catalog" element={<ProductCatalog />} />
              <Route path="/user/:id" element={<UserProfile />} />
              <Route path="/advanced-search" element={<AdvancedSearch />} />
              <Route path="/bidding-history" element={<ProtectedRoute><BiddingHistory /></ProtectedRoute>} />
              <Route path="/seller-center" element={<ProtectedRoute><SellerCenter /></ProtectedRoute>} />
              <Route path="/invest" element={<InvestLanding />} />
              <Route path="/invest/apply" element={<InvestApply />} />
              <Route path="/invest/confirm" element={<InvestConfirm />} />
              <Route path="/invest/dashboard" element={<ProtectedRoute><InvestorDashboard /></ProtectedRoute>} />
              <Route path="/monitoring" element={<ProtectedRoute><MonitoringDashboard /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute adminRequired={true}><AdminSalesDashboard /></ProtectedRoute>} />
              <Route path="/admin/sales" element={<ProtectedRoute adminRequired={true}><AdminSalesDashboard /></ProtectedRoute>} />
              <Route path="/admin/sales/leads" element={<ProtectedRoute adminRequired={true}><AdminSalesLeads /></ProtectedRoute>} />
              <Route path="/admin/banners" element={<ProtectedRoute adminRequired={true}><AdminBanners /></ProtectedRoute>} />
              <Route path="/admin/finance-leads" element={<ProtectedRoute adminRequired={true}><AdminFinanceLeads /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute adminRequired={true}><UserManagement /></ProtectedRoute>} />
              <Route path="/admin/verify-products" element={<ProtectedRoute adminRequired={true}><ProductVerification /></ProtectedRoute>} />
              <Route path="/admin/products" element={<ProtectedRoute adminRequired={true}><AdminProductsList /></ProtectedRoute>} />
              <Route path="/admin/products/:id" element={<ProtectedRoute adminRequired={true}><AdminProductDetail /></ProtectedRoute>} />
              <Route path="/admin/events" element={<ProtectedRoute adminRequired={true}><AdminEventsList /></ProtectedRoute>} />
              <Route path="/admin/events/new" element={<ProtectedRoute adminRequired={true}><AdminEventCreate /></ProtectedRoute>} />
              <Route path="/admin/events/:id" element={<ProtectedRoute adminRequired={true}><AdminEventDetail /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute adminRequired={true}><SystemSettings /></ProtectedRoute>} />
                            <Route path="/admin/live-stream" element={<ProtectedRoute adminRequired={true}><LiveStreamSetup /></ProtectedRoute>} />
              <Route path="/admin/webcast-setup" element={<ProtectedRoute adminRequired={true}><LiveWebcastSetup /></ProtectedRoute>} />
                            <Route path="/admin/kyc-review" element={<ProtectedRoute adminRequired={true}><AdminKYCReview /></ProtectedRoute>} />
              <Route path="/admin/content-moderation" element={<ProtectedRoute adminRequired={true}><ContentModeration /></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute adminRequired={true}><AnalyticsDashboard /></ProtectedRoute>} />
              <Route path="/admin/investor-listings" element={<ProtectedRoute adminRequired={true}><InvestorAdmin /></ProtectedRoute>} />
              <Route path="/admin/campaigns" element={<ProtectedRoute adminRequired={true}><AdminCampaigns /></ProtectedRoute>} />
              <Route path="/admin/investments" element={<ProtectedRoute adminRequired={true}><AdminInvestments /></ProtectedRoute>} />
              <Route path="/admin/live-control/:id" element={<ProtectedRoute adminRequired={true}><LiveStreamControl /></ProtectedRoute>} />
              <Route path="/admin/ai-training" element={<ProtectedRoute adminRequired={true}><AIModelTraining /></ProtectedRoute>} />
              <Route path="/admin/marketing" element={<ProtectedRoute adminRequired={true}><AdminMarketing /></ProtectedRoute>} />
              <Route path="/admin/employees" element={<ProtectedRoute adminRequired={true}><AdminEmployees /></ProtectedRoute>} />
              <Route path="/admin/deposit-policies" element={<ProtectedRoute adminRequired={true}><AdminDepositPolicies /></ProtectedRoute>} />
              <Route path="/admin/fraud" element={<ProtectedRoute adminRequired={true}><AdminFraudReview /></ProtectedRoute>} />
              <Route path="/admin/ai-reports" element={<ProtectedRoute adminRequired={true}><AIReports /></ProtectedRoute>} />
              <Route path="/admin/locations" element={<ProtectedRoute adminRequired={true}><AdminLocations /></ProtectedRoute>} />
              <Route
                path="/admin/support-chat"
                element={
                  <ProtectedRoute adminRequired={true}>
                    <Suspense fallback={<div className="min-h-[200px] flex items-center justify-center">Loading support chat…</div>}>
                      <AdminSupportChat />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route path="/admin/tickets" element={<ProtectedRoute adminRequired={true}><AdminTicketDesk /></ProtectedRoute>} />
              <Route path="/admin/support/:id" element={<ProtectedRoute adminRequired={true}><SupportTicketDetail /></ProtectedRoute>} />
              <Route path="/admin/catalog-settings" element={<ProtectedRoute adminRequired={true}><CatalogSettings /></ProtectedRoute>} />
              <Route path="/admin/fees" element={<ProtectedRoute adminRequired={true}><AdminFees /></ProtectedRoute>} />
              <Route path="/admin/alerts-test" element={<ProtectedRoute adminRequired={true}><AdminAlertsTest /></ProtectedRoute>} />
              <Route path="/admin/yard-tokens" element={<ProtectedRoute adminRequired={true}><AdminYardTokens /></ProtectedRoute>} />
              <Route path="/admin/referrals" element={<ProtectedRoute adminRequired={true}><ReferralBonuses /></ProtectedRoute>} />
              <Route path="/admin/winners" element={<ProtectedRoute adminRequired={true}><AdminWinners /></ProtectedRoute>} />
              <Route path="/admin/deliveries" element={<ProtectedRoute adminRequired={true}><AdminDeliveries /></ProtectedRoute>} />
              <Route path="/admin/seller-earnings" element={<ProtectedRoute adminRequired={true}><AdminSellerEarnings /></ProtectedRoute>} />
              <Route path="/admin/win-payments" element={<ProtectedRoute adminRequired={true}><AdminWinPayments /></ProtectedRoute>} />
              <Route path="/admin/delivery-slip/:auctionId" element={<ProtectedRoute adminRequired={true}><AdminDeliverySlip /></ProtectedRoute>} />
              <Route path="/admin/departments" element={<ProtectedRoute adminRequired={true}><AdminDepartments /></ProtectedRoute>} />
              <Route path="/admin/branches" element={<ProtectedRoute adminRequired={true}><AdminBranches /></ProtectedRoute>} />
              <Route path="/admin/staff" element={<ProtectedRoute adminRequired={true}><AdminStaff /></ProtectedRoute>} />
              
              {/* Missing Admin Routes */}
              <Route path="/admin/categories" element={<ProtectedRoute adminRequired={true}><CategoryManagement /></ProtectedRoute>} />
              <Route path="/admin/roles" element={<ProtectedRoute adminRequired={true}><AdminRolesPermissions /></ProtectedRoute>} />
              <Route path="/admin/permissions" element={<ProtectedRoute adminRequired={true}><PermissionsMatrix /></ProtectedRoute>} />
              <Route path="/admin/product-verification/bulk" element={<ProtectedRoute adminRequired={true}><ProductVerification /></ProtectedRoute>} />
              <Route path="/admin/tasks" element={<ProtectedRoute adminRequired={true}><AdminTasks /></ProtectedRoute>} />

              {/* Super Admin */}
              <Route path="/super-admin" element={<ProtectedRoute adminRequired={true}><SuperAdmin /></ProtectedRoute>} />
              
              {/* Public Pages */}
              <Route path="/mobile-app" element={<MobileApp />} />
              <Route path="/api-docs" element={<APIDocumentation />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/partnerships" element={<Partnerships />} />
              <Route path="/investors" element={<InvestorRelations />} />
              <Route path="/investor-marketplace" element={<InvestorMarketplace />} />
              <Route path="/trust-safety" element={<TrustSafety />} />
              <Route path="/business-solutions" element={<BusinessSolutions />} />
              <Route path="/investor-pitch" element={<InvestorPitch />} />

              {/* 404 Page */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </GlobalLayout>
          <CookieConsent />
        </SessionProvider>
      </Router>
    );
  };

export default App;
