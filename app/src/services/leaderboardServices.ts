import type { Card, Refinement } from "../types/global";
import type {
  TeamMetrics,
  UserContributions,
  UserStats,
} from "../types/leaderboard";
import { calculateAverageRating } from "./globalServices";

export const generateExportContent = (
  refinement: Refinement,
  teamMetrics: TeamMetrics[],
  sortedData: UserStats[],
  allCards: Card[]
) => {
  return `
      <h1>Relatório da Sessão: ${refinement?.title || "N/A"}</h1>
      <p><strong>Descrição:</strong> ${refinement?.description || "N/A"}</p>
      <p><strong>Data de Geração:</strong> ${new Date().toLocaleString()}</p>

      <div class="section">
        <h2>Métricas por Time</h2>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Membros</th>
              <th>Comentários</th>
              <th>Sugestões</th>
              <th>Respostas</th>
              <th>Nota Média</th>
            </tr>
          </thead>
          <tbody>
            ${teamMetrics
              .map(
                (team) => `
              <tr>
                <td>${team.teamName}</td>
                <td>${team.totalMembers}</td>
                <td>${team.totalComments}</td>
                <td>${team.totalCards}</td>
                <td>${team.totalReplies}</td>
                <td>${team.averageRating}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>Classificação Individual</h2>
        <table>
          <thead>
            <tr>
              <th>Posição</th>
              <th>Usuário</th>
              <th>Comentários</th>
              <th>Nota Média</th>
              <th>Respostas</th>
              <th>Sugestões</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            ${sortedData
              .map(
                (user, index) => `
              <tr>
                <td>#${index + 1}</td>
                <td>${user.userName}</td>
                <td>${user.totalComments}</td>
                <td>${user.averageRating}</td>
                <td>${user.totalReplies}</td>
                <td>${user.totalCardsCreated}</td>
                <td>${refinement?.teams?.[user.userId] || "N/A"}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>Sugestões e Comentários</h2>
        ${allCards
          .map(
            (card) => `
          <div class="card">
            <h3>Sugestão: ${card.text}</h3>
            <p><strong>Autor:</strong> ${
              card.createdBy
            } | <strong>Time:</strong> ${
              card.teamName
            } | <strong>Data:</strong> ${new Date(
              card.createdAt?.toDate() || Date.now()
            ).toLocaleString()}</p>
            ${
              card.ratings
                ? `<p><strong>Avaliação Média:</strong> ${calculateAverageRating(
                    card.ratings
                  ).toFixed(1)}</p>`
                : ""
            }
            ${
              card.comments && card.comments.length > 0
                ? `
              <h4>Comentários (${card.comments.length}):</h4>
              ${card.comments
                .map(
                  (comment: any) => `
                <div class="comment">
                  <p><strong>${comment.createdBy}:</strong> ${comment.text}</p>
                  <small>${new Date(comment.createdAt).toLocaleString()}</small>
                </div>
              `
                )
                .join("")}
            `
                : "<p>Nenhum comentário</p>"
            }
          </div>
        `
          )
          .join("")}
      </div>
    `;
};

export const exportToPDF = (
  refinement: Refinement,
  teamMetrics: TeamMetrics[],
  sortedData: UserStats[],
  allCards: Card[]
) => {
  const printContent = generateExportContent(
    refinement,
    teamMetrics,
    sortedData,
    allCards
  );
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Relatório - ${refinement?.title || "Sessão"}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
              .section { margin-bottom: 30px; }
              table { width: 100%; border-collapse: collapse; margin: 10px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; }
              .card { border: 1px solid #ccc; margin: 10px 0; padding: 10px; }
              .comment { margin-left: 20px; padding: 5px; border-left: 2px solid #007bff; }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
    printWindow.document.close();
    printWindow.print();
  }
};

export const exportToDOC = (
  refinement: Refinement,
  teamMetrics: TeamMetrics[],
  sortedData: UserStats[],
  allCards: Card[]
) => {
  const content = generateExportContent(
    refinement,
    teamMetrics,
    sortedData,
    allCards
  );
  const blob = new Blob(
    [
      `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Relatório - ${refinement?.title || "Sessão"}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .section { margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .card { border: 1px solid #ccc; margin: 10px 0; padding: 10px; }
            .comment { margin-left: 20px; padding: 5px; border-left: 2px solid #007bff; }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `,
    ],
    { type: "application/msword" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `relatorio-${refinement?.title || "sessao"}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const openUserContributions = (
  user: UserStats,
  allCards: Card[],
  setSelectedUser: React.Dispatch<
    React.SetStateAction<UserContributions | null>
  >,
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const cardsCreated = allCards.filter(
    (card) => card.createdById === user.userId
  );

  const userComments: Array<{ card: Card; comment: any }> = [];
  allCards.forEach((card) => {
    if (card.comments) {
      card.comments.forEach((comment: any) => {
        if (comment.createdById === user.userId) {
          userComments.push({ card, comment });
        }
      });
    }
  });

  setSelectedUser({
    user,
    cardsCreated,
    comments: userComments,
  });
  setIsModalOpen(true);
};

export const toggleTeamExpansion = (
  teamName: string,
  expandedTeams: Set<string>,
  setExpandedTeams: React.Dispatch<React.SetStateAction<Set<string>>>
) => {
  const newExpanded = new Set(expandedTeams);
  if (newExpanded.has(teamName)) {
    newExpanded.delete(teamName);
  } else {
    newExpanded.add(teamName);
  }
  setExpandedTeams(newExpanded);
};
