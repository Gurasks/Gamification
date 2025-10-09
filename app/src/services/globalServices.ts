import toast from "react-hot-toast";
import { CheckCircle, XCircle } from "lucide-react";
import React from "react";
import type { Refinement } from "../types/global";

export const returnTimerId = (
  teamName: string | undefined,
  refinement: Refinement
) => {
  return (teamName && refinement.teamTimers?.[teamName]) || "";
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
  const values = Object.values(ratings);
  return values.length > 0
    ? values.reduce((a, b) => a + b, 0) / values.length
    : 0;
};
