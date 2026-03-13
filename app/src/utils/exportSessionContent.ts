import { calculateAverageRating } from "@/services/globalServices";
import {
  getCategoryOption,
  getPriorityOption,
  getRequirementTypeOption,
} from "@/services/metadataOptionsService";
import {
  Card,
  CategoryType,
  PriorityLevel,
  RequirementType,
  Session,
} from "@/types/global";
import { TeamMetrics, UserStats } from "@/types/leaderboard";
import { getStyledIcon, ExportIcons, getMetadataIconSVG } from "./exportIcons";
import {
  calculateTotalScore,
  calculateUserGamificationPoints,
} from "@/services/gamificationServices";
import { TFunction } from "i18next";
import { getLocalizedTeamName } from "@/services/teamSelectionServices";

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

const generateReportHeader = (session: Session, t: TFunction): string => `
  <div class="report-header">
    <h1>
      ${getStyledIcon(ExportIcons.BAR_CHART, "#1e40af", 24)}
      ${t("export.fullSessionReport")}
    </h1>
    <div class="header-info">
      <div class="info-row">
        ${getStyledIcon(ExportIcons.FILE_TEXT, "#374151", 16)}
        <strong>${t("export.session")}:</strong> ${session?.title || t("common.na")}
      </div>
    </div>
  </div>
`;

const generateExecutiveSummary = (
  sortedData: UserStats[],
  teamMetrics: TeamMetrics[],
  allCards: Card[],
  t: TFunction,
): string => `
  <div class="section executive-summary">
    <h2>
      ${getStyledIcon(ExportIcons.TARGET, "#1e40af", 20)}
      ${t("export.executiveSummary")}
    </h2>
    <div class="summary-grid">
      <div class="summary-card">
        <h3>${ExportIcons.TROPHY} ${t("export.topParticipants")}</h3>
        <ol>
          ${sortedData
            .slice(0, 3)
            .map(
              (user) => `
            <li>${user.userName} - ${user.totalScore || 0} ${t("common.metrics.points")}</li>
          `,
            )
            .join("")}
        </ol>
      </div>
      <div class="summary-card">
        <h3>${ExportIcons.SHIELD} ${t("export.topTeams")}</h3>
        <ol>
          ${teamMetrics
            .slice(0, 3)
            .map(
              (team) => `
            <li>${team.teamName} - ${team.totalScore || 0} ${t("common.metrics.points")}</li>
          `,
            )
            .join("")}
        </ol>
      </div>
      <div class="summary-card">
        <h3>${ExportIcons.GRAPH} ${t("export.generalStats")}</h3>
        <ul>
          <li><strong>${
            ExportIcons.MESSAGE_SQUARE
          } ${t("export.totalComments")}:</strong> ${sortedData.reduce(
            (sum, user) => sum + user.totalComments,
            0,
          )}</li>
          <li><strong>${ExportIcons.STAR} ${t("export.avgRating")}:</strong> ${
            sortedData.length > 0
              ? (
                  sortedData.reduce(
                    (sum, user) => sum + user.averageRating,
                    0,
                  ) / sortedData.length
                ).toFixed(1)
              : 0
          }</li>
          <li><strong>${
            ExportIcons.GRAPH
          } ${t("export.suggestionsPerParticipant")}:</strong> ${
            sortedData.length > 0
              ? (allCards.length / sortedData.length).toFixed(1)
              : 0
          }</li>
        </ul>
      </div>
    </div>
  </div>
`;

const generateTeamMetricsTable = (
  teamMetrics: TeamMetrics[],
  t: TFunction,
): string => `
  <div class="section">
    <h2>${ExportIcons.TROPHY} ${t("export.teamMetrics")}</h2>
    <table class="metrics-table">
      <thead>
        <tr>
          <th>${t("export.position")}</th>
          <th>${t("common.entities.team")}</th>
          <th>${ExportIcons.USERS} ${t("common.entities.members")}</th>
          <th>${t("common.metrics.score")}</th>
          <th>${ExportIcons.MESSAGE_SQUARE} ${t("common.content.comments")}</th>
          <th>${ExportIcons.FILE_TEXT} ${t("common.content.suggestions")}</th>
          <th>${t("export.replies")}</th>
          <th>${ExportIcons.STAR} ${t("export.avgRating")}</th>
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
        `,
          )
          .join("")}
      </tbody>
    </table>
  </div>
