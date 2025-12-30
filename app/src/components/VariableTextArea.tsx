import { SendHorizontal } from "lucide-react";
import { useRef, useEffect, KeyboardEvent } from "react";

type VariableTextAreaProps = {
  text: string;
  setText: (value: string) => void;
  handleSubmit?: () => void;
  disabled?: boolean;
  placeholder?: string;
  rows?: number;
  showSubmitButton?: boolean;
  submitFormOnEnter?: boolean;
};

export default function VariableTextArea({
  text,
  setText,
  handleSubmit,
  disabled = false,
  placeholder,
  rows = 1,
  showSubmitButton = true,
  submitFormOnEnter = false
}: VariableTextAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [text]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      e.key === 'Enter' &&
      !e.shiftKey &&
      submitFormOnEnter &&
      !disabled
    ) {
      e.preventDefault();

      const form = textareaRef.current?.closest('form');
      form?.requestSubmit();
    }
  };

  const handleSubmitClick = () => {
    if (text.trim() && !disabled && handleSubmit) {
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-2 bg-white rounded-sm border border-gray-300 focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 transition-all">
      <textarea
        ref={textareaRef}
        rows={rows}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 p-3 text-sm resize-none overflow-auto focus:outline-none rounded-l-lg"
        disabled={disabled}
        placeholder={placeholder || "Digite sua sugestão..."}
      />
      {showSubmitButton !== false && (
        <button
          onClick={handleSubmitClick}
          disabled={disabled || !text.trim()}
          className="px-4 bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[44px]"
          title="Enviar sugestão (Enter)"
        >
          <SendHorizontal size={18} />
        </button>
      )}
    </div>
  );
}