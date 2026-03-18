import { Spinner } from '../ui/Skeleton';

export default function LoadingPage() {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-gray-50">
      <div className="h-12 w-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 border border-gray-100">
        <Spinner className="h-6 w-6 text-brand-600" />
      </div>
      <p className="text-gray-500 font-medium animate-pulse">Loading SecureVote...</p>
    </div>
  );
}
