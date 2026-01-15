import React, { useState } from 'react';

interface ShareButtonsProps {
  url: string;
  title?: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ url, title }) => {
  const [copied, setCopied] = useState(false);

  const safeUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareTitle = title || 'Check this out';

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url: safeUrl });
      } catch (_e) {
        // user cancelled or share failed; ignore
      }
    }
  };

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(safeUrl);
      } else {
        const el = document.createElement('textarea');
        el.value = safeUrl;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_e) {
      // ignore
    }
  };

  const encodedText = encodeURIComponent(`${shareTitle} ${safeUrl}`.trim());
  const whatsappHref = `https://wa.me/?text=${encodedText}`;
  const emailHref = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(safeUrl)}`;

  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
      {hasNativeShare && (
        <button
          type="button"
          onClick={handleNativeShare}
          className="px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Share
        </button>
      )}
      <a
        href={whatsappHref}
        target="_blank"
        rel="noreferrer noopener"
        className="px-3 py-1 rounded-full border border-green-500 text-green-700 hover:bg-green-50 text-[0.7rem] sm:text-xs"
      >
        WhatsApp
      </a>
      <a
        href={emailHref}
        className="px-3 py-1 rounded-full border border-blue-500 text-blue-700 hover:bg-blue-50 text-[0.7rem] sm:text-xs"
      >
        Email
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className="px-3 py-1 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 text-[0.7rem] sm:text-xs"
      >
        {copied ? 'Copied' : 'Copy link'}
      </button>
    </div>
  );
};

export default ShareButtons;
