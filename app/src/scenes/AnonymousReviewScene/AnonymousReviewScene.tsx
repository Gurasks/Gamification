import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { createUnsubscribeCards } from '../../hooks/firestoreUnsubscriber';
import type { Card, MetadataType, Session, VoteValue } from '../../types/global';
import toast from 'react-hot-toast';
import CollapsibleDescriptionArea from '../../components/CollapsibleDescriptionArea';
import CardSortingSelector, { SortOption } from '../BoardScene/components/CardSorteningSelector';
import { getSortedCards } from '../../services/boardServices';
import AnonymousCard from './components/AnonymousCard';
import MasonryGrid from '../../components/MasonryGrid';
import { Lock, Unlock, Eye, BarChart3, ArrowLeft, Home, Shield, Users, MessageSquare, Star } from 'lucide-react';
import { updateRatingToCardInFirestore, addCommentToCardInFirestore, updateCommentToCardInFirestore, deleteCommentFromCardInFirestore, voteOnCardMetadata } from '@/services/firestore/cardServices';
import { getSession, endSession } from '@/services/firestore/sessionServices';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { useLanguage } from '@/hooks/useLanguage';

const AnonymousReviewScene: React.FC = () => {
  const { t } = useLanguage();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [session, setSession] = useState<Session>({} as Session);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [showDescription, setShowDescription] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isReadOnly, setIsReadOnly] = useState(false);

  useEffect(() => {
    if (!sessionId || !user) return;

    let unsubscribeCards: (() => void) | undefined;

    const fetchData = async () => {
      setLoading(true);
      setCardsLoading(true);

      try {
        const sessionData = await getSession(sessionId);
        if (sessionData) {
          setSession(sessionData);
          if (sessionData.isClosed) {
            setIsReadOnly(true);
          }
        }

        unsubscribeCards = createUnsubscribeCards(sessionId, (newCards) => {
          setCards(newCards);
          setCardsLoading(false);
        });
      } catch (error) {
        console.error('Error loading session:', error);
        setCardsLoading(false);
        toast.error(t('review:errors.loadSession'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (unsubscribeCards) unsubscribeCards();
    };
  }, [sessionId, user, t]);

  const handleRateCard = async (cardId: string, rating: number) => {
    if (!user) {
      toast.error(t('review:errors.authRequired'));
      return;
    }

    if (isReadOnly) {
      toast.error(t('review:errors.phaseEnded'));
      return;
    }

    try {
      await updateRatingToCardInFirestore(cardId, rating, user);
      toast.success(t('review:success.voteRegistered'));
    } catch (error) {
      console.error('Error rating card:', error);
      toast.error(t('review:errors.voteFailed'));
    }
  };

  const handleAddComment = async (cardId: string, commentText: string) => {
    if (!user) {
      toast.error(t('review:errors.authRequired'));
      return;
    }

    if (isReadOnly) {
      toast.error(t('review:errors.phaseEnded'));
      return;
    }

    try {
      await addCommentToCardInFirestore(cardId, commentText, user);
      toast.success(t('review:success.commentAdded'));
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error(t('review:errors.commentFailed'));
    }
  };

  const handleEditComment = async (cardId: string, commentId: string, commentText: string) => {
    if (!user) return;

    if (isReadOnly) {
      toast.error(t('review:errors.editPhaseEnded'));
      return;
    }

    try {
      await updateCommentToCardInFirestore(cardId, commentId, commentText);
      toast.success(t('review:success.commentUpdated'));
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error(t('review:errors.commentUpdateFailed'));
    }
  };

  const handleDeleteComment = async (cardId: string, commentId: string) => {
    if (!isReadOnly) {
      await deleteCommentFromCardInFirestore(cardId, commentId);
      toast.success(t('review:success.commentDeleted'));
    }
  }

  const handleMetadataVote = async (
    cardId: string,
    metadataType: MetadataType,
    vote: VoteValue
  ) => {
    if (!user || isReadOnly) {
      toast.error(t('review:errors.cannotVoteNow'));
      return;
    }

    try {
      await voteOnCardMetadata(cardId, metadataType, vote, user);
      toast.success(t('review:success.voteRegistered'));
    } catch (error) {
      console.error('Error voting on metadata:', error);
      toast.error(t('review:errors.voteFailed'));
    }
  };

  const handleGoBack = () => {
    if (session.teams && user?.uid) {
      const userTeam = session.teams[user.uid];
      navigate(`/board/${sessionId}/team/${userTeam || ''}`);
    } else {
      navigate('/');
    }
  };

  const handleGoToLeaderboard = () => {
    navigate(`/leaderboard/${sessionId}`);
  };

  const handleEndReviewPhase = async () => {
    if (user) {
      setIsReadOnly(true);
      const message = await endSession(sessionId!, user);
      if (message === 'success') {
        toast.success(t('review:success.reviewEnded'));
      } else {
        toast.error(t('review:errors.endReviewFailed'));
      }
    }
  };

  if (loading) {
    return <LoadingOverlay message={t('review:loading.review')} />;
  }

  if (!session || !session.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('review:errors.sessionNotFound')}</h2>
          <Button onClick={() => navigate('/')} variant="outline-primary">
            <Home className="w-4 h-4 mr-2" />
            {t('common.navigation.backToHome')}
          </Button>
        </div>
      </div>
    );
  }

  const sortedCards = getSortedCards(cards, sortBy);
  const totalCards = cards.length;
  const totalComments = cards.reduce((acc, card) => acc + (card.comments?.length || 0), 0);

  const uniqueVoters = new Set();
  cards.forEach(card => {
    if (card.ratings) {
      Object.keys(card.ratings).forEach(voterId => uniqueVoters.add(voterId));
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col gap-4">
            {/* Título e descrição */}
            <div className="flex-1">
              <div className="flex justify-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-800">
                  {session.title} - {t('review:title')}
                </h1>
              </div>

              {session.description && (
                <CollapsibleDescriptionArea
                  sessionDescription={session.description}
                  showDescription={showDescription}
                  setShowDescription={setShowDescription}
                />
              )}

              {/* Status do modo */}
              <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200">
                <div className="flex justify-center items-center gap-3 mb-2">
                  {isReadOnly ? (
                    <>
                      <Lock className="w-5 h-5 text-red-600" />
                      <span className="text-lg font-semibold text-red-700">{t('review:mode.readOnly')}</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-5 h-5 text-green-600" />
                      <span className="text-lg font-semibold text-green-700">{t('review:mode.active')}</span>
                    </>
                  )}
                </div>
                <p className="text-gray-700">
                  {isReadOnly ? t('review:mode.readOnlyDescription') : t('review:mode.activeDescription')}
                </p>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4 border-t border-gray-200">
              <Button
                onClick={handleGoBack}
                variant="outline-secondary"
                className="flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('common.navigation.backToTeam')}
              </Button>

              <Button
                onClick={handleGoToLeaderboard}
                variant="primary"
                className="flex items-center justify-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                {t('review:actions.viewLeaderboard')}
              </Button>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-center">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="text-2xl font-bold text-blue-700">{totalCards}</div>
              </div>
              <div className="text-sm font-medium text-blue-800">{t('review:stats.totalCards')}</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-center gap-2 mb-1">
                <MessageSquare className="w-4 h-4 text-green-700" />
                <div className="text-2xl font-bold text-green-700">{totalComments}</div>
              </div>
              <div className="text-sm font-medium text-green-800">{t('common.content.comments')}</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-4 h-4 text-purple-700" />
                <div className="text-2xl font-bold text-purple-700">{uniqueVoters.size}</div>
              </div>
              <div className="text-sm font-medium text-purple-800">{t('review:stats.voters')}</div>
            </div>

            <div className={`p-4 rounded-lg border ${isReadOnly
              ? 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300'
              : 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200'
              }`}>
              <div className="flex items-center justify-center gap-2 mb-1 mt-1">
                {isReadOnly ? (
                  <Lock className="w-5 h-5 text-gray-700" />
                ) : (
                  <Unlock className="w-5 h-5 text-yellow-700" />
                )}
              </div>
              <div className={`text-sm font-medium ${isReadOnly ? 'text-gray-800' : 'text-yellow-800'}`}>
                {isReadOnly ? t('review:stats.readOnly') : t('review:stats.active')}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:items-center justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                {t('review:cardsToReview')}
                <span className="text-sm font-normal text-gray-500">
                  ({totalCards} {t('review:cards')})
                </span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {isReadOnly ? t('review:description.viewOnly') : t('review:description.rateCards')}
              </p>
            </div>

            <div className="w-full flex flex-col sm:flex-row gap-3">
              {totalCards > 0 && !cardsLoading && (
                <CardSortingSelector
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  hasAuthorOption={false}
                />
              )}

              {!isReadOnly && user?.uid === session.owner && (
                <Button
                  onClick={handleEndReviewPhase}
                  variant="secondary"
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-50 to-red-100 text-red-700 hover:from-red-100 hover:to-red-200 border border-red-300"
                >
                  <Lock className="w-4 h-4" />
                  {t('review:actions.endReview')}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Cards Grid com layout Masonry */}
        <div className="mb-6">
          {cardsLoading ? (
            <div className="flex flex-col justify-center items-center h-64">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-gray-600 mt-3">{t('review:loading.cards')}</span>
            </div>
          ) : totalCards === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('review:empty.title')}</h3>
              <p className="text-gray-500 mb-6">{t('review:empty.message')}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={handleGoBack} variant="primary" className="flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  {t('common.navigation.backToTeam')}
                </Button>
              </div>
            </div>
          ) : (
            <MasonryGrid
              columns={{ sm: 1, md: 2, lg: 3 }}
              gap={24}
              className="p-2"
            >
              {sortedCards.map(card => (
                <AnonymousCard
                  key={card.id}
                  card={card}
                  user={user!}
                  onRate={handleRateCard}
                  onComment={handleAddComment}
                  onCommentEdit={handleEditComment}
                  onCommentDelete={handleDeleteComment}
                  onMetadataVote={handleMetadataVote}
                  isReadOnly={isReadOnly}
                />
              ))}
            </MasonryGrid>
          )}
        </div>

        {/* Footer com informações */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mt-1">
                <Shield className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-800">{t('review:footer.title')}</h3>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 self-center">
              <Button onClick={handleGoBack} variant="outline-secondary" className="flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                {t('common.actions.back')}
              </Button>
              <Button onClick={handleGoToLeaderboard} variant="primary" className="flex items-center justify-center gap-2">
                <BarChart3 className="w-4 h-4" />
                {t('review:actions.viewResults')}
              </Button>
            </div>
          </div>
        </div>
        <ScrollToTopButton />
      </div>
    </div>
  );
};

export default AnonymousReviewScene;