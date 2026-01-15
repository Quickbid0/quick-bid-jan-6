import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, AlertTriangle, Mail, Phone, FileText, User } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { supabase } from '../config/supabaseClient';

const Verification: React.FC = () => {
  const { session, userProfile, loading } = useSession();
  const navigate = useNavigate();
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [phoneVerified, setPhoneVerified] = useState<boolean | null>(null);
  const [kycStatus, setKycStatus] = useState<string | null>(null);

  useEffect(() => {
    const hydrate = async () => {
      if (!session?.user?.id) return;

      const user = session.user as any;
      const emailConfirmed = !!(user.email_confirmed_at || user.confirmed_at);
      setEmailVerified(emailConfirmed);

      if (userProfile) {
        setPhoneVerified(!!(userProfile as any).phone_verified || !!userProfile.phone);
        setKycStatus((userProfile as any).kyc_status || (userProfile as any).verification_status || null);
      } else {
        const { data } = await supabase
          .from('profiles')
          .select('phone, phone_verified, kyc_status, verification_status')
          .eq('id', session.user.id)
          .maybeSingle();
        if (data) {
          setPhoneVerified(!!data.phone_verified || !!data.phone);
          setKycStatus(data.kyc_status || data.verification_status || null);
        }
      }
    };

    hydrate();
  }, [session, userProfile]);

  if (loading && emailVerified === null && phoneVerified === null && kycStatus === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const kycComplete = kycStatus === 'verified' || kycStatus === 'approved';

  const ItemRow: React.FC<{
    done: boolean;
    title: string;
    description: string;
    icon: React.ReactNode;
    actionLabel?: string;
    onAction?: () => void;
  }> = ({ done, title, description, icon, actionLabel, onAction }) => (
    <div className="flex items-start justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-start gap-3">
        <div className="mt-1 text-indigo-600">
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
            {done && <CheckCircle className="h-4 w-4 text-green-500" />}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
        </div>
      </div>
      {!done && actionLabel && onAction && (
        <button
          onClick={onAction}
          className="ml-4 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );

  const stepsCompleted = [emailVerified, phoneVerified, kycComplete].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-8 w-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Verification</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Complete these steps to unlock full bidding and selling privileges.
            </p>
          </div>
        </div>

        <div className="mb-6 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200">Verification progress</p>
              <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
                {stepsCompleted} of 3 steps completed
              </p>
            </div>
            <div className="flex-1 ml-6 max-w-xs">
              <div className="w-full h-2 rounded-full bg-indigo-100 dark:bg-indigo-950">
                <div
                  className="h-2 rounded-full bg-indigo-600"
                  style={{ width: `${(stepsCompleted / 3) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {stepsCompleted === 3 && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">You are fully verified</p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                You have access to higher bid limits, selling privileges and priority support.
              </p>
            </div>
          </div>
        )}

        {stepsCompleted < 3 && (
          <div className="mb-6 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">Complete your verification</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Please finish all steps below before placing high-value bids or listing vehicles.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <ItemRow
            done={!!emailVerified}
            title="Email verification"
            description={emailVerified
              ? 'Your email address is verified with Supabase Auth.'
              : 'Verify your email from the sign-up confirmation link to secure your account.'}
            icon={<Mail className="h-5 w-5" />}
          />

          <ItemRow
            done={!!phoneVerified}
            title="Phone verification"
            description={phoneVerified
              ? 'Your phone number is verified and linked to your profile.'
              : 'Verify your phone via SMS OTP. Required before placing bids.'}
            icon={<Phone className="h-5 w-5" />}
            actionLabel={phoneVerified ? undefined : 'Verify phone'}
            onAction={phoneVerified ? undefined : () => navigate('/verify-phone')}
          />

          <ItemRow
            done={kycComplete}
            title="KYC & ID verification"
            description={kycComplete
              ? 'Your KYC has been approved. You have full access to buying and selling.'
              : 'Upload your ID documents and address details for KYC verification.'}
            icon={<FileText className="h-5 w-5" />}
            actionLabel={kycComplete ? undefined : 'Start KYC'}
            onAction={kycComplete ? undefined : () => navigate('/verify-profile')}
          />

          <ItemRow
            done={!!(userProfile?.address && userProfile?.pincode)}
            title="Profile details"
            description={userProfile?.address && userProfile?.pincode
              ? 'Your profile has a saved address and pincode.'
              : 'Add your address and pincode in profile to speed up delivery and KYC.'}
            icon={<User className="h-5 w-5" />}
            actionLabel={userProfile?.address && userProfile?.pincode ? undefined : 'Update profile'}
            onAction={userProfile?.address && userProfile?.pincode ? undefined : () => navigate('/profile')}
          />
        </div>
      </div>
    </div>
  );
};

export default Verification;
