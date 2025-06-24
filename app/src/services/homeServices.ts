import toast from "react-hot-toast";

export const returnToastMessage = (message: string, type: string) => {
  if (type === "error") {
    toast.error(message, {
      duration: 5000, // Tempo de exibição do toast (em milissegundos)
    });
  } else if (type === "success") {
    toast.success(message, {
      duration: 5000, // Tempo de exibição do toast (em milissegundos)
    });
  }
};

export const handleReponse = (response: string) => {
  let message =
    "O refinamento que você tentou acessar não existe. Verifique se o ID está correto.";
  let type = "error";

  // Se o usuário já está no refinamento ou entrou com sucesso
  if (response === "inRefinement" || response === "success") {
    return true;
  }

  // Se o refinamento não foi encontrado
  if (response === "notFound") {
  }

  // Se o usuário não está no refinamento
  if (response === "started") {
    message =
      "Este refinamento já foi iniciado. Você não pode mais participar.";
  }

  returnToastMessage(message, type);
  return false;
};
