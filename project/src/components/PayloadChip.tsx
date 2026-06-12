interface PayloadChipProps {
  payload: string;
  onClick: (payload: string) => void;
}

export default function PayloadChip({ payload, onClick }: PayloadChipProps) {
  return (
    <button
      onClick={() => onClick(payload)}
      className="font-mono text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-red-600/50 text-red-400 px-2 py-1 rounded transition-all duration-150 text-left break-all"
    >
      {payload}
    </button>
  );
}
