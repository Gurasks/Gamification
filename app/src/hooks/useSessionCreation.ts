import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalLoading } from "@/contexts/LoadingContext";
import { shortenUUID } from "@/services/firestore/firestoreServices";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { createSessionInFirestore } from "@/services/firestore/sessionServices";
import { MAX_DESCRIPTION_LENGTH } from "@/scenes/CreationScene/CreationScene";
import { useLanguage } from "@/hooks/useLanguage";

export const useSessionCreation = () => {
  const { t } = useLanguage();
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
      errors.push(t("creation.errors.nameRequired"));
    }

    if (formData.name.length > 100) {
      errors.push(t("creation.errors.nameTooLong"));
    }

    if (formData.description.length > MAX_DESCRIPTION_LENGTH) {
      errors.push(
        t("creation.errors.descriptionTooLong", {
          max: MAX_DESCRIPTION_LENGTH,
        }),
      );
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
      toast.error(t("creation.errors.userNotAuthenticated"));
      return;
    }

    setIsCreating(true);
    setGlobalLoading(true);
    setLoadingMessage(t("creation.loading.creating"));

    try {
      const newSessionId = uuidv4();

      setLoadingMessage(t("creation.loading.configuring"));
      await shortenUUID(newSessionId);

      const sessionData = {
        name: formData.name,
        description: formData.description,
        password: formData.requiresPassword ? formData.password : null,
        requiresPassword: formData.requiresPassword,
      };

      setLoadingMessage(t("creation.loading.saving"));
      await createSessionInFirestore(newSessionId, sessionData, user);

      toast.success(t("creation.success.sessionCreated"));
      navigate(`/team-selection/${newSessionId}`);
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error(t("creation.errors.createFailed"));
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
