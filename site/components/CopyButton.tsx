import { useState } from "react";

type CopyButtonProps = {
  label: string;
  value: string;
};

export function CopyButton({ label, value }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy value", error);
      setCopied(false);
    }
  };

  return (
    <button className="primary-button" type="button" onClick={handleCopy}>
      {copied ? "Copied!" : label}
    </button>
  );
}

