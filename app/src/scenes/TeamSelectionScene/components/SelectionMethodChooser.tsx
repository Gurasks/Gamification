import React from 'react';
import type { SelectionMethod } from '../../../types/teamSelection';


interface SelectionMethodChooserProps {
  currentMethod: SelectionMethod;
  onMethodChange: (method: SelectionMethod) => void;
  isOwner: boolean;
}

const SelectionMethodChooser: React.FC<SelectionMethodChooserProps> = ({
  currentMethod,
  onMethodChange,
  isOwner,
}) => {
  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold">Método de seleção de times</h3>

      <div className="space-y-2">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            checked={currentMethod === 'RANDOM'}
            onChange={() => onMethodChange('RANDOM')}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
          />
          <span>Atribuição aleatória</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="radio"
            checked={currentMethod === 'CHOOSE_YOUR_TEAM'}
            onChange={() => onMethodChange('CHOOSE_YOUR_TEAM')}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
          />
          <span>Participantes escolhem o time</span>
        </label>

        {isOwner && (
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={currentMethod === 'OWNER_CHOOSES'}
              onChange={() => onMethodChange('OWNER_CHOOSES')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Atribua os times</span>
          </label>
        )}
      </div>
    </div>
  );
};

export default SelectionMethodChooser;