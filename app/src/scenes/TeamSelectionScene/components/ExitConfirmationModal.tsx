import React from 'react';

interface ExitConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isOwner: boolean;
  sessionTitle: string;
}

const ExitConfirmationModal: React.FC<ExitConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isOwner,
  sessionTitle
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {isOwner ? 'Excluir Sala' : 'Sair da Sala'}
          </h3>

          <p className="text-gray-600 mb-4">
            {isOwner
              ? `Você está prestes a excluir a sala "${sessionTitle}". Esta ação não pode ser desfeita e todos os participantes serão removidos.`
              : `Você está prestes a sair da sala "${sessionTitle}". Você será removido da lista de participantes.`
            }
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${isOwner
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
          >
            {isOwner ? 'Excluir Sala' : 'Sair da Sala'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitConfirmationModal;