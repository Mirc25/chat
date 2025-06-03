import React from 'react';

function VerificacionEdad({ onConfirm }) {
  const handleConfirm = (isConfirmed) => {
    onConfirm(isConfirmed); // Llama a 'onConfirm'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-sm text-center">
        <h2 className="text-3xl font-bold text-blue-400 mb-6">Verificación de Edad</h2>
        <p className="text-gray-300 mb-6">
          Debes ser mayor de 18 años para acceder a este chat.
        </p>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleConfirm(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105 text-lg"
          >
            Soy mayor de 18
          </button>
          <button
            onClick={() => handleConfirm(false)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105 text-lg"
          >
            No soy mayor de 18
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerificacionEdad;