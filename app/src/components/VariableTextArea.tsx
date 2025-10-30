import { SendHorizontal } from "lucide-react";
import { useRef, useEffect } from "react";

type Props = {
  text: string;
  setText: (value: string) => void;
  handleSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
};

export default function VariableTextArea({
  text,
  setText,
  handleSubmit,
  disabled = false,
  placeholder,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [text]);

  return (
    <div className="flex gap-2 mt-2 bg-white">
      <textarea
        ref={textareaRef}
        rows={1}
        value={text}
        onChange={(e) => setText((e.target as HTMLTextAreaElement).value)}
        className="flex-1 p-2 text-sm border rounded resize-none overflow-auto"
        disabled={disabled}
        placeholder={placeholder || "Adicione um comentário..."}
      />
      <button
        onClick={handleSubmit}
        className="px-2 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
        title="Comentar"
      >
        <SendHorizontal size={15} />
      </button>
    </div>
  );
}