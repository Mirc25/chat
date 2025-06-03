import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react'; // Importación necesaria para los emojis

const SOCKET_SERVER_URL = 'http://localhost:8000'; // Asegúrate de que el puerto coincida con tu backend

function ChatGeneral({ nickname }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // Estado para controlar la visibilidad del selector
  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  const emojiButtonRef = useRef(null); // Referencia al botón de emoji
  const emojiPickerRef = useRef(null); // Referencia al contenedor del selector de emoji

  useEffect(() => {
    // Conexión al servidor Socket.IO
    socketRef.current = io(SOCKET_SERVER_URL);

    // Emitir evento para unirse a la sala general al conectar
    socketRef.current.emit('join room', 'general_chat');

    // Escuchar mensajes de chat del servidor
    socketRef.current.on('chat message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    // Escuchar mensajes de estado (ej. uniones/desconexiones)
    socketRef.current.on('status message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, { text: msg, type: 'status' }]);
    });

    // Lógica para cerrar el selector de emojis al hacer clic fuera
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    // Función de limpieza al desmontar el componente
    return () => {
      socketRef.current.disconnect();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // El efecto se ejecuta solo una vez al montar

  // Efecto para hacer scroll automático al final de los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]); // Se ejecuta cada vez que cambia la lista de mensajes

  // Función para enviar mensajes
  const sendMessage = (e) => {
    e.preventDefault(); // Prevenir recarga de página al enviar formulario
    if (inputMessage.trim()) { // Si el mensaje no está vacío
      const messageData = {
        sender: nickname,
        text: inputMessage.trim(),
        timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      };
      socketRef.current.emit('chat message', messageData); // Emitir mensaje al servidor
      setInputMessage(''); // Limpiar campo de texto
      setShowEmojiPicker(false); // Cerrar selector de emojis
    }
  };

  // Función para manejar la selección de un emoji
  const onEmojiClick = (emojiObject) => {
    setInputMessage((prevInput) => prevInput + emojiObject.emoji); // Añadir emoji al input
    // Opcional: setShowEmojiPicker(false); // Cierra el selector después de elegir
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 w-full max-w-2xl mx-auto border-x border-gray-300 shadow-lg">
      {/* Barra superior del chat */}
      <div className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">Chat General</h1>
        <span className="text-sm">Conectado como: <strong className="font-semibold">{nickname}</strong></span>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === nickname ? 'justify-end' : 'justify-start'}`}
          >
            {msg.type === 'status' ? ( // Mensajes de estado (ej. usuario se unió)
              <div className="text-center text-gray-500 text-sm w-full">
                {msg.text}
              </div>
            ) : ( // Mensajes normales de chat
              <div
                className={`max-w-[70%] p-3 rounded-xl shadow-md ${
                  msg.sender === nickname
                    ? 'bg-blue-500 text-white rounded-br-none' // Burbuja propia
                    : 'bg-white text-gray-800 rounded-bl-none'  // Burbuja ajena
                }`}
              >
                <p className="text-sm font-bold mb-1">
                  {msg.sender === nickname ? 'Tú' : msg.sender}
                </p>
                <p className="text-base break-words">{msg.text}</p>
                <span className="text-xs opacity-75 mt-1 block text-right">
                  {msg.timestamp}
                </span>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* Elemento para scroll automático */}
      </div>

      {/* Barra de entrada de mensajes */}
      <form onSubmit={sendMessage} className="bg-white p-4 border-t border-gray-200 flex items-center relative"> {/* 'relative' es crucial para el posicionamiento del selector */}
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
        />
        {/* Botón de Emojis */}
        <button
          type="button" // 'type="button"' previene que el formulario se envíe
          ref={emojiButtonRef} // Asocia la referencia al botón
          onClick={() => setShowEmojiPicker((val) => !val)} // Alterna la visibilidad del selector
          className="ml-3 p-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition duration-200"
          title="Emojis"
        >
          😊
        </button>

        {/* Selector de Emojis (se muestra condicionalmente) */}
        {showEmojiPicker && (
          <div ref={emojiPickerRef} className="absolute bottom-full right-0 mb-2 z-10"> {/* 'z-10' para asegurar que esté encima */}
            <EmojiPicker onEmojiClick={onEmojiClick} theme="auto" />
          </div>
        )}

        {/* Botón de Adjuntar Archivo (aún no funcional) */}
        <button
          type="button"
          className="ml-2 p-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition duration-200"
          title="Adjuntar archivo"
        >
          📎
        </button>
        <button
          type="submit"
          className="ml-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}

export default ChatGeneral;