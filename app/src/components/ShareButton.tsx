import React, { useState } from 'react';
import { getShortenedUUID } from '../services/globalServices';

interface ShareButtonProps {
  refinementId: string;
  sessionTitle?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ refinementId, sessionTitle }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('Copie o link');
  const shortenedUUID = getShortenedUUID(refinementId);
  const shareUrl = `${window.location.origin}/join-a-session/${shortenedUUID}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setTooltipMessage('Copiado!');
      setShowTooltip(true);

      // Reset tooltip after 2 seconds
      setTimeout(() => {
        setShowTooltip(false);
        setTooltipMessage('Copie o link');
      }, 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      setTooltipMessage('Copiado!');
      setShowTooltip(true);
      setTimeout(() => {
        setShowTooltip(false);
        setTooltipMessage('Copie o link');
      }, 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: sessionTitle || 'Junte-se a minha sessão de refinamento ',
          text: `Junte-se a minha sessão de refinamento: ${shortenedUUID}`,
          url: shareUrl,
        });
      } catch (err) {
        // User canceled the share or it failed
        console.log('Compatilhamento cancelado ou falhou:', err);
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
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span>{shortenedUUID}</span>
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap">
          {tooltipMessage}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

export default ShareButton;