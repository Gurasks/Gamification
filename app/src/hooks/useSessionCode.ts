import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export const useSessionCode = () => {
  const { sessionCode } = useParams<{ sessionCode: string }>();
  const [code, setCode] = useState(sessionCode || "");
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    if (!sessionCode) {
      const savedCode = sessionStorage.getItem("pending_session_code");
      if (savedCode && !code) {
        setCode(savedCode);
        setIsRestored(true);
      }
    } else {
      sessionStorage.setItem("pending_session_code", sessionCode);
      setCode(sessionCode);
    }
  }, [sessionCode, code]);

  const updateCode = (newCode: string) => {
    setCode(newCode);
    if (newCode.trim()) {
      sessionStorage.setItem("pending_session_code", newCode.trim());
    } else {
      sessionStorage.removeItem("pending_session_code");
    }
  };

  const clearCode = () => {
    setCode("");
    sessionStorage.removeItem("pending_session_code");
  };

  return {
    sessionCode: code,
    setSessionCode: updateCode,
    clearSessionCode: clearCode,
    isRestored,
    hasPendingSession: !!sessionStorage.getItem("pending_session_code"),
  };
};
