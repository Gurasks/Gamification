import { SendHorizontal } from "lucide-react";
import { useRef, useEffect } from "react";

type Props = {
  commentText: string;
  setCommentText: (value: string) => void;
  handleCommentSubmit: () => void;
};

export default function CommentInputBox({
  commentText,
  setCommentText,
  handleCommentSubmit,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [commentText]);

  return (
    <div className="flex gap-2 mt-2 bg-white">
      <textarea
        ref={textareaRef}
        rows={1}
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder="Adicione um comentário..."
        className="flex-1 p-2 text-sm border rounded resize-none overflow-auto"
      />
      <button
        onClick={handleCommentSubmit}
        className="px-2 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
        title="Comentar"
      >
        <SendHorizontal size={15} />
      </button>
    </div>
  );
}