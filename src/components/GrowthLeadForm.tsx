import React, { useState } from 'react';
import { supabase } from '../config/supabaseClient';
import { toast } from 'react-hot-toast';
import { trackGrowthLeadEvent } from '../utils/growthLeadAnalytics';
import { trackCtaEvent } from '../utils/ctaAnalytics';

interface GrowthLeadFormProps {
  interest: string;
}

const GrowthLeadForm: React.FC<GrowthLeadFormProps> = ({ interest }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const growthSlackWebhook = import.meta.env.VITE_GROWTH_SLACK_WEBHOOK_URL;

  const notifyGrowthSlack = async (payload: { interest: string; name: string; email: string; phone?: string; message?: string }) => {
    if (!growthSlackWebhook) return;

    const slackPayload = {
      text: `New lead: *${payload.interest}*\nName: ${payload.name}\nEmail: ${payload.email}${payload.phone ? `\nPhone: ${payload.phone}` : ''}${payload.message ? `\nMessage: ${payload.message}` : ''}`,
    };

    try {
      await fetch(growthSlackWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slackPayload),
      });
    } catch (error) {
      console.warn('Growth lead Slack notification failed', error);
    }
  };

  const handleChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const trackFormEvent = (status: 'attempt' | 'success' | 'failure' | 'validation_failed') => {
    trackCtaEvent({
      action: `lead_form_${status}`,
      label: interest,
      page: interest,
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.email) {
      toast.error('Please share your name and email');
      trackFormEvent('validation_failed');
      return;
    }
    setSubmitting(true);
    trackFormEvent('attempt');
    const { error } = await supabase.from('growth_leads').insert([
      {
        interest,
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
      },
    ]);
    setSubmitting(false);

    if (error) {
      toast.error('Unable to capture lead right now');
      console.error('growth lead error', error);
      trackFormEvent('failure');
      return;
    }

    trackGrowthLeadEvent({
      interest,
      eventType: 'lead_submitted',
      metadata: { page: interest },
    });
    notifyGrowthSlack({
      interest,
      name: form.name,
      email: form.email,
      phone: form.phone,
      message: form.message,
    });

    toast.success('Thanks! Our team will reach out soon.');
    trackFormEvent('success');
    setForm({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={handleChange('name')}
          className="w-full rounded border border-gray-300 px-3 py-2"
          required
        />
        <input
          type="email"
          placeholder="Work email"
          value={form.email}
          onChange={handleChange('email')}
          className="w-full rounded border border-gray-300 px-3 py-2"
          required
        />
      </div>
      <input
        type="tel"
        placeholder="Phone / WhatsApp"
        value={form.phone}
        onChange={handleChange('phone')}
        className="w-full rounded border border-gray-300 px-3 py-2"
      />
      <textarea
        placeholder="Tell us about your goal"
        value={form.message}
        onChange={handleChange('message')}
        className="w-full rounded border border-gray-300 px-3 py-2"
        rows={3}
      />
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 px-4 py-2 text-white font-semibold shadow hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Sending…' : `Request a ${interest} plan`}
      </button>
    </form>
  );
};

export default GrowthLeadForm;
