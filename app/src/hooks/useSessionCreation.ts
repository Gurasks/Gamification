import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalLoading } from "@/contexts/LoadingContext";
import {
  createSessionInFirestore,
  shortenUUID,
} from "@/services/firestore/firestoreServices";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";

export const useSessionCreation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setGlobalLoading, setLoadingMessage } = useGlobalLoading();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    password: "",
    requiresPassword: false,
  });
  const [isCreating, setIsCreating] = useState(false);

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.name.trim()) {
      errors.push("Nome da sessão é obrigatório");
    }

    if (formData.name.length > 100) {
      errors.push("Nome da sessão deve ter no máximo 100 caracteres");
    }

    if (formData.description.length > 500) {
      errors.push("Descrição deve ter no máximo 500 caracteres");
    }

    return errors;
  };

  const handleCreateSession = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return;
    }

    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    setIsCreating(true);
    setGlobalLoading(true);
    setLoadingMessage("Criando sua sessão...");

    try {
      const newSessionId = uuidv4();

      // Loading específico para encurtamento de UUID
      setLoadingMessage("Configurando sessão...");
      await shortenUUID(newSessionId);

      const sessionData = {
        name: formData.name,
        description: formData.description,
        password: formData.requiresPassword ? formData.password : null,
        requiresPassword: formData.requiresPassword,
      };

      setLoadingMessage("Salvando dados...");
      await createSessionInFirestore(newSessionId, sessionData, user);

      toast.success("Sessão criada com sucesso!");
      navigate(`/team-selection/${newSessionId}`);
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Erro ao criar sessão. Tente novamente.");
    } finally {
      setIsCreating(false);
      setGlobalLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return {
    formData,
    isCreating,
    handleCreateSession,
    updateFormData,
    validateForm,
  };
};
