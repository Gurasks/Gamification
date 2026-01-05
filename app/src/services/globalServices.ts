import toast from "react-hot-toast";
import { CheckCircle, XCircle } from "lucide-react";
import React from "react";
import type { Session } from "../types/global";
import { User } from "firebase/auth";

export const returnTimerId = (
  teamName: string | undefined,
  session: Session
): string => {
  return (teamName && session.teamTimers?.[teamName]) || "";
};

export const returnToastMessage = (message: string, type: string): void => {
  if (type === "error") {
    toast(message, {
      icon: React.createElement(XCircle, {
        className: "text-white-500 w-15 h-15",
      }),
      style: {
        background: "#ef5350",
        color: "#fff",
        width: "100%",
        maxWidth: "400px",
        margin: "0 auto",
      },
    });
  } else if (type === "success") {
    toast(message, {
      icon: React.createElement(CheckCircle, {
        className: "text-white-500 w-15 h-15",
      }),
      style: {
        background: "#43a047",
        color: "#fff",
      },
    });
  } else if (type === "timer") {
    toast(message, {
      icon: "👻",
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
      },
    });
  }
};

export const uuidToBytes = (uuid: string): Uint8Array => {
  const hex = uuid.replaceAll("-", "");
  if (hex.length !== 32) throw new Error("Invalid UUID format");

  return Uint8Array.from(
    hex.match(/.{1,2}/g)!.map((b) => Number.parseInt(b, 16))
  );
};

export const toBase64Url = (bytes: Uint8Array): string => {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCodePoint(b);
  });

  const base64 = btoa(binary);

  return base64.replaceAll("+", "-").replaceAll("/", "_").split("=")[0];
};

export const getShortenedUUID = (uuid: string): string => {
  const bytes = uuidToBytes(uuid);
  const base64 = toBase64Url(bytes);
  return base64.slice(0, 8);
};

export const calculateAverageRating = (
  ratings: Record<string, number>
): number => {
  if (!ratings || Object.keys(ratings).length === 0) return 0;
  const values = Object.values(ratings);
  return values.reduce((a, b) => a + b, 0) / values.length;
};

export const extractUserData = (user: User) => {
  return {
    uid: user.uid,
    displayName: user.displayName || "Usuário",
    email: user.email || "",
    isAnonymous: user.isAnonymous,
  };
};

export const validateEmailStepByStep = (email: string): string | null => {
  const trimmedEmail = email.trim().toLowerCase();

  // Etapa 1: Verificações básicas de estrutura
  if (trimmedEmail.length === 0) return "Email é obrigatório";
  if (trimmedEmail.length > 254)
    return "Email muito longo (máx. 254 caracteres)";
  if (!trimmedEmail.includes("@")) return "Email deve conter @";

  const parts = trimmedEmail.split("@");
  if (parts.length !== 2) return "Email deve conter apenas um @";

  const [localPart, domain] = parts;

  // Etapa 2: Validação da parte local
  if (localPart.length === 0) return "Parte antes do @ não pode estar vazia";
  if (localPart.length > 64) return "Parte antes do @ muito longa";
  if (localPart.startsWith(".") || localPart.endsWith(".")) {
    return "Parte antes do @ não pode começar ou terminar com ponto";
  }

  // Etapa 3: Validação do domínio
  if (domain.length === 0) return "Domínio não pode estar vazio";
  if (!domain.includes(".")) return "Domínio deve conter ponto";

  const domainParts = domain.split(".");
  const tld = domainParts[domainParts.length - 1];

  if (tld.length < 2) return "Domínio muito curto";
  if (domain.startsWith("-") || domain.endsWith("-")) {
    return "Domínio não pode começar ou terminar com hífen";
  }

  // Etapa 4: Verificação de domínios inválidos comuns
  const invalidDomains = ["example.com", "test.com", "localhost"];
  if (invalidDomains.includes(domain)) {
    return "Domínio de email não é válido";
  }

  return null;
};

export const validatePassword = (password: string) => {
  if (password.length < 6) {
    return "A senha deve ter pelo menos 6 caracteres";
  }
  if (!/[A-Z]/.test(password)) {
    return "A senha deve conter pelo menos uma letra maiúscula";
  }
  if (!/[0-9]/.test(password)) {
    return "A senha deve conter pelo menos um número";
  }
  return "";
};

export const getPasswordStrength = (pwd: string) => {
  if (pwd.length === 0)
    return {
      score: 0,
      label: "Vazia",
      color: "bg-gray-300",
      textColor: "text-gray-500",
    };

  let score = 0;
  const requirements = {
    length: pwd.length >= 6,
    lengthStrong: pwd.length >= 8,
    uppercase: /[A-Z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    special: /[^A-Za-z0-9]/.test(pwd),
  };

  if (requirements.length) score++;
  if (requirements.lengthStrong) score++;
  if (requirements.uppercase) score++;
  if (requirements.number) score++;
  if (requirements.special) score++;

  const strengthLevels = [
    { label: "Muito fraca", color: "bg-red-500", textColor: "text-red-600" },
    { label: "Fraca", color: "bg-red-400", textColor: "text-red-500" },
    { label: "Média", color: "bg-yellow-500", textColor: "text-yellow-600" },
    { label: "Forte", color: "bg-green-400", textColor: "text-green-600" },
    {
      label: "Muito forte",
      color: "bg-green-500",
      textColor: "text-green-700",
    },
  ];

  const level = strengthLevels[score - 1] || strengthLevels[0];

  return {
    score,
    label: level.label,
    color: level.color,
    textColor: level.textColor,
    requirements,
  };
};