`;

const generateGamificationData = (
  user: UserStats,
  allCards: Card[],
  t: TFunction,
): string => {
  const gamificationPoints = calculateUserGamificationPoints(
    allCards,
    user.userId,
  );
  const totalScore = calculateTotalScore(gamificationPoints);

  const agreementRate =
    gamificationPoints.metadataVotes.totalVotes > 0
      ? Math.round(
          (gamificationPoints.metadataVotes.agreeVotes /
            gamificationPoints.metadataVotes.totalVotes) *
            100,
        )
      : 0;

  return `
    <div class="gamification-section">
      <h4>${ExportIcons.ZAP} ${t("export.gamificationScore")}: ${totalScore} ${t("common.metrics.points")}</h4>
      <div class="gamification-grid">
        <div class="gamification-item">
          <strong>${ExportIcons.TAG} ${t("export.metadataVotes")}:</strong>
          ${gamificationPoints.metadataVotes.agreeVotes} ${t("export.agreed")} / ${
            gamificationPoints.metadataVotes.totalVotes
          } ${t("export.total")}
          (${agreementRate}%)
        </div>
        <div class="gamification-item">
          <strong>${ExportIcons.STAR} ${t("export.cardRatings")}:</strong>
          ${
            gamificationPoints.cardRatings.totalRatings
          } ${t("common.content.ratings")} (${t("export.avg")}: ${gamificationPoints.cardRatings.averageRating.toFixed(
            1,
          )})
        </div>
        <div class="gamification-item">
          <strong>${ExportIcons.MESSAGE_SQUARE} ${t("common.content.comments")}:</strong>
          ${gamificationPoints.comments.totalComments} ${t("export.commentsMade")}
        </div>
      </div>
    </div>
  `;
};

const generateUserRankingTable = (
  sortedData: UserStats[],
  session: Session,
  allCards: Card[],
  t: TFunction,
): string => `
  <div class="section">
    <h2>${ExportIcons.USERS} ${t("export.individualRanking")}</h2>
    <table class="ranking-table">
      <thead>
        <tr>
          <th>${t("export.position")}</th>
          <th>${t("export.user")}</th>
          <th>${ExportIcons.SHIELD} ${t("common.entities.team")}</th>
          <th>${t("export.totalScore")}</th>
          <th>${ExportIcons.MESSAGE_SQUARE} ${t("common.content.comments")}</th>
          <th>${ExportIcons.STAR} ${t("export.avgRating")}</th>
          <th>${t("export.replies")}</th>
          <th>${ExportIcons.FILE_TEXT} ${t("common.content.suggestions")}</th>
        </tr>
      </thead>
      <tbody>
        ${sortedData
          .map(
            (user, index) => `
          <tr class="${index < 3 ? "top-three" : ""}">
            <td class="rank">${`#${index + 1}`}</td>
            <td><strong>${user.userName}</strong></td>
            <td>${
              session?.teams?.[user.userId]
                ? getLocalizedTeamName(session.teams[user.userId], t)
                : t("common.na")
            }</td>
            <td class="score">${user.totalScore || 0}</td>
            <td>${user.totalComments}</td>
            <td class="rating">${user.averageRating.toFixed(1)}</td>
            <td>${user.totalReplies}</td>
            <td>${user.totalCardsCreated}</td>
          </tr>
          ${generateGamificationData(user, allCards, t)}
        `,
          )
          .join("")}
      </tbody>
    </table>
  </div>
`;

const generateCardMetadataHTML = (card: Card, t: TFunction): string => {
  let metadataHTML = "";

  const addMetadataBadge = (
    type: "priority" | "requirementType" | "category",
    value: string,
    label: string,
    color: string,
  ) => {
    const iconSVG = getMetadataIconSVG(type, value);
    const styledIcon = getStyledIcon(iconSVG, color, 14);
    metadataHTML += `<span class="metadata-badge ${type}-${value}">
      ${styledIcon} ${
        type === "priority"
          ? t("export.priority")
          : type === "requirementType"
            ? t("export.type")
            : t("export.category")
      }: ${label}
    </span>`;
  };

  if (card.priority) {
    const priorityOption = getPriorityOption(card.priority, t);
    if (priorityOption) {
      addMetadataBadge(
        "priority",
        card.priority,
        priorityOption.label,
        getPriorityColor(card.priority),
      );
    }
  }

  if (card.requirementType) {
    const requirementOption = getRequirementTypeOption(card.requirementType, t);
    if (requirementOption) {
      const requirementColor =
        card.requirementType === "design" ? "#831843" : "#1e40af";
      addMetadataBadge(
        "requirementType",
        card.requirementType,
        requirementOption.label,
        requirementColor,
      );
    }
  }

  if (card.category) {
    const categoryOption = getCategoryOption(card.category, t);
    if (categoryOption) {
      addMetadataBadge(
        "category",
        card.category,
        categoryOption.label,
        getCategoryColor(card.category),
      );
    }
  }

  if (card.estimatedEffort) {
    const clockIcon = getStyledIcon(ExportIcons.CLOCK, "#7c3aed", 14);
    metadataHTML += `<span class="metadata-badge effort">
      ${clockIcon} ${t("export.effort")}: ${card.estimatedEffort}
    </span>`;
  }

  if (card.metadataVotes) {
    const counts = countMetadataVotes(card.metadataVotes);
    const totalVotes = counts.agree + counts.disagree + counts.neutral;

    if (totalVotes > 0) {
      const agreementRate = Math.round((counts.agree / totalVotes) * 100);
      const icon = getAgreementIcon(agreementRate);
      metadataHTML += `<span class="metadata-badge votes">${icon} ${t("export.agreement")}: ${agreementRate}% (${counts.agree}/${totalVotes})</span>`;
    }
  }

  return metadataHTML
    ? `<div class="metadata-container">${metadataHTML}</div>`
    : "";
};

const countMetadataVotes = (metadataVotes: any) => {
  let agree = 0,
    disagree = 0,
    neutral = 0;

  Object.values(metadataVotes).forEach((votes: any) => {
    if (votes) {
      Object.values(votes).forEach((vote: any) => {
        if (vote === "agree") agree++;
        else if (vote === "disagree") disagree++;
        else if (vote === "neutral") neutral++;
      });
    }
  });

  return { agree, disagree, neutral };
};

const getAgreementIcon = (agreementRate: number) => {
  if (agreementRate >= 70) return ExportIcons.CHECK_CIRCLE;
  if (agreementRate >= 40) return ExportIcons.WARNING_TRIANGLE;
  return ExportIcons.X_CIRCLE;
};

const generateCardAnalysis = (allCards: Card[], t: TFunction): string => `
  <div class="section">
    <h2>${ExportIcons.LIGHTBULB} ${t("export.detailedAnalysis")} (${
      allCards.length
    })</h2>
    <div class="cards-analysis">
      ${allCards
        .map(
          (card, index) => `
        <div class="card-detail">
          <div class="card-header">
            <h3>${ExportIcons.FILE_TEXT} ${t("export.suggestion")} #${index + 1}</h3>
            <span class="card-id">ID: ${card.id.substring(0, 8)}...</span>
          </div>
          <div class="card-content">
            <p class="card-text">${card.text}</p>
            <div class="card-info">
              <div class="info-item">
                <strong>${ExportIcons.USERS} ${t("export.author")}:</strong> ${card.createdBy}
              </div>
              <div class="info-item">
                <strong>${ExportIcons.SHIELD} ${t("common.entities.team")}:</strong> ${getLocalizedTeamName(card.teamName, t)}
              </div>
              <div class="info-item">
                <strong>${ExportIcons.CALENDAR} ${t("export.date")}:</strong> ${new Date(
                  card.createdAt?.toDate() || Date.now(),
                ).toLocaleString()}
              </div>
              ${
                card.ratings
                  ? `<div class="info-item">
                    <strong>${
                      ExportIcons.STAR
                    } ${t("export.avgRating")}:</strong> ${calculateAverageRating(
                      card.ratings,
                    ).toFixed(1)}
                    (${Object.keys(card.ratings).length} ${t("common.content.ratings")})
                  </div>`
                  : ""
              }
            </div>

            <!-- Card Metadata -->
            ${generateCardMetadataHTML(card, t)}

            <!-- Comments -->
            ${
              card.comments && card.comments.length > 0
                ? `
              <div class="comments-section">
                <h4>${ExportIcons.MESSAGE_SQUARE} ${t("common.content.comments")} (${
                  card.comments.length
                }):</h4>
                ${card.comments
                  .map(
                    (comment: any) => `
                  <div class="comment">
                    <div class="comment-header">
                      <strong>${ExportIcons.USERS} ${comment.createdBy}</strong>
                      <span class="comment-date">${
                        ExportIcons.CALENDAR
                      } ${new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    <p class="comment-text">${comment.text}</p>
                  </div>
                `,
                  )
                  .join("")}
              </div>
            `
                : `<p class="no-comments">${t("export.noComments")}</p>`
            }
          </div>
        </div>
      `,
        )
        .join("")}
    </div>
  </div>
`;

const generateMetadataDistribution = (
  allCards: Card[],
  t: TFunction,
): string => {
  const priorityCounts: Record<string, number> = {};
  const requirementCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  let totalEffort = 0;

  allCards.forEach((card) => {
    if (card.priority) {
      priorityCounts[card.priority] = (priorityCounts[card.priority] || 0) + 1;
    }
    if (card.requirementType) {
      requirementCounts[card.requirementType] =
        (requirementCounts[card.requirementType] || 0) + 1;
    }
    if (card.category) {
      categoryCounts[card.category] = (categoryCounts[card.category] || 0) + 1;
    }
    if (card.estimatedEffort) {
      totalEffort += card.estimatedEffort;
    }
  });

  const generateDistributionList = (
    counts: Record<string, number>,
    type: "priority" | "requirementType" | "category",
  ) => {
    return Object.entries(counts)
      .map(([key, count]) => {
        const option =
          type === "priority"
            ? getPriorityOption(key as PriorityLevel, t)
            : type === "requirementType"
              ? getRequirementTypeOption(key as RequirementType, t)
              : getCategoryOption(key as CategoryType, t);

        const icon = getMetadataIconSVG(type, key);
        const percentage = ((count / allCards.length) * 100).toFixed(1);

        return `<li>${icon} ${
          option?.label || key
        }: ${count} (${percentage}%)</li>`;
      })
      .join("");
  };

  return `
    <div class="section">
      <h2>${ExportIcons.GRAPH} ${t("export.metadataDistribution")}</h2>
      <div class="metadata-distribution">
        <div class="distribution-grid">
          <div class="distribution-card">
            <h3>${ExportIcons.BAR_CHART} ${t("export.priorities")}</h3>
            <ul>
              ${generateDistributionList(priorityCounts, "priority")}
            </ul>
          </div>
          <div class="distribution-card">
            <h3>${ExportIcons.FILE_TEXT} ${t("export.requirementTypes")}</h3>
            <ul>
              ${generateDistributionList(requirementCounts, "requirementType")}
            </ul>
          </div>
          <div class="distribution-card">
            <h3>${ExportIcons.TAG} ${t("export.categories")}</h3>
            <ul>
              ${generateDistributionList(categoryCounts, "category")}
            </ul>
          </div>
          <div class="distribution-card">
            <h3>${ExportIcons.CLOCK} ${t("export.totalEffort")}</h3>
            <p><strong>${totalEffort}</strong></p>
            <p>${t("export.average")}: ${
              allCards.length > 0
                ? (totalEffort / allCards.length).toFixed(1)
                : 0
            } ${t("export.perSuggestion")}</p>
          </div>
        </div>
      </div>
    </div>
  `;
};

const generateReportFooter = (t: TFunction): string => `
  <div class="report-footer">
    <p>${ExportIcons.CHECK_CIRCLE} ${t("export.generatedBy")}</p>
  </div>
`;

export const generateExportContent = (
  session: Session,
  teamMetrics: TeamMetrics[],
  sortedData: UserStats[],
  allCards: Card[],
  t: TFunction,
): string => {
  const sections = [
    generateReportHeader(session, t),
    generateExecutiveSummary(sortedData, teamMetrics, allCards, t),
    generateTeamMetricsTable(teamMetrics, t),
    generateUserRankingTable(sortedData, session, allCards, t),
    generateCardAnalysis(allCards, t),
    generateMetadataDistribution(allCards, t),
    generateReportFooter(t),
  ];

  return `
    <div class="report-container">
      ${sections.join("\n")}
    </div>
  `;
};
