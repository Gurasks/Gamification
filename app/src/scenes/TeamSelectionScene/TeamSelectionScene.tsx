import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createUnsubscribeMembers } from '../../hooks/firestoreUnsubscriber';
import type { Refinement, UserData } from '../../types/global';
import ShareButton from '../../components/ShareButton';
import CollapsibleDescriptionArea from '../../components/CollapsibleDescriptionArea';
import ExitConfirmationModal from '../../components/ExitConfirmationModal';
import SelectionMethodChooser from './components/SelectionMethodChooser';
import OwnerTeamAssignment from './components/OwnerTeamAssignment';
import TeamSelection from './components/TeamSelection';
import { User } from 'firebase/auth';
import {
  deleteRefinement,
  removeUserFromRefinement,
  startRefinementInFirebase,
  updateNumOfTeamsToRefinementInFirebase,
  updateSelectionMethodToRefinementInFirebase
} from '@/services/firestore/firestoreServices';

const TeamSelectionScene: React.FC = () => {
  const { refinementId } = useParams<{ refinementId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [availableTeams, setAvailableTeams] = useState<string[]>([]);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [members, setMembers] = useState<UserData[]>([] as UserData[]);
  const [numOfTeams, setNumOfTeams] = useState<number>(2);
  const [owner, setOwner] = useState<string>('');
  const [teamParticipants, setTeamParticipants] = useState<Record<string, string>>({});
  const [refinement, setRefinement] = useState<Refinement | null>(null);
  const [showDescription, setShowDescription] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    if (!refinementId || !user) return;
    const unsubscribeMembers = createUnsubscribeMembers(
      refinementId,
      user,
      setRefinement,
      setAvailableTeams,
      setIsOwner,
      setNumOfTeams,
      setOwner,
      setMembers,
      navigate
    );

    return () => {
      unsubscribeMembers();
    };
  }, [refinementId, user, navigate]);

  useEffect(() => {
    if (refinement) setTeamParticipants(refinement.teams as unknown as Record<string, string>)
  }, [refinement]);

  const handleExitRoom = async () => {
    if (!refinementId || !user) return;

    try {
      if (isOwner) {
        await deleteRefinement(refinementId);
      } else {
        await removeUserFromRefinement(refinementId, user.uid);
      }

      setShowExitModal(false);
      navigate('/');
    } catch (error) {
      console.error('Erro ao sair da sala:', error);
    }
  };

  const openExitModal = () => {
    setShowExitModal(true);
  };

  const closeExitModal = () => {
    setShowExitModal(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Acesso não autorizado</h2>
          <p className="text-gray-600 mb-4">Você precisa estar logado para acessar esta página.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  if (!refinementId || !refinement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando sessão...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Configuração dos Times
          </h1>
          <p className="text-gray-600">
            Organize os participantes e configure os times para o refinamento
          </p>
        </div>

        {/* Main Configuration Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="text-center flex-1">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                {refinement.title}
              </h2>
              <p className="text-gray-600 text-sm">
                {isOwner ? 'Você é o organizador desta sessão' : 'Aguardando configuração do organizador'}
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-6">
            <ShareButton refinementId={refinementId} sessionTitle={refinement.title} />
            <button
              onClick={openExitModal}
              className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sair da Sala</span>
            </button>
          </div>

          {refinement.description && (
            <CollapsibleDescriptionArea
              refinementDescription={refinement.description}
              showDescription={showDescription}
              setShowDescription={setShowDescription}
            />
          )}

          <div className="space-y-6">
            {/* Number of Teams Section */}
            <div className="border-b pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade de Times
                  </label>
                  {isOwner ? (
                    <input
                      name="teamNumbers"
                      type="number"
                      min="2"
                      max="10"
                      defaultValue={numOfTeams}
                      onChange={e => updateNumOfTeamsToRefinementInFirebase(refinementId, setAvailableTeams, e)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center text-2xl font-bold"
                    />
                  ) : (
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-800">{numOfTeams}</p>
                      <p className="text-sm text-gray-500 mt-1">times</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Selection Method */}
            {isOwner && (
              <div className="border-b pb-4">
                <SelectionMethodChooser
                  currentMethod={refinement.selectionMethod || 'RANDOM'}
                  onMethodChange={(method) =>
                    updateSelectionMethodToRefinementInFirebase(refinementId, method)}
                  isOwner={isOwner}
                />
              </div>
            )}

            {/* Team Assignment Section */}
            <div>
              {refinement.selectionMethod === 'OWNER_CHOOSES' && isOwner ? (
                <OwnerTeamAssignment
                  refinementId={refinementId}
                  members={members}
                  availableTeams={availableTeams}
                  currentAssignments={refinement.teams || {}}
                />
              ) : (
                <TeamSelection
                  refinementId={refinementId}
                  selectionMethod={refinement.selectionMethod || 'RANDOM'}
                  availableTeams={availableTeams}
                  currentTeam={user ? refinement.teams?.[user.uid] : undefined}
                />
              )}
            </div>

            {/* Participants List */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Lista de Participantes ({members.length})
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="space-y-2">
                  {members.map(member => (
                    <li
                      key={member.uid}
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${member.uid === owner
                        ? 'bg-rose-50 border border-rose-200'
                        : member.uid === user.uid
                          ? 'bg-teal-50 border border-teal-200'
                          : 'bg-white border border-gray-200'
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`font-medium ${member.uid === owner
                          ? 'text-rose-700'
                          : member.uid === user.uid
                            ? 'text-teal-700'
                            : 'text-gray-700'
                          }`}>
                          {member.displayName || member.email || member.uid}
                        </span>
                        {member.uid === owner && (
                          <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs rounded-full font-medium">
                            Organizador
                          </span>
                        )}
                        {member.uid === user.uid && (
                          <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full font-medium">
                            Você
                          </span>
                        )}
                      </div>

                      {teamParticipants && teamParticipants[member.uid] && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full font-semibold">
                          {teamParticipants[member.uid]}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              {isOwner && (
                <button
                  onClick={() => startRefinementInFirebase(refinement, refinementId, user, navigate)}
                  disabled={!refinementId}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${!refinementId
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white transform hover:scale-105'
                    }`}
                >
                  Iniciar Refinamento
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            {isOwner
              ? 'Configure os times e inicie quando estiver pronto'
              : 'Aguardando o organizador iniciar a sessão'
            }
          </p>
        </div>
      </div>

      <ExitConfirmationModal
        isOpen={showExitModal}
        onClose={closeExitModal}
        onConfirm={handleExitRoom}
        isOwner={isOwner}
        sessionTitle={refinement.title}
      />
    </div>
  );
};

export default TeamSelectionScene;