import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleDot } from '@fortawesome/free-solid-svg-icons';

function PrivateChatsList({ privateMessagesHistory, onSelectChat, unreadPrivateChats, nickname }) {
    const chatPartners = Object.keys(privateMessagesHistory);

    return (
        <div className="flex-1 p-4 bg-gray-800 overflow-y-auto">
            {/* Título simplificado */}
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Privados</h2> 
            <ul>
                {chatPartners.length > 0 ? (
                    chatPartners.map((partnerNickname, index) => {
                        const messagesForPartner = privateMessagesHistory[partnerNickname];
                        const lastMessage = messagesForPartner && messagesForPartner.length > 0
                                            ? messagesForPartner[messagesForPartner.length - 1]
                                            : null;
                        const isUnread = unreadPrivateChats[partnerNickname];

                        let displayMessage = "Iniciar conversación"; // Mensaje por defecto si no hay mensajes
                        if (lastMessage) {
                            const senderPrefix = lastMessage.sender === nickname ? 'Tú' : lastMessage.sender;
                            // Asegurarse de que text no es undefined/null antes de usarlo
                            const messageTextContent = lastMessage.text ? lastMessage.text : ''; 
                            const previewText = messageTextContent.substring(0, 30) + (messageTextContent.length > 30 ? '...' : '');
                            
                            if (isUnread) {
                                // Mensaje más discreto para no leído
                                displayMessage = `Nuevo mensaje de ${senderPrefix}`; 
                            } else {
                                displayMessage = `${senderPrefix}: ${previewText}`;
                            }
                        }

                        return (
                            <li key={index} className="mb-2">
                                <button
                                    className="w-full text-left p-3 rounded-md transition duration-200 bg-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white flex justify-between items-center"
                                    onClick={() => onSelectChat(`private_${partnerNickname}`)}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-bold text-lg">{partnerNickname}</span>
                                        <span className="text-sm text-gray-400 italic">{displayMessage}</span>
                                    </div>
                                    {isUnread && (
                                        <FontAwesomeIcon icon={faCircleDot} className="text-red-500 text-sm ml-2 animate-notification-pulse" />
                                    )}
                                </button>
                            </li>
                        );
                    })
                ) : (
                    <li className="text-gray-400 text-lg">No has tenido chats privados aún.</li>
                )}
            </ul>
        </div>
    );
}

export default PrivateChatsList;