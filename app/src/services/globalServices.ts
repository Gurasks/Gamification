import toast from "react-hot-toast";
import { CheckCircle, XCircle } from "lucide-react";
import React from "react";
import type { Session } from "../types/global";
import { User } from "firebase/auth";

export const returnTimerId = (
  teamName: string | undefined,
  session: Session
) => {
  return (teamName && session.teamTimers?.[teamName]) || "";
};

export const returnToastMessage = (message: string, type: string) => {
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
  } else if (type === "sucess") {
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
  const hex = uuid.replace(/-/g, "");
  if (hex.length !== 32) throw new Error("Invalid UUID format");
  return Uint8Array.from(hex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
};

// Base64-url encode for browser (no Buffer)
export const toBase64Url = (bytes: Uint8Array): string => {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  let base64 = btoa(binary); // standard base64
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); // url-safe
};

export const getShortenedUUID = (uuid: string): string => {
  const bytes = uuidToBytes(uuid);
  const base64 = toBase64Url(bytes);
  return base64.slice(0, 8); // take first 8 chars
};

export const calculateAverageRating = (
  ratings: Record<string, number>
): number => {
  if (!ratings || Object.keys(ratings).length === 0) return 0;
  const values = Object.values(ratings);
  return values.length > 0
    ? values.reduce((a, b) => a + b, 0) / values.length
    : 0;
};

export const extractUserData = (user: User) => {
  return {
    uid: user.uid,
    displayName: user.displayName || "Usuário",
    email: user.email || "",
    isAnonymous: user.isAnonymous || false,
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
