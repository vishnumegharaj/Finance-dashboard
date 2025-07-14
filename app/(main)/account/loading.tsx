export default function AccountLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-8 h-8 border-3 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-blue-700 text-sm font-medium">Loading account...</div>
      </div>
    </div>
  );
} 