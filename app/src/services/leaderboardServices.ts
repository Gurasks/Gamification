import { generateExportContent } from "@/utils/exportSessionContent";
import { getEnhancedStyles } from "@/utils/exportSessionStyles";
import type { Card, Session } from "../types/global";
import type {
  TeamMetrics,
  UserContributions,
  UserStats,
} from "../types/leaderboard";

export const exportToPDF = (
  session: Session,
  teamMetrics: TeamMetrics[],
  sortedData: UserStats[],
  allCards: Card[]
) => {
  const printContent = generateExportContent(
    session,
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
          <title>Relatório Completo - ${session?.title || "Sessão"}</title>
          <meta charset="UTF-8">
          ${getEnhancedStyles()}
        </head>
        <body>
          ${printContent}
          <script>
            // Auto-print após carregamento
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
};

export const exportToDOC = (
  session: Session,
  teamMetrics: TeamMetrics[],
  sortedData: UserStats[],
  allCards: Card[]
) => {
  const content = generateExportContent(
    session,
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
          <title>Relatório Completo - ${session?.title || "Sessão"}</title>
          ${getEnhancedStyles()}
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
  link.download = `relatorio-completo-${
    session?.title?.toLowerCase().replace(/\s+/g, "-") || "sessao"
  }-${new Date().toISOString().split("T")[0]}.doc`;
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
