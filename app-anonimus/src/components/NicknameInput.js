import React, { useState } from 'react';

function NicknameInput({ onSetNickname, setAppError }) {
    const [inputNickname, setInputNickname] = useState('');
    const [selectedGender, setSelectedGender] = useState('');
    const [selectedProvince, setSelectedProvince] = useState(''); // Nuevo estado para la provincia
    const [nicknameError, setNicknameError] = useState('');

    // Lista de provincias de Argentina (puedes ajustarla o cargarla desde un archivo si es muy larga)
    const provinces = [
        "Buenos Aires", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes",
        "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza",
        "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis",
        "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputNickname.trim()) {
            setNicknameError('El Nickname no puede estar vacío.');
            return;
        }
        if (!selectedGender) {
            setNicknameError('Por favor, selecciona tu Sexo.');
            return;
        }
        if (!selectedProvince) { // Validar que se seleccione una provincia
            setNicknameError('Por favor, selecciona tu Provincia.');
            return;
        }
        setNicknameError('');
        // Llamamos a la función onSetNickname de App.js con el nickname, sexo y provincia
        onSetNickname(inputNickname.trim(), selectedGender, selectedProvince);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
                <h2 className="text-3xl font-bold text-center text-blue-400 mb-6">Elige tu Nickname, Sexo y Provincia</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="nickname" className="block text-sm font-medium text-gray-300 mb-1">
                            Nickname:
                        </label>
                        <input
                            type="text"
                            id="nickname"
                            value={inputNickname}
                            onChange={(e) => setInputNickname(e.target.value)}
                            className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej. ArgentinaFan"
                            maxLength="20"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-300 mb-1">
                            Sexo:
                        </label>
                        <select
                            id="gender"
                            value={selectedGender}
                            onChange={(e) => setSelectedGender(e.target.value)}
                            className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Selecciona...</option>
                            <option value="hombre">Hombre</option>
                            <option value="mujer">Mujer</option>
                            <option value="otro">Otro</option>
                        </select>
                    </div>
                    {/* Nuevo campo para la provincia */}
                    <div>
                        <label htmlFor="province" className="block text-sm font-medium text-gray-300 mb-1">
                            Provincia:
                        </label>
                        <select
                            id="province"
                            value={selectedProvince}
                            onChange={(e) => setSelectedProvince(e.target.value)}
                            className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Selecciona...</option>
                            {provinces.map(province => (
                                <option key={province} value={province}>{province}</option>
                            ))}
                        </select>
                    </div>
                    {nicknameError && (
                        <p className="text-red-400 text-sm text-center">{nicknameError}</p>
                    )}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Entrar al Chat
                    </button>
                </form>
            </div>
        </div>
    );
}

export default NicknameInput;
