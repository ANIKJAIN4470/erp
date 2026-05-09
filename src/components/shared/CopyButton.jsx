import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const CopyButton = ({ text, label = "Copy", onCopied }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (typeof onCopied === 'function') {
      onCopied();
    }
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className="copy-btn-premium"
      title={label}
    >
      {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
      <span>{copied ? "Copied" : label}</span>
    </button>
  );
};

export default CopyButton;
