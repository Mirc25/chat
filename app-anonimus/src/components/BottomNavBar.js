import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faUsers, faEnvelope } from '@fortawesome/free-solid-svg-icons';

function BottomNavBar({ activeTab, setActiveTab, unreadPrivateChats }) {
    const totalUnreadPrivate = Object.values(unreadPrivateChats).filter(Boolean).length;

    const handleClick = (tabName) => {
        console.log("📊 [DEPURACIÓN BNB] Click en pestaña:", tabName); // NUEVO LOG
        setActiveTab(tabName);
    };

    return (
        <div className="fixed bottom-0 left-0 w-full bg-gray-900 border-t border-gray-700 flex justify-around items-center h-16 z-40">
            {/* Botón Chat General */}
            <button
                className={`flex flex-col items-center justify-center p-2 text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'general_chat' ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => handleClick('general_chat')}
            >
                <FontAwesomeIcon icon={faComments} size="lg" className="mb-1" />
                <span>General</span>
            </button>

            {/* Botón Privados */}
            <button
                className={`relative flex flex-col items-center justify-center p-2 text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'private_chats_list' ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => handleClick('private_chats_list')}
            >
                <FontAwesomeIcon icon={faEnvelope} size="lg" className="mb-1" />
                <span>Privados</span>
                {totalUnreadPrivate > 0 && (
                    <span className="absolute top-1 right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center -mt-1 -mr-1">
                        {totalUnreadPrivate}
                    </span>
                )}
            </button>

            {/* Botón Usuarios */}
            <button
                className={`flex flex-col items-center justify-center p-2 text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'users_list' ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => handleClick('users_list')}
            >
                <FontAwesomeIcon icon={faUsers} size="lg" className="mb-1" />
                <span>Conectados</span>
            </button>
        </div>
    );
}

export default BottomNavBar;