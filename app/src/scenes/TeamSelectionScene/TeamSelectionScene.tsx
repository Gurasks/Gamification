import { useLanguage } from '@/hooks/useLanguage';
import { deleteSession, removeUserFromSession, startSessionInFirebase, updateNumOfTeamsToSessionInFirebase, updateSelectionMethodToSessionInFirebase } from '@/services/firestore/sessionServices';
import {
  Info,
  LogOut,
  Play,
  Settings,
  Users,
  XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CollapsibleDescriptionArea from '../../components/CollapsibleDescriptionArea';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import ShareButton from '../../components/ShareButton';
import { useAuth } from '../../contexts/AuthContext';
import { createUnsubscribeMembers } from '../../hooks/firestoreUnsubscriber';
import type { Session, UserData } from '../../types/global';
import ExitConfirmationModal from './components/ExitConfirmationModal';
import OwnerTeamAssignment from './components/OwnerTeamAssignment';
import ParticipantsList from './components/ParcipantsList';
import SelectionMethodChooser from './components/SelectionMethodChooser';
import TeamSelection from './components/TeamSelection';

const TeamSelectionScene: React.FC = () => {
  const { t } = useLanguage();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [availableTeams, setAvailableTeams] = useState<string[]>([]);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [members, setMembers] = useState<UserData[]>([] as UserData[]);
  const [numOfTeams, setNumOfTeams] = useState<number>(2);
  const [owner, setOwner] = useState<string>('');
  const [teamParticipants, setTeamParticipants] = useState<Record<string, string>>({});
  const [session, setSession] = useState<Session | null>(null);
  const [showDescription, setShowDescription] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    if (!sessionId || !user) {
      setLoadingSession(false);
      return;
    }

    const unsubscribeMembers = createUnsubscribeMembers(
      sessionId,
      user,
      (sessionData) => {
        setSession(sessionData);
        setLoadingSession(false);
      },
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
  }, [sessionId, user, navigate]);

  useEffect(() => {
    if (session) {
      setTeamParticipants(session.teams as Record<string, string>);
    }
  }, [session]);

  const handleExitRoom = async () => {
    if (!sessionId || !user) return;

    try {
      if (isOwner) {
        await deleteSession(sessionId);
      } else {
        await removeUserFromSession(sessionId, user.uid);
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
      <LoadingOverlay
        message={t('team:selection.loading.auth')}
      />
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {t('team:selection.unauthorized.title')}
          </h2>
          <p className="text-gray-600 mb-4">
            {t('team:selection.unauthorized.message')}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {t('auth:login')}
          </button>
        </div>
      </div>
    );
  }

  if (!sessionId || loadingSession || !session) {
    return (
      <LoadingOverlay
        message={t('team:selection.loading.session')}
      />
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {t('team:selection.title')}
          </h1>
          <p className="text-gray-600">
            {t('team:selection.subtitle')}
          </p>
        </div>

        {/* Main Configuration Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="text-center flex-1">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                {session.title}
              </h2>
              <p className="text-gray-600 text-sm">
                {isOwner ? t('team:selection.ownerStatus') : t('team:selection.memberStatus')}
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-6">
            <ShareButton sessionId={sessionId} sessionTitle={session.title} />
            <button
              onClick={openExitModal}
              className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>{t('team:selection.exitButton')}</span>
            </button>
          </div>

          {session.description && (
            <CollapsibleDescriptionArea
              sessionDescription={session.description}
              showDescription={showDescription}
              setShowDescription={setShowDescription}
            />
          )}

          <div className="space-y-6">
            {/* Number of Teams Section */}
            <div className="border-b pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <label htmlFor="teamNumbers" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {t('team:selection.numberOfTeams')}
                  </label>
                  {isOwner ? (
                    <div>
                      <input
                        id="teamNumbers"
                        name="teamNumbers"
                        type="number"
                        min="2"
                        max="10"
                        defaultValue={numOfTeams}
                        onChange={e => updateNumOfTeamsToSessionInFirebase(sessionId, setAvailableTeams, e)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center text-2xl font-bold"
                      />
                      <p className="text-gray-500 text-xs mt-1 block text-center">
                        {t('team:selection.numberHint')}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center" aria-labelledby="teamNumbersLabel">
                      <p className="text-3xl font-bold text-gray-800">{numOfTeams}</p>
                      <p className="text-sm text-gray-500 mt-1">{t('team:teams')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Selection Method */}
            {isOwner && (
              <div className="border-b pb-4">
                <SelectionMethodChooser
                  currentMethod={session.selectionMethod || 'RANDOM'}
                  onMethodChange={(method) =>
                    updateSelectionMethodToSessionInFirebase(sessionId, method)}
                  isOwner={isOwner}
                />
              </div>
            )}

            {/* Team Assignment Section */}
            <div>
              {session.selectionMethod === 'OWNER_CHOOSES' && isOwner ? (
                <OwnerTeamAssignment
                  sessionId={sessionId}
                  members={members}
                  availableTeams={availableTeams}
                  currentAssignments={session.teams || {}}
                />
              ) : (
                <TeamSelection
                  sessionId={sessionId}
                  selectionMethod={session.selectionMethod || 'RANDOM'}
                  availableTeams={availableTeams}
                  currentTeam={session.teams?.[user.uid]}
                />
              )}
            </div>

            <ParticipantsList
              members={members}
              user={user}
              owner={owner}
              teamParticipants={teamParticipants}
            />

            <div className="flex gap-3 pt-4">
              {isOwner && (
                <button
                  onClick={() => startSessionInFirebase(session, sessionId, user, navigate)}
                  disabled={!sessionId}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${!sessionId
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white transform hover:scale-105'
                    }`}
                >
                  <Play className="w-4 h-4" />
                  {t('team:selection.startSession')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-gray-500 text-sm flex items-center justify-center gap-1">
            <Info className="w-4 h-4" />
            {isOwner
              ? t('team:selection.ownerHint')
              : t('team:selection.memberHint')
            }
          </p>
        </div>
      </div>

      <ExitConfirmationModal
        isOpen={showExitModal}
        onClose={closeExitModal}
        onConfirm={handleExitRoom}
        isOwner={isOwner}
        sessionTitle={session.title}
      />
    </div>
  );
};

export default TeamSelectionScene;