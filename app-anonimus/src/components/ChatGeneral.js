import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faSmile, faPaperPlane, faUserCircle } from '@fortawesome/free-solid-svg-icons'; // faBars eliminado
import EmojiPicker from 'emoji-picker-react';

function ChatGeneral({ nickname, messages, sendMessage, userSex, onlineUsersData, onSelectChat, mySocketId, isMobile, toggleSidebar }) {
    const [inputMessage, setInputMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (inputMessage.trim()) {
            sendMessage(inputMessage, 'general');
            setInputMessage('');
            setShowEmojiPicker(false);
        }
    };

    const handleEmojiClick = (emojiObject) => {
        setInputMessage(prevMsg => prevMsg + emojiObject.emoji);
    };

    const [attachmentNotification, setAttachmentNotification] = useState(null);

    const handleAttachFile = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64String = event.target.result;
                sendMessage('', 'general', null, {
                    name: file.name,
                    type: file.type,
                    base64: base64String
                });
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        }
    };

    const getNicknameColorClass = (senderSocketId) => {
        let senderGender = 'otro';

        const userData = onlineUsersData[senderSocketId];

        if (userData) {
            senderGender = userData.gender;
        } else if (senderSocketId === mySocketId) {
            senderGender = userSex;
        } else {
            senderGender = 'otro';
        }

        if (senderGender === 'mujer') {
            return 'text-pink-300';
        } else if (senderGender === 'hombre') {
            return 'text-blue-300';
        }
        return 'text-gray-300';
    };

    const handleNicknameClick = (targetUserSocketId) => {
        if (targetUserSocketId && targetUserSocketId !== mySocketId) {
            onSelectChat(`private_${targetUserSocketId}`);
        } else if (targetUserSocketId === mySocketId) {
            console.log("No puedes iniciar un chat privado contigo mismo.");
        } else {
            console.warn("Socket ID del usuario no encontrado para iniciar chat privado.");
        }
    };

    return (
        <div className="flex flex-col flex-1 bg-gray-800">
            {/* Cabecera del Chat General - Sin botón de menú aquí */}
            <div className="p-4 bg-indigo-900 text-white text-lg font-semibold border-b border-gray-600 flex justify-between items-center">
                Chat General
            </div>

            {/* Ajuste: pb-28 para dejar espacio para la barra de entrada (h-16) + barra de navegación inferior (h-12) */}
            <div className="flex-1 p-4 pb-28 overflow-y-auto">
                {messages.map((msg, index) => {
                    const isMine = msg.username === nickname;
                    const displayedSender = isMine ? 'Tú' : msg.username;
                    const nicknameColorClass = getNicknameColorClass(msg.senderSocketId);

                    return (
                        <div
                            key={index}
                            className={`mb-2 p-2 rounded-lg max-w-[70%] ${
                                isMine
                                    ? 'bg-blue-700 ml-auto text-right'
                                    : 'bg-gray-700 mr-auto text-left'
                            }`}
                        >
                            <span className="block text-gray-100">
                                <span
                                    className={`font-bold ${nicknameColorClass} ${!isMine ? 'cursor-pointer hover:underline' : ''}`}
                                    onClick={!isMine ? () => handleNicknameClick(msg.senderSocketId) : undefined}
                                >
                                    {displayedSender}:
                                </span>
                                {msg.type === 'text' && <p className="break-words">{msg.text}</p>}
                                {msg.type === 'image' && msg.url && (
                                    <img src={msg.url} alt="Imagen enviada" className="max-w-full h-auto rounded-md" />
                                )}
                                {msg.type === 'file' && msg.url && msg.fileName && (
                                    <a href={msg.url} download={msg.fileName} className="text-blue-300 hover:underline flex items-center">
                                        <FontAwesomeIcon icon={faPaperclip} className="mr-2" /> {msg.fileName}
                                    </a>
                                )}
                                <span className="block text-xs text-gray-400 mt-1">{msg.timestamp}</span>
                            </span>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {showEmojiPicker && (
                <div className="absolute bottom-28 right-4 z-40"> {/* Ajuste para nueva barra de navegación */}
                    <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
                </div>
            )}

            <form onSubmit={handleSendMessage} className="fixed bottom-0 left-0 w-full p-4 border-t border-gray-700 bg-gray-800 flex items-center z-30 h-16">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={handleAttachFile}
                    className="p-2 text-gray-400 hover:text-blue-400 transition-colors duration-200"
                    title="Adjuntar archivo"
                >
                    <FontAwesomeIcon icon={faPaperclip} size="lg" />
                </button>
                <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 text-gray-400 hover:text-blue-400 transition-colors duration-200 ml-2"
                    title="Seleccionar emoji"
                >
                    <FontAwesomeIcon icon={faSmile} size="lg" />
                </button>
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    name="messageInput"
                    className="flex-1 p-2 ml-4 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Escribe tu mensaje..."
                    autoComplete="off"
                    maxLength="500"
                />
                <button
                    type="submit"
                    className="ml-4 p-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors duration-200 text-white"
                    title="Enviar mensaje"
                >
                    <FontAwesomeIcon icon={faPaperPlane} size="lg" />
                </button>
            </form>
        </div>
    );
}

export default ChatGeneral;