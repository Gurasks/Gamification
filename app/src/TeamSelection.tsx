import React, { useState, type SetStateAction } from 'react';
import './App.css'

const TeamSelection: React.FC = () => {
  const [number, setNumber] = useState('2')
  function handleNumberChange(e: { target: { value: SetStateAction<string>; }; }) {
    setNumber(e.target.value);
  }
  return (
    <div className="app">
      <div>
        <h1>Quantidade de times</h1>
        <input className="text-5xl font-bold text-center my-1" name="teamNumbers" type='number' defaultValue={number} onChange={handleNumberChange} />
        <h1 className="mt-1">Lista de participantes</h1>
        <div className="content"></div>
      </div>
    </div>
  );
};

export default TeamSelection;