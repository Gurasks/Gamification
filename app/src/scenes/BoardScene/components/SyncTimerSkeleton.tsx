export const SyncTimerSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative w-20 h-20 flex items-center justify-center rounded-full overflow-hidden bg-gray-200 shadow-lg">
        <div className="text-white text-xl font-semibold font-mono z-10">
          ...
        </div>
      </div>
      <span className="text-xs text-gray-500">Carregando...</span>
    </div>
  );
};