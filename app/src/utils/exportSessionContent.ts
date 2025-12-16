import { calculateAverageRating } from "@/services/globalServices";
import metadataService from "@/services/metadataOptionsService";
import { Card, Session } from "@/types/global";
import { TeamMetrics, UserStats } from "@/types/leaderboard";
import { getStyledIcon, ExportIcons, getMetadataIconSVG } from "./exportIcons";
import {
  calculateTotalScore,
  calculateUserGamificationPoints,
} from "@/services/gamificationServices";

const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    baixa: "#065f46",
    media: "#92400e",
    alta: "#991b1b",
    critica: "#86198f",
  };
  return colors[priority] || "#374151";
};

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    melhoria: "#92400e",
    bug: "#991b1b",
    feature: "#1e40af",
    documentacao: "#0369a1",
    pergunta: "#374151",
    feedback: "#166534",
  };
  return colors[category] || "#374151";
};

const formatGamificationData = (user: UserStats, allCards: Card[]): string => {
  const gamificationPoints = calculateUserGamificationPoints(
    allCards,
    user.userId
  );
  const totalScore = calculateTotalScore(gamificationPoints);

  return `
    <div class="gamification-section">
      <h4>${ExportIcons.ZAP} Pontuação de Gamificação: ${totalScore} pontos</h4>
      <div class="gamification-grid">
        <div class="gamification-item">
          <strong>${ExportIcons.TAG} Votos em Metadados:</strong>
          ${gamificationPoints.metadataVotes.agreeVotes} concordados / ${
    gamificationPoints.metadataVotes.totalVotes
  } totais
          (${
            gamificationPoints.metadataVotes.totalVotes > 0
              ? Math.round(
                  (gamificationPoints.metadataVotes.agreeVotes /
                    gamificationPoints.metadataVotes.totalVotes) *
                    100
                )
              : 0
          }%)
        </div>
        <div class="gamification-item">
          <strong>${ExportIcons.STAR} Avaliações de Cards:</strong>
          ${
            gamificationPoints.cardRatings.totalRatings
          } avaliações (média: ${gamificationPoints.cardRatings.averageRating.toFixed(
    1
  )})
        </div>
        <div class="gamification-item">
          <strong>${ExportIcons.MESSAGE_SQUARE} Comentários:</strong>
          ${gamificationPoints.comments.totalComments} comentários feitos
        </div>
      </div>
    </div>
  `;
};

const formatCardMetadata = (card: Card): string => {
  let metadataHTML = "";

  if (card.priority) {
    const priorityOption = metadataService.getPriorityOption(card.priority);
    if (priorityOption) {
      const iconSVG = getMetadataIconSVG("priority", card.priority);
      const color = getPriorityColor(card.priority);
      const styledIcon = getStyledIcon(iconSVG, color, 14);
      metadataHTML += `<span class="metadata-badge priority-${card.priority}">
        ${styledIcon} Prioridade: ${priorityOption.label}
      </span>`;
    }
  }

  if (card.requirementType) {
    const requirementOption = metadataService.getRequirementTypeOption(
      card.requirementType
    );
    if (requirementOption) {
      const iconSVG = getMetadataIconSVG(
        "requirementType",
        card.requirementType
      );
      const requirementColor =
        card.requirementType === "design" ? "#831843" : "#1e40af";
      const styledIcon = getStyledIcon(iconSVG, requirementColor, 14);
      metadataHTML += `<span class="metadata-badge requirement-${card.requirementType}">
        ${styledIcon} Tipo: ${requirementOption.label}
      </span>`;
    }
  }

  if (card.category) {
    const categoryOption = metadataService.getCategoryOption(card.category);
    if (categoryOption) {
      const iconSVG = getMetadataIconSVG("category", card.category);
      const color = getCategoryColor(card.category);
      const styledIcon = getStyledIcon(iconSVG, color, 14);
      metadataHTML += `<span class="metadata-badge category-${card.category}">
        ${styledIcon} Categoria: ${categoryOption.label}
      </span>`;
    }
  }

  if (card.estimatedEffort) {
    const clockIcon = getStyledIcon(ExportIcons.CLOCK, "#7c3aed", 14);
    metadataHTML += `<span class="metadata-badge effort">
      ${clockIcon} Esforço: ${card.estimatedEffort}
    </span>`;
  }

  if (card.metadataVotes) {
    let agreeCount = 0,
      disagreeCount = 0,
      neutralCount = 0;

    Object.values(card.metadataVotes).forEach((votes) => {
      if (votes) {
        Object.values(votes).forEach((vote) => {
          if (vote === "agree") agreeCount++;
          else if (vote === "disagree") disagreeCount++;
          else if (vote === "neutral") neutralCount++;
        });
      }
    });

    const totalVotes = agreeCount + disagreeCount + neutralCount;
    if (totalVotes > 0) {
      const agreementRate = Math.round((agreeCount / totalVotes) * 100);
      const icon =
        agreementRate >= 70
          ? ExportIcons.CHECK_CIRCLE
          : agreementRate >= 40
          ? ExportIcons.WARNING_TRIANGLE
          : ExportIcons.X_CIRCLE;
      metadataHTML += `<span class="metadata-badge votes">${icon} Concordância: ${agreementRate}% (${agreeCount}/${totalVotes})</span>`;
    }
  }

  return metadataHTML
    ? `<div class="metadata-container">${metadataHTML}</div>`
    : "";
};

