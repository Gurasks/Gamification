import type React from "react";
import type { PersistentUser } from "../types/global";

interface CardCreationProps {
  user: PersistentUser;
  refinementId: string;
  teamName: string;
  newCardText: string;
  setNewCardText: (value: string) => void;
  createCard: (
    newCardText: string,
    refinementId: string,
    user: PersistentUser,
    teamName: string,
    setNewCardText: (value: string) => void
  ) => Promise<void>;
}

const CardCreation: React.FC<CardCreationProps> = ({
  user,
  refinementId,
  teamName,
  newCardText,
  setNewCardText,
  createCard
}) => {
  return (
    <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
      <div
        className="flex-1 p-4 border rounded-lg min-w-[250px] transition-colors bg-indigo-50 border-indigo-300"
      >
        <h2 className="text-lg font-semibold mb-3 text-gray-700">{teamName} - {user.name}</h2>
        <div className="flex gap-2 mt-3">
          <input
            type="text"
            placeholder="Adicione uma sugestão..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={newCardText}
            onChange={(e) => setNewCardText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && createCard(newCardText, refinementId, user, teamName, setNewCardText)}
          />
          <button
            onClick={() => createCard(newCardText, refinementId, user, teamName, setNewCardText)}
            disabled={!newCardText.trim()}
            className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CardCreation;