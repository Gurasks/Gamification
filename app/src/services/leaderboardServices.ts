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

  const sessionTitle = session?.title || "sessao";
  const safeTitle = sessionTitle.toLowerCase().replaceAll(" ", "-");
  const dateStr = new Date().toISOString().split("T")[0];
  const fileName = `relatorio-completo-${safeTitle}-${dateStr}`;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${fileName}</title>
          <meta charset="UTF-8">
          ${getEnhancedStyles()}
          <style>
            @media print {
              @page {
                size: A4;
                margin: 20mm;
              }
              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          </style>
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

            // Fallback para fechar a janela se a impressão não ocorrer
            setTimeout(() => {
              if (!window.closed) {
                window.close();
              }
            }, 10000);
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

  const sessionTitle = session?.title || "sessao";
  const safeTitle = sessionTitle.toLowerCase().replaceAll(" ", "-");
  const dateStr = new Date().toISOString().split("T")[0];
  const fileName = `relatorio-completo-${safeTitle}-${dateStr}`;

  link.download = `${fileName}.doc`;
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

export const formatTimeLeaderboard = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};
