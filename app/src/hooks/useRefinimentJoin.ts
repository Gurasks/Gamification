import { useState } from "react";
import { useUser } from "../components/UserContext";
import {
  resolveUUID,
  updateDocumentListMembers,
  getRefinement,
} from "../services/firestoreService";
import { handleReponse } from "../services/homeServices";
import toast from "react-hot-toast";
import { useGlobalLoading } from "../components/LoadingContext";

export const useRefinementJoin = () => {
  const { user } = useUser();
  const { setGlobalLoading, setLoadingMessage } = useGlobalLoading();

  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [refinementData, setRefinementData] = useState<any>(null);

  const joinSession = async (joinCode: string, sessionPassword?: string) => {
    if (!joinCode.trim()) {
      setError("Código da sessão é obrigatório");
      return null;
    }

    setIsJoining(true);
    setError("");
    setGlobalLoading(true);

    try {
      // Fase 1: Resolvendo UUID
      setLoadingMessage("Verificando código da sessão...");
      const refinementId = await resolveUUID(joinCode.trim());

      if (!refinementId) {
        setError("Código inválido ou sessão não encontrada");
        return null;
      }

      // Fase 2: Buscando dados da sessão
      setLoadingMessage("Carregando dados da sessão...");
      const session = await getRefinement(refinementId);

      if (!session) {
        setError("Sessão não encontrada");
        return null;
      }

      setRefinementData(session);

      // Fase 3: Verificando senha
      if (session.requiresPassword && !sessionPassword) {
        setRequiresPassword(true);
        return { requiresPassword: true, session };
      }

      if (session.requiresPassword && sessionPassword !== session.password) {
        setError("Senha incorreta");
        return null;
      }

      // Fase 4: Entrando na sessão
      setLoadingMessage("Entrando na sessão...");
      const response = await updateDocumentListMembers(refinementId, user);
      const redirection = handleReponse(response);

      if (redirection) {
        toast.success(`Entrou na sessão: ${session.title}`);
        return { success: true, refinementId };
      } else {
        setError("Não foi possível entrar na sessão");
        return null;
      }
    } catch (error) {
      console.error("Erro ao entrar na sessão:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao entrar na sessão";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsJoining(false);
      setGlobalLoading(false);
    }
  };

  const resetPasswordState = () => {
    setRequiresPassword(false);
    setError("");
  };

  const resetError = () => {
    setError("");
  };

  return {
    isJoining,
    error,
    requiresPassword,
    refinementData,
    joinSession,
    resetPasswordState,
    resetError,
    setRequiresPassword,
  };
};
