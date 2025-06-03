import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faSmile, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import EmojiPicker from 'emoji-picker-react';

function ChatGeneral({ messages, sendMessage, nickname, provinceName }) {
  const [inputMessage, setInputMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      // El tipo de mensaje siempre es 'province' para este componente ahora
      sendMessage(inputMessage, 'province', null);
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
    // Aquí iría la lógica para adjuntar archivos
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-blue-400">Chat General: {provinceName}</h2>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded-lg max-w-[70%] ${
              msg.sender === nickname
                ? 'bg-blue-700 ml-auto text-right'
                : 'bg-gray-700 mr-auto text-left'
            }`}
          >
            <span className="font-bold text-blue-300">{msg.sender === nickname ? 'Tú' : msg.sender}:</span>
            <p className="text-gray-100 break-words">{msg.text}</p>
            <span className="text-xs text-gray-400">{msg.timestamp}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {showEmojiPicker && (
        <div className="absolute bottom-20 right-4 z-10">
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
          placeholder="Escribe un mensaje..."
          className="flex-1 p-2 ml-4 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
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