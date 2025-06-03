import React, { useState } from 'react';

const PROVINCE_ROOMS = [
  "Buenos Aires", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes",
  "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza",
  "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis",
  "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"
].map(p => ({
  name: p,
  id: p.replace(/\s/g, '_').toLowerCase()
}));

function UserInfoInput({ onInfoSet, error }) {
  const [inputNickname, setInputNickname] = useState('');
  const [selectedSex, setSelectedSex] = useState('');
  const [selectedProvinceId, setSelectedProvinceId] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');

    if (!inputNickname.trim()) {
      setLocalError('El nickname no puede estar vacío.');
      return;
    }
    if (!selectedSex) {
      setLocalError('Por favor, selecciona tu sexo.');
      return;
    }
    if (!selectedProvinceId) {
      setLocalError('Por favor, selecciona tu provincia.');
      return;
    }

    onInfoSet(inputNickname.trim(), selectedSex, selectedProvinceId);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-sm text-center">
        <h2 className="text-3xl font-bold text-blue-400 mb-6">Completa tu Información</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={inputNickname}
            onChange={(e) => setInputNickname(e.target.value)}
            placeholder="Ingresa tu nickname..."
            className="p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 text-lg"
            maxLength="15"
          />

          <select
            value={selectedSex}
            onChange={(e) => setSelectedSex(e.target.value)}
            className="p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 text-lg appearance-none"
          >
            <option value="" disabled hidden>Selecciona tu sexo...</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
            <option value="otro">Otro</option>
          </select>

          <select
            value={selectedProvinceId}
            onChange={(e) => setSelectedProvinceId(e.target.value)}
            className="p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 text-lg appearance-none"
          >
            <option value="" disabled hidden>Selecciona tu provincia...</option>
            {PROVINCE_ROOMS.map((province) => (
              <option key={province.id} value={province.id}>
                {province.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105 text-lg"
          >
            Entrar al Chat
          </button>
        </form>
        {(localError || error) && (
          <p className="mt-4 text-red-400 text-sm">{localError || error}</p>
        )}
        <p className="text-gray-400 text-sm mt-4">Tu nickname se mostrará a otros usuarios.</p>
      </div>
    </div>
  );
}

export default UserInfoInput;