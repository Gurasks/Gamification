import { formatTimeLeaderboard } from "@/services/leaderboardServices";
import { Card, TeamTimer } from "@/types/global";
import { TeamMetrics, TeamTimeData, UserContributions } from "@/types/leaderboard";
import { Clock } from "lucide-react";

interface TimeEfficiencySectionProps {
  teamTimers: TeamTimeData[],
  allCards: Card[]
}

const TimeEfficiencySection: React.FC<TimeEfficiencySectionProps> = (
  { teamTimers, allCards }
) => {
  if (teamTimers.length === 0) return null;

  const fastestTeam = teamTimers.reduce((prev, current) =>
    (prev.totalTime < current.totalTime) ? prev : current
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-green-600" />
        Eficiência de Tempo por Time
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {teamTimers.map((team) => {
          const efficiency = Math.round(team.efficiency)

          return (
            <div key={team.teamName} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">{team.teamName}</span>
                {team.teamName === fastestTeam.teamName && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    Menor Tempo
                  </span>
                )}
              </div>

              <div className="text-sm text-gray-600 mb-2">
                Tempo total: {formatTimeLeaderboard(team.totalTime)}
              </div>

              <div className="text-sm text-gray-600 mb-2">
                Cards: {allCards.filter(c => c.teamName === team.teamName).length}
              </div>

              <div className="mt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Eficiência:</span>
                  <span className="font-semibold">{efficiency}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, efficiency)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TimeEfficiencySection;