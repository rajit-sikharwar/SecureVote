import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ROUTES } from '@/constants/routes';
import { Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface VoteReceiptModalProps {
  receiptHash: string;
  onDone?: () => void;
}

export function VoteReceiptModal({ receiptHash, onDone }: VoteReceiptModalProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(receiptHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDone = () => {
    if (onDone) {
      onDone();
    } else {
      navigate(ROUTES.STUDENT_HOME, { replace: true });
    }
  };

  return (
    <div className="flex flex-col items-center text-center py-4">
      <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-2">Vote Recorded!</h3>
      <p className="text-gray-500 mb-8 max-w-[280px]">
        Your vote has been permanently and securely recorded in the immutable ledger.
      </p>

      <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 mb-8">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 text-left">
          Receipt Hash
        </p>
        <div className="flex items-center gap-3">
          <code className="flex-1 text-sm font-mono text-gray-900 break-all text-left bg-white px-2 py-1.5 rounded border border-gray-100">
            {receiptHash}
          </code>
          <button 
            onClick={handleCopy}
            className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors shrink-0"
            title="Copy to clipboard"
          >
            {copied ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <p className="text-sm text-amber-600 bg-amber-50 px-4 py-3 rounded-lg w-full mb-8 text-left">
        ⚠️ Save this hash as proof of your vote. It is the only way to verify your submission later.
      </p>

      <Button variant="primary" fullWidth size="lg" onClick={handleDone}>
        Done → Go to Home
      </Button>
    </div>
  );
}
