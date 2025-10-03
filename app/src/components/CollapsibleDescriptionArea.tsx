interface CollapsibleDescriptionAreaProps {
  refinementDescription: string;
  showDescription: boolean;
  setShowDescription: (show: boolean) => void;
}
const CollapsibleDescriptionArea: React.FC<CollapsibleDescriptionAreaProps> = ({
  refinementDescription,
  showDescription,
  setShowDescription
}) => {
  return (
    <div className="mb-6">
      <button
        onClick={() => setShowDescription(!showDescription)}
        className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
      >
        <div className="flex items-center space-x-3">
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${showDescription ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span className="text-sm font-medium text-gray-700">
            Descrição do Refinamento
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {showDescription ? 'Ocultar' : 'Mostrar'}
        </span>
      </button>

      {showDescription && (
        <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-fadeIn">
          <p className="text-gray-700 leading-relaxed">
            {refinementDescription}
          </p>
        </div>
      )}
    </div>
  )
}

export default CollapsibleDescriptionArea;