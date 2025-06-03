import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleDot } from '@fortawesome/free-solid-svg-icons';

function ChatSidebar({
  usersOnline,
  onSelectChat, // Función recibida para cambiar el chat
  currentChat,
  nickname,
  unreadPrivateChats,
  unreadProvinceChats,
  generalChatNameDisplay,
  selectedProvinceRoomId
}) {
  console.log('🔄 [DEPURACIÓN SIDEBAR] ChatSidebar se está renderizando. CurrentChat:', currentChat, 'UsersOnline:', usersOnline.length);
  const filteredUsers = usersOnline.filter(user => user !== nickname);

  return (
    <div className="w-1/4 bg-gray-800 p-4 border-r border-gray-700 overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-400">mirc25</h1>
        <p className="text-sm text-gray-400">Salas de Chat de Argentina</p>
      </div>

      <h2 className="text-xl font-semibold mb-4 text-blue-400">Usuarios Conectados</h2>
      <ul>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user, index) => (
            <li key={index} className="mb-2">
              <button
                className={`w-full text-left p-2 rounded-md transition duration-200 ${
                  currentChat === `private_${user}`
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-700 text-gray-300'
                } flex justify-between items-center`}
                onClick={() => {
                    console.log(`✨ [DEPURACIÓN SIDEBAR] Botón de nickname clicado: ${user}`);
                    onSelectChat(`private_${user}`); // Llama a la función pasada por prop
                }}
              >
                {user}
                {unreadPrivateChats[user] && (
                  <FontAwesomeIcon icon={faCircleDot} className="text-red-500 text-sm" />
                )}
              </button>
            </li>
          ))
        ) : (
          <li className="text-gray-400">No hay otros usuarios online.</li>
        )}
      </ul>

      <div className="mt-6 border-t border-gray-700 pt-4">
        <h2 className="text-xl font-semibold mb-4 text-green-400">Salas de Chat</h2>
        <ul>
          <li className="mb-2">
            <button
              className={`w-full text-left p-2 rounded-md transition duration-200 ${
                currentChat === selectedProvinceRoomId
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-700 text-gray-300'
              } flex justify-between items-center`}
              onClick={() => {
                console.log(`✨ [DEPURACIÓN SIDEBAR] Botón de chat general clicado: ${selectedProvinceRoomId}`);
                onSelectChat(selectedProvinceRoomId);
              }}
            >
              {generalChatNameDisplay}
              {(unreadProvinceChats && unreadProvinceChats[selectedProvinceRoomId]) && currentChat !== selectedProvinceRoomId && (
                  <FontAwesomeIcon icon={faCircleDot} className="text-red-500 text-sm" />
              )}
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default ChatSidebar;