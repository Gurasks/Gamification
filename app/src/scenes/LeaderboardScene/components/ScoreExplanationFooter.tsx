import { Button } from "@/components/Button";
import { RATING_4_WEIGHT, RATING_3_WEIGHT, METADATA_AGREE_50_WEIGHT, METADATA_AGREE_70_WEIGHT, METADATA_AGREE_90_WEIGHT } from "@/services/gamificationServices";
import { Calculator, ChevronLeft, MessageSquare, RefreshCw, Star, Tag, Trophy } from "lucide-react";

interface ScoreExplanationFooterProps {
  loadLeaderboardData: (sessionId: string) => void;
  sessionId: string | null;
  handleGoBack: () => void;
}


const ScoreExplanationFooter = (
  { loadLeaderboardData, sessionId, handleGoBack }: ScoreExplanationFooterProps
) => {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-800">Sistema de Pontuação</h3>
          </div>

          <div className="space-y-4">
            {/* Resumo do Sistema */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-600" />
                Como a pontuação é calculada?
              </h4>
              <p className="text-sm text-gray-600 text-start">
                Sua pontuação total é a soma de 3 componentes principais:
              </p>
            </div>

            {/* Detalhamento dos Componentes */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Votos em Metadados */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-5 h-5 text-green-700" />
                  <h4 className="font-bold text-green-800">Votos em Metadados</h4>
                </div>
                <ul className="text-sm text-green-700 space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Concordância ≥ 90%: <strong>{METADATA_AGREE_90_WEIGHT} pts por voto</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Concordância ≥ 70%: <strong>{METADATA_AGREE_70_WEIGHT} pts por voto</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                    <span>Concordância ≥ 50%: <strong>{METADATA_AGREE_50_WEIGHT} pt por voto</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span>Concordância &lt; 50%: <strong>0 pontos</strong></span>
                  </li>
                </ul>
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="text-xs text-green-600 text-start italic">
                    * Apenas votos "concordo" pontuam
                  </p>
                  <p className="text-xs text-green-600 text-start italic">
                    ** Votos "Discordo" diminuem a pontuação
                  </p>
                </div>
              </div>

              {/* Avaliações de Cards */}
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-5 h-5 text-yellow-700" />
                  <h4 className="font-bold text-yellow-800">Avaliações de Cards</h4>
                </div>
                <ul className="text-sm text-yellow-700 space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Avaliação ≥ 4.0: <strong>{RATING_4_WEIGHT} pts por avaliação</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span>Avaliação ≥ 3.0: <strong>{RATING_3_WEIGHT} pts por avaliação</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span>Avaliação &lt; 3.0: <strong>0 pontos</strong></span>
                  </li>
                </ul>
                <div className="mt-3 pt-3 border-t border-yellow-200">
                  <p className="text-xs text-yellow-600 text-start italic">
                    * Média das suas avaliações determina o multiplicador
                  </p>
                </div>
              </div>

              {/* Comentários */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-5 h-5 text-blue-700" />
                  <h4 className="font-bold text-blue-800">Comentários</h4>
                </div>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Cada comentário: <strong>1 ponto fixo</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-start">Qualidade importa: <strong>Comentários relevantes</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                    <span>Participação ativa: <strong>Incentiva discussões</strong></span>
                  </li>
                </ul>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-blue-600 text-start italic">
                    * Todos os comentários válidos pontuam igualmente
                  </p>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  {/* Status */}
                  <div className="space-y-3">
                    <div className="mt-2 text-xs text-gray-500 text-start">
                      A pontuação é atualizada automaticamente a cada interação
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Última atualização:</span>
                      <span className="font-medium text-gray-800">
                        {new Date().toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    <Button
                      onClick={handleGoBack}
                      variant="outline-secondary"
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Voltar
                    </Button>

                    <Button
                      onClick={() => sessionId && loadLeaderboardData(sessionId)}
                      variant="primary"
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Atualizar Pontuação
                    </Button>
                  </div>
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