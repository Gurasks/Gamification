import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../components/UserContext';
import { v4 as uuidv4 } from 'uuid';

const NameEntryScene: React.FC = () => {
  const [name, setName] = useState('');
  const { setUser } = useUser();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setUser({ id: uuidv4(), name: name.trim() });
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Bem-vindo ao Refinamento
          </h1>
          <p className="text-gray-600">
            Identifique-se para participar das sessões de refinamento
          </p>
        </div>

        {/* Name Entry Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Identificação
            </h3>
            <p className="text-gray-600 text-sm">
              Digite seu nome para continuar
            </p>
          </div>

          {/* Input Section */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Seu Nome *
              </label>
              <input
                type="text"
                id="name"
                placeholder="Ex: João Silva"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={name}
                onChange={(e) => setName((e.target as HTMLInputElement).value)}
                required
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
              />
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={!name.trim()}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${!name.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white transform hover:scale-105'
                }`}
            >
              Continuar
            </button>
          </form>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            * Campo obrigatório
          </p>
        </div>
      </div>
    </div>
  );
};

export default NameEntryScene;