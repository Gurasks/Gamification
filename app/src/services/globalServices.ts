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
