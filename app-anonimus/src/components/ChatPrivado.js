import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faSmile, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import EmojiPicker from 'emoji-picker-react'; // Asegúrate de tener esta librería instalada

function ChatPrivado({ messages, sendMessage, nickname, chatPartner }) {
    const [inputMessage, setInputMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        console.log('🟢 [DEPURACIÓN CHAT PRIVADO] ChatPrivado se ha montado o actualizado.');
        console.log('🟢 [DEPURACIÓN CHAT PRIVADO] Props recibidas:', { messages, nickname, chatPartner });
        scrollToBottom(); // Auto-scroll al cargar mensajes
    }, [messages, nickname, chatPartner]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (inputMessage.trim()) {
            sendMessage(inputMessage, 'private', chatPartner); // Envía tipo 'private' y el destinatario
            setInputMessage('');
            setShowEmojiPicker(false); // Ocultar picker después de enviar
        }
    };

    const handleEmojiClick = (emojiObject) => {
        setInputMessage(prevMsg => prevMsg + emojiObject.emoji);
        setShowEmojiPicker(false); // Ocultar picker después de seleccionar un emoji
    };

    const handleAttachFile = () => {
        alert("Funcionalidad de adjuntar archivos no implementada aún.");
        // Aquí iría la lógica real para adjuntar archivos
    };

    return (
        <div className="flex flex-col h-full bg-gray-800">
            <div className="p-4 bg-gray-700 text-white text-lg font-semibold border-b border-gray-600">
                Chat Privado con: {chatPartner}
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
                {messages.length === 0 ? (
                    <p className="text-gray-400 text-center mt-10">Inicia una conversación...</p>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`mb-2 ${msg.sender === nickname ? 'text-right' : 'text-left'}`}
                        >
                            <span
                                className={`inline-block p-2 rounded-lg ${
                                    msg.sender === nickname ? 'bg-blue-600' : 'bg-gray-600'
                                } text-white`}
                            >
                                <span className="font-bold">{msg.sender === nickname ? 'Tú' : msg.sender}: </span>
                                {msg.text}
                                <span className="block text-xs text-gray-300 mt-1">{msg.timestamp}</span>
                            </span>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} /> {/* Referencia para el auto-scroll */}
            </div>

            {showEmojiPicker && (
                <div className="absolute bottom-20 right-4 z-10"> {/* Posición del picker de emojis */}
                    <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
                </div>
            )}

            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700 bg-gray-800 flex items-center">
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

export default ChatPrivado;