import React from 'react';

// Importamos PROVINCE_ROOMS aquí porque este componente lo necesita para mostrar el nombre de la provincia
const PROVINCE_ROOMS = [
    "Buenos Aires", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes",
    "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza",
    "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis",
    "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"
].map(p => ({
    name: p,
    id: p.replace(/\s/g, '_').toLowerCase()
}));

function UsersList({ usersOnline, onSelectChat, nickname, selectedProvinceRoomId }) {
    const filteredUsers = usersOnline.filter(user => user !== nickname);

    return (
        <div className="flex-1 p-4 bg-gray-800 overflow-y-auto">
            {/* Título simplificado */}
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Conectados</h2> 
            {/* Mostrar la provincia actual */}
            <p className="text-gray-400 text-sm mb-4">Solo usuarios de tu provincia: {PROVINCE_ROOMS.find(p => p.id === selectedProvinceRoomId)?.name}</p>
            <ul>
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user, index) => (
                        <li key={index} className="mb-2">
                            <button
                                className="w-full text-left p-3 rounded-md transition duration-200 bg-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white flex justify-between items-center"
                                onClick={() => onSelectChat(`private_${user}`)}
                            >
                                {user}
                            </button>
                        </li>
                    ))
                ) : (
                    <li className="text-gray-400 text-lg">No hay otros usuarios online en tu provincia.</li>
                )}
            </ul>
        </div>
    );
}

export default UsersList;