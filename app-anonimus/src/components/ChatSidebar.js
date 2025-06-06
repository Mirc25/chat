import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faTimes } from '@fortawesome/free-solid-svg-icons'; // Eliminados faComments y faUsers

function ChatSidebar({ onSelectChat, currentChat, nickname, usersOnline, unreadPrivateChats, isMobile, isSidebarOpen, toggleSidebar }) {
    const getNicknameColorClass = (gender) => {
        if (gender === 'mujer') {
            return 'text-pink-400';
        } else if (gender === 'hombre') {
            return 'text-blue-400';
        }
        return 'text-gray-400';
    };

    return (
        <div className={`
            w-64 bg-gray-900 text-white flex flex-col p-4 border-r border-gray-700
            ${isMobile ? 'fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out' : ''}
            ${isMobile && !isSidebarOpen ? '-translate-x-full' : ''}
            ${isMobile && isSidebarOpen ? 'translate-x-0' : ''}
            md:static md:translate-x-0 md:flex
        `}>
            {/* Cabecera de la Sidebar (con botón de cerrar en móvil) */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
                <div className="text-2xl font-bold text-blue-500">Mirc25</div>
                {isMobile && (
                    <button
                        onClick={toggleSidebar}
                        className="text-gray-400 hover:text-white p-2"
                        aria-label="Cerrar menú"
                    >
                        <FontAwesomeIcon icon={faTimes} size="lg" />
                    </button>
                )}
            </div>

            {/* Información del usuario actual */}
            <div className="mb-6 pb-4 border-b border-gray-700 text-center">
                <FontAwesomeIcon icon={faUserCircle} size="3x" className="text-gray-400 mb-2" />
                <p className="text-lg font-semibold">{nickname}</p>
            </div>

            {/* Navegación de Chats Privados - Ahora es el foco principal de la sidebar */}
            <nav className="flex-1 overflow-y-auto">
                <ul className="space-y-2">
                    <li className="text-sm font-semibold text-gray-400 uppercase mb-2">
                        Chats Privados
                    </li>

                    {usersOnline.length === 1 && ( // Si solo está el propio usuario
                        <li className="text-gray-500 text-sm italic py-2 px-3">No hay otros usuarios conectados.</li>
                    )}

                    {usersOnline.map((user) => (
                        user.username !== nickname && (
                            <li key={user.id}>
                                <button
                                    onClick={() => onSelectChat(`private_${user.id}`)}
                                    className={`w-full text-left p-3 rounded-md flex items-center relative transition-colors duration-200 ${
                                        currentChat === `private_${user.id}`
                                            ? 'bg-blue-700 text-white'
                                            : 'hover:bg-gray-700 text-gray-300'
                                    }`}
                                >
                                    <FontAwesomeIcon icon={faUserCircle} className="mr-3 text-gray-400" />
                                    <span className={getNicknameColorClass(user.gender)}>
                                        {user.username}
                                    </span>
                                    {unreadPrivateChats[user.id] && (
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
                                    )}
                                </button>
                            </li>
                        )
                    ))}
                </ul>
            </nav>
        </div>
    );
}

export default ChatSidebar;