export const generateExportContent = (
  session: Session,
  teamMetrics: TeamMetrics[],
  sortedData: UserStats[],
  allCards: Card[]
) => {
  return `
    <div class="report-container">
      <!-- Cabeçalho do Relatório -->
      <div class="report-header">
        <h1>
          ${getStyledIcon(ExportIcons.BAR_CHART, "#1e40af", 24)}
          Relatório Completo da Sessão
        </h1>
        <div class="header-info">
          <div class="info-row">
            ${getStyledIcon(ExportIcons.FILE_TEXT, "#374151", 16)}
            <strong>Sessão:</strong> ${session?.title || "N/A"}
          </div>
          <!-- ... resto do conteúdo ... -->
        </div>
      </div>

      <!-- Sumário Executivo -->
      <div class="section executive-summary">
        <h2>
          ${getStyledIcon(ExportIcons.TARGET, "#1e40af", 20)}
          Sumário Executivo
        </h2>
        <div class="summary-grid">
          <div class="summary-card">
            <h3>${ExportIcons.TROPHY} Top 3 Participantes</h3>
            <ol>
              ${sortedData
                .slice(0, 3)
                .map(
                  (user) => `
                <li>${user.userName} - ${user.totalScore || 0} pontos</li>
              `
                )
                .join("")}
            </ol>
          </div>
          <div class="summary-card">
            <h3>${ExportIcons.SHIELD} Top 3 Times</h3>
            <ol>
              ${teamMetrics
                .slice(0, 3)
                .map(
                  (team) => `
                <li>${team.teamName} - ${team.totalScore || 0} pontos</li>
              `
                )
                .join("")}
            </ol>
          </div>
          <div class="summary-card">
            <h3>${ExportIcons.GRAPH} Estatísticas Gerais</h3>
            <ul>
              <li><strong>${
                ExportIcons.MESSAGE_SQUARE
              } Total de Comentários:</strong> ${sortedData.reduce(
    (sum, user) => sum + user.totalComments,
    0
  )}</li>
              <li><strong>${ExportIcons.STAR} Avaliação Média:</strong> ${
    sortedData.length > 0
      ? (
          sortedData.reduce((sum, user) => sum + user.averageRating, 0) /
          sortedData.length
        ).toFixed(1)
      : 0
  }</li>
              <li><strong>${
                ExportIcons.GRAPH
              } Sugestões por Participante:</strong> ${
    sortedData.length > 0 ? (allCards.length / sortedData.length).toFixed(1) : 0
  }</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Métricas por Time -->
      <div class="section">
        <h2>${ExportIcons.TROPHY} Métricas por Time</h2>
        <table class="metrics-table">
          <thead>
            <tr>
              <th>Posição</th>
              <th>Time</th>
              <th>${ExportIcons.USERS} Membros</th>
              <th>Pontuação</th>
              <th>${ExportIcons.MESSAGE_SQUARE} Comentários</th>
              <th>${ExportIcons.FILE_TEXT} Sugestões</th>
              <th>Respostas</th>
              <th>${ExportIcons.STAR} Nota Média</th>
            </tr>
          </thead>
          <tbody>
            ${teamMetrics
              .map(
                (team, index) => `
              <tr class="${index < 3 ? "top-three" : ""}">
                <td class="rank">${`#${index + 1}`}</td>
                <td><strong>${ExportIcons.SHIELD} ${team.teamName}</strong></td>
                <td>${team.totalMembers}</td>
                <td class="score">${team.totalScore || 0}</td>
                <td>${team.totalComments}</td>
                <td>${team.totalCards}</td>
                <td>${team.totalReplies}</td>
                <td class="rating">${team.averageRating}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>

      <!-- Classificação Individual com Gamificação -->
      <div class="section">
        <h2>${ExportIcons.USERS} Classificação Individual</h2>
        <table class="ranking-table">
          <thead>
            <tr>
              <th>Posição</th>
              <th>Usuário</th>
              <th>${ExportIcons.SHIELD} Time</th>
              <th>Pontuação Total</th>
              <th>${ExportIcons.MESSAGE_SQUARE} Comentários</th>
              <th>${ExportIcons.STAR} Nota Média</th>
              <th>Respostas</th>
              <th>${ExportIcons.FILE_TEXT} Sugestões</th>
            </tr>
          </thead>
          <tbody>
            ${sortedData
              .map(
                (user, index) => `
              <tr class="${index < 3 ? "top-three" : ""}">
                <td class="rank">${`#${index + 1}`}</td>
                <td><strong>${user.userName}</strong></td>
                <td>${session?.teams?.[user.userId] || "N/A"}</td>
                <td class="score">${user.totalScore || 0}</td>
                <td>${user.totalComments}</td>
                <td class="rating">${user.averageRating.toFixed(1)}</td>
                <td>${user.totalReplies}</td>
                <td>${user.totalCardsCreated}</td>
              </tr>
              ${formatGamificationData(user, allCards)}
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>

      <!-- Análise Detalhada de Sugestões -->
      <div class="section">
        <h2>${ExportIcons.LIGHTBULB} Análise Detalhada de Sugestões (${
    allCards.length
  })</h2>
        <div class="cards-analysis">
          ${allCards
            .map(
              (card, index) => `
            <div class="card-detail">
              <div class="card-header">
                <h3>${ExportIcons.FILE_TEXT} Sugestão #${index + 1}</h3>
                <span class="card-id">ID: ${card.id.substring(0, 8)}...</span>
              </div>
              <div class="card-content">
                <p class="card-text">${card.text}</p>
                <div class="card-info">
                  <div class="info-item">
                    <strong>${ExportIcons.USERS} Autor:</strong> ${
                card.createdBy
              }
                  </div>
                  <div class="info-item">
                    <strong>${ExportIcons.SHIELD} Time:</strong> ${
                card.teamName
              }
                  </div>
                  <div class="info-item">
                    <strong>${ExportIcons.CALENDAR} Data:</strong> ${new Date(
                card.createdAt?.toDate() || Date.now()
              ).toLocaleString("pt-BR")}
                  </div>
                  ${
                    card.ratings
                      ? `<div class="info-item">
                        <strong>${
                          ExportIcons.STAR
                        } Avaliação Média:</strong> ${calculateAverageRating(
                          card.ratings
                        ).toFixed(1)}
                        (${Object.keys(card.ratings).length} avaliações)
                      </div>`
                      : ""
                  }
                </div>

                <!-- Metadados do Card -->
                ${formatCardMetadata(card)}

                <!-- Comentários -->
                ${
                  card.comments && card.comments.length > 0
                    ? `
                  <div class="comments-section">
                    <h4>${ExportIcons.MESSAGE_SQUARE} Comentários (${
                        card.comments.length
                      }):</h4>
                    ${card.comments
                      .map(
                        (comment: any) => `
                      <div class="comment">
                        <div class="comment-header">
                          <strong>${ExportIcons.USERS} ${
                          comment.createdBy
                        }</strong>
                          <span class="comment-date">${
                            ExportIcons.CALENDAR
                          } ${new Date(comment.createdAt).toLocaleString(
                          "pt-BR"
                        )}</span>
                        </div>
                        <p class="comment-text">${comment.text}</p>
                      </div>
                    `
                      )
                      .join("")}
                  </div>
                `
                    : '<p class="no-comments">Nenhum comentário</p>'
                }
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>

      <!-- Distribuição de Metadados -->
      <div class="section">
        <h2>${ExportIcons.GRAPH} Distribuição de Metadados</h2>
        <div class="metadata-distribution">
          ${(() => {
            const priorityCounts: Record<string, number> = {};
            const requirementCounts: Record<string, number> = {};
            const categoryCounts: Record<string, number> = {};
            let totalEffort = 0;

            allCards.forEach((card) => {
              if (card.priority)
                priorityCounts[card.priority] =
                  (priorityCounts[card.priority] || 0) + 1;
              if (card.requirementType)
                requirementCounts[card.requirementType] =
                  (requirementCounts[card.requirementType] || 0) + 1;
              if (card.category)
                categoryCounts[card.category] =
                  (categoryCounts[card.category] || 0) + 1;
              if (card.estimatedEffort) totalEffort += card.estimatedEffort;
            });

            return `
              <div class="distribution-grid">
                <div class="distribution-card">
                  <h3>${ExportIcons.BAR_CHART} Prioridades</h3>
                  <ul>
                    ${Object.entries(priorityCounts)
                      .map(([priority, count]) => {
                        const option = metadataService.getPriorityOption(
                          priority as any
                        );
                        const icon = getMetadataIconSVG("priority", priority);
                        return `<li>${icon} ${
                          option?.label || priority
                        }: ${count} (${(
                          (count / allCards.length) *
                          100
                        ).toFixed(1)}%)</li>`;
                      })
                      .join("")}
                  </ul>
                </div>
                <div class="distribution-card">
                  <h3>${ExportIcons.FILE_TEXT} Tipos de Requisito</h3>
                  <ul>
                    ${Object.entries(requirementCounts)
                      .map(([type, count]) => {
                        const option = metadataService.getRequirementTypeOption(
                          type as any
                        );
                        const icon = getMetadataIconSVG(
                          "requirementType",
                          type
                        );
                        return `<li>${icon} ${
                          option?.label || type
                        }: ${count} (${(
                          (count / allCards.length) *
                          100
                        ).toFixed(1)}%)</li>`;
                      })
                      .join("")}
                  </ul>
                </div>
                <div class="distribution-card">
                  <h3>${ExportIcons.TAG} Categorias</h3>
                  <ul>
                    ${Object.entries(categoryCounts)
                      .map(([category, count]) => {
                        const option = metadataService.getCategoryOption(
                          category as any
                        );
                        const icon = getMetadataIconSVG("category", category);
                        return `<li>${icon} ${
                          option?.label || category
                        }: ${count} (${(
                          (count / allCards.length) *
                          100
                        ).toFixed(1)}%)</li>`;
                      })
                      .join("")}
                  </ul>
                </div>
                <div class="distribution-card">
                  <h3>${ExportIcons.CLOCK} Esforço Total</h3>
                  <p><strong>${totalEffort}</strong></p>
                  <p>Média: ${
                    allCards.length > 0
                      ? (totalEffort / allCards.length).toFixed(1)
                      : 0
                  } por sugestão</p>
                </div>
              </div>
            `;
          })()}
        </div>
      </div>

      <!-- Footer do Relatório -->
      <div class="report-footer">
        <p>${
          ExportIcons.CHECK_CIRCLE
        } Relatório gerado automaticamente pelo Singular</p>
      </div>
    </div>
  `;
};
