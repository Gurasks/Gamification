import { returnToastMessage } from "./globalServices";

export const handleReponse = (response: string) => {
  let message =
    "A sessão que você tentou acessar não existe. Verifique se o ID está correto.";
  let type = "error";

  if (response === "inSession" || response === "success") {
    return true;
  }

  if (response === "notFound") {
  }

  if (response === "started") {
    message = "Esta sessão já foi iniciada. Você não pode mais participar.";
  }

  returnToastMessage(message, type);
  return false;
};
