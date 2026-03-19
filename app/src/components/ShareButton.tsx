import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { getShortenedUUID } from '../services/globalServices';
import { useLanguage } from '@/hooks/useLanguage';

interface ShareButtonProps {
  sessionId: string;
  sessionTitle?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ sessionId, sessionTitle }) => {
  const { t } = useLanguage();
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState(t('misc:share.copyLink'));
  const [copySuccess, setCopySuccess] = useState(false);

  const shortenedUUID = getShortenedUUID(sessionId);
  const shareUrl = `${window.location.origin}/join-a-session/${shortenedUUID}`;

  const resetTooltip = () => {
    setTimeout(() => {
      setShowTooltip(false);
      setCopySuccess(false);
      setTooltipMessage(t('misc:share.copyLink'));
    }, 2000);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setTooltipMessage(t('misc:share.copied'));
      setCopySuccess(true);
      setShowTooltip(true);
      resetTooltip();
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      setTooltipMessage(t('misc:share.copied'));
      setCopySuccess(true);
      setShowTooltip(true);
      resetTooltip();
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: sessionTitle || t('misc:share.defaultTitle'),
          text: t('misc:share.shareText', { code: shortenedUUID }),
          url: shareUrl,
        });
      } catch (err) {
        // User canceled the share or it failed
        console.log('Share cancelled or failed:', err);
      }
    } else {
      // Fallback to copy
      handleCopyLink();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleNativeShare}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label={t('misc:share.buttonAriaLabel')}
      >
        <Share2 className="w-5 h-5" />
        <span className="font-mono font-medium">{shortenedUUID}</span>
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap flex items-center gap-2 z-10"
          role="status"
          aria-live="polite"
        >
          {copySuccess ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-blue-400" />
          )}
          {tooltipMessage}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

export default ShareButton;