import { useLanguage } from "@/hooks/useLanguage";
import {
  METADATA_AGREE_50_WEIGHT,
  METADATA_AGREE_70_WEIGHT,
  METADATA_AGREE_90_WEIGHT,
  RATING_3_WEIGHT,
  RATING_4_WEIGHT
} from "@/services/gamificationServices";
import {
  Calculator,
  Clock,
  MessageSquare,
  Star,
  Tag,
  Trophy
} from "lucide-react";

const ScoreExplanationFooter = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-800">{t('scoreExplanation.title')}</h3>
          </div>

          <div className="space-y-4">
            {/* System Summary */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-600" />
                {t('scoreExplanation.howItWorks')}
              </h4>
              <p className="text-sm text-gray-600 text-start">
                {t('scoreExplanation.totalScoreDescription')}
              </p>
            </div>

            {/* Component Details */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Metadata Votes */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-5 h-5 text-green-700" />
                  <h4 className="font-bold text-green-800">{t('scoreExplanation.metadataVotes')}</h4>
                </div>
                <ul className="text-sm text-green-700 space-y-2">
                  <li className="flex items-center text-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{t('scoreExplanation.agreement90', { points: METADATA_AGREE_90_WEIGHT })}</span>
                  </li>
                  <li className="flex items-center text-start gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>{t('scoreExplanation.agreement70', { points: METADATA_AGREE_70_WEIGHT })}</span>
                  </li>
                  <li className="flex items-center text-start gap-2">
                    <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                    <span>{t('scoreExplanation.agreement50', { points: METADATA_AGREE_50_WEIGHT })}</span>
                  </li>
                  <li className="flex items-center text-start gap-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span>{t('scoreExplanation.agreementLow')}</span>
                  </li>
                </ul>
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="text-xs text-green-600 text-start italic">
                    {t('scoreExplanation.agreeOnly')}
                  </p>
                  <p className="text-xs text-green-600 text-start italic">
                    {t('scoreExplanation.disagreePenalty')}
                  </p>
                </div>
              </div>

              {/* Card Ratings */}
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-5 h-5 text-yellow-700" />
                  <h4 className="font-bold text-yellow-800">{t('scoreExplanation.cardRatings')}</h4>
                </div>
                <ul className="text-sm text-yellow-700 space-y-2">
                  <li className="flex items-center text-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>{t('scoreExplanation.rating4', { points: RATING_4_WEIGHT })}</span>
                  </li>
                  <li className="flex items-center text-start gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span>{t('scoreExplanation.rating3', { points: RATING_3_WEIGHT })}</span>
                  </li>
                  <li className="flex items-center text-start gap-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span>{t('scoreExplanation.ratingLow')}</span>
                  </li>
                </ul>
                <div className="mt-3 pt-3 border-t border-yellow-200">
                  <p className="text-xs text-yellow-600 text-start italic">
                    {t('scoreExplanation.ratingMultiplier')}
                  </p>
                </div>
              </div>

              {/* Comments */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-5 h-5 text-blue-700" />
                  <h4 className="font-bold text-blue-800">{t('common.content.comments')}</h4>
                </div>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li className="flex items-center text-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>{t('scoreExplanation.commentFixed')}</span>
                  </li>
                  <li className="flex items-center text-start gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-start">{t('scoreExplanation.commentQuality')}</span>
                  </li>
                  <li className="flex items-center text-start gap-2">
                    <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                    <span>{t('scoreExplanation.commentParticipation')}</span>
                  </li>
                </ul>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-blue-600 text-start italic">
                    {t('scoreExplanation.commentEqual')}
                  </p>
                </div>
              </div>

              {/* Time Efficiency */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-blue-700" />
                  <h4 className="font-bold text-blue-800">{t('scoreExplanation.timeEfficiency')}</h4>
                </div>

                <ul className="text-sm text-blue-700 space-y-2">
                  <li className="flex text-start items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <span>
                      {t('scoreExplanation.timeEfficiencyDesc')}
                    </span>
                  </li>

                  <li className="flex text-start items-start gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                    <span>
                      {t('scoreExplanation.fastestTeam')}
                    </span>
                  </li>

                  <li className="flex text-start items-start gap-2">
                    <div className="w-2 h-2 bg-blue-300 rounded-full mt-2"></div>
                    <span>
                      {t('scoreExplanation.slowTeams')}
                    </span>
                  </li>

                  <li className="flex text-start items-start gap-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                    <span>
                      {t('scoreExplanation.bonusAdjusted')}
                    </span>
                  </li>
                </ul>

                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-blue-600 text-start italic">
                    {t('scoreExplanation.efficiencyRelative')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreExplanationFooter;