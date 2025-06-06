import React, { useState } from 'react';

function UserInfoInput({ onInfoSet, error, provinceRooms }) {
    const [nickname, setNickname] = useState('');
    const [sex, setSex] = useState('');
    const [province, setProvince] = useState('');
    const [localError, setLocalError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setLocalError(''); // Limpiar errores locales anteriores

        if (!nickname.trim()) {
            setLocalError('El nickname no puede estar vacío.');
            return;
        }
        if (nickname.length > 15) { // Límite de 15 caracteres para nickname
            setLocalError('El nickname no puede tener más de 15 caracteres.');
            return;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(nickname)) { // Permitir letras, números y guiones bajos
            setLocalError('El nickname solo puede contener letras, números y guiones bajos.');
            return;
        }
        if (!sex) {
            setLocalError('Por favor, selecciona tu sexo.');
            return;
        }
        if (!province) {
            setLocalError('Por favor, selecciona tu provincia.');
            return;
        }

        // Si todo es válido, llama a la función onInfoSet del componente padre
        onInfoSet(nickname.trim(), sex, province);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <h2 className="text-3xl font-bold mb-6 text-blue-400">Ingresa tus Datos</h2>
            <form onSubmit={handleSubmit} className="w-full max-w-sm bg-gray-800 p-8 rounded-lg shadow-xl">
                <div className="mb-4">
                    <label htmlFor="nickname" className="block text-gray-300 text-lg font-medium mb-2">
                        Nickname:
                    </label>
                    <input
                        type="text"
                        id="nickname"
                        className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Ej: ChatMaster23"
                        maxLength="15" // Asegurar que el input respeta el límite
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-300 text-lg font-medium mb-2">
                        Sexo:
                    </label>
                    <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name="sex"
                                value="male"
                                checked={sex === 'male'}
                                onChange={() => setSex('male')}
                                className="form-radio h-5 w-5 text-blue-600"
                            />
                            <span className="ml-2 text-gray-300">Masculino</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name="sex"
                                value="female"
                                checked={sex === 'female'}
                                onChange={() => setSex('female')}
                                className="form-radio h-5 w-5 text-pink-600"
                            />
                            <span className="ml-2 text-gray-300">Femenino</span>
                        </label>
                    </div>
                </div>

                <div className="mb-6">
                    <label htmlFor="province" className="block text-gray-300 text-lg font-medium mb-2">
                        Provincia:
                    </label>
                    <select
                        id="province"
                        className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                    >
                        <option value="">Selecciona tu provincia</option>
                        {provinceRooms.map((room) => (
                            <option key={room.id} value={room.id}>
                                {room.name}
                            </option>
                        ))}
                    </select>
                </div>

                {(localError || error) && (
                    <p className="text-red-500 text-center mb-4 text-sm">{localError || error}</p>
                )}

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-3 rounded-md font-semibold hover:bg-blue-700 transition-colors duration-200"
                >
                    Entrar al Chat
                </button>
            </form>
        </div>
    );
}

export default UserInfoInput;