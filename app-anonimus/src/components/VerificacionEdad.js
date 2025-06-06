import React from 'react';

function VerificacionEdad({ onConfirmAdult }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
                <h2 className="text-3xl font-bold text-center text-blue-400 mb-6">Bienvenido a Mirc25</h2>
                <p className="text-lg text-gray-300 text-center mb-8">
                    Este chat es solo para mayores de 18 años. Por favor, confirma tu edad para continuar.
                </p>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={() => onConfirmAdult(true)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        Soy mayor de 18
                    </button>
                    <button
                        onClick={() => onConfirmAdult(false)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        Soy menor de 18
                    </button>
                </div>
            </div>
        </div>
    );
}

export default VerificacionEdad;
