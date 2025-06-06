import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

import './index.css';

// Importa tus componentes
import VerificacionEdad from './components/VerificacionEdad';
import NicknameInput from './components/NicknameInput';
import ChatGeneral from './components/ChatGeneral';
import ChatSidebar from './components/ChatSidebar';
import ChatPrivado from './components/ChatPrivado';

// Importa FontAwesomeIcon y los iconos necesarios
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faBars, faComments, faUsers, faEnvelope } from '@fortawesome/free-solid-svg-icons';

// URL del servidor Socket.IO (¡REEMPLAZA ESTO CON LA URL REAL DE TU BACKEND EN RENDER!)
const SOCKET_SERVER_URL = 'https://mirc25-chat-backend2.onrender.com'; // <--- ¡ASEGÚRATE DE QUE ESTA ES TU URL REAL DE RENDER!

// Inicializa el objeto de audio fuera del componente para que no se re-inicialice en cada render.
// Asegúrate de tener un archivo 'notificacion.mp3' en tu carpeta 'public'.
const audio = new Audio('/notificacion.mp3');

function App() {
  const [isAdult, setIsAdult] = useState(null);
  const [nickname, setNickname] = useState('');
  const [userSex, setUserSex] = useState('');
  const [userProvince, setUserProvince] = useState(''); // Nuevo estado para la provincia
  const [currentChat, setCurrentChat] = useState('general_chat');
  const [appError, setAppError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);

  const [usersOnline, setUsersOnline] = useState([]);
  const [unreadPrivateChats, setUnreadPrivateChats] = useState({});

  const [globalMessages, setGlobalMessages] = useState([]);
  const [privateChatMessages, setPrivateChatMessages] = useState({});

  const socketRef = useRef(null);

  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const hasAnyUnreadPrivateChat = Object.values(unreadPrivateChats).some(status => status === true);

  const toggleSidebar = () => {
    setIsSidebarOpen(prevState => !prevState);
  };

  const playNotificationSound = () => {
    console.log("Intentando reproducir sonido de notificación...");
    if (audio && userInteracted) {
      audio.currentTime = 0;
      audio.play().catch(e => console.error("Error al reproducir sonido de notificación:", e));
    } else if (!userInteracted) {
      console.log("Audio bloqueado: El usuario aún no ha interactuado con la página.");
    }
  };

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  useEffect(() => {
    const storedIsAdult = localStorage.getItem('isAdult');
    const storedNickname = localStorage.getItem('userNickname');
    const storedUserSex = localStorage.getItem('userSex');
    const storedUserProvince = localStorage.getItem('userProvince'); // Cargar provincia

    if (storedIsAdult === 'true') {
      setIsAdult(true);
    } else if (storedIsAdult === 'false') {
      setIsAdult(false);
    } else {
      setIsAdult(null);
    }

    if (storedNickname && storedUserSex && storedUserProvince) { // Validar también provincia
      setNickname(storedNickname);
      setUserSex(storedUserSex);
      setUserProvince(storedUserProvince); // Establecer provincia
    } else {
      setNickname('');
      setUserSex('');
      setUserProvince(''); // Limpiar provincia
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Conectar si tenemos nickname, sexo Y provincia
    if (!isLoading && nickname && userSex && userProvince && !socketRef.current) {
        socketRef.current = io(SOCKET_SERVER_URL, {
            forceNew: false
        });

        socketRef.current.on('connect', () => {
          console.log('Socket conectado:', socketRef.current.id);
          // Enviar nickname, sexo Y provincia al servidor
          socketRef.current.emit('register', { username: nickname, gender: userSex, province: userProvince });
        });

        socketRef.current.on('user list', (list) => {
          setUsersOnline(list);
        });

        socketRef.current.on('status message', (msg) => {
            console.log('Mensaje de estado global:', msg);
        });

        socketRef.current.on('nickname in use', (message) => {
            setAppError(message + " Por favor, reintente con otro.");
            localStorage.removeItem('userNickname');
            localStorage.removeItem('userSex');
            localStorage.removeItem('userProvince'); // Limpiar provincia
            setNickname('');
            setUserSex('');
            setUserProvince(''); // Limpiar provincia
            socketRef.current.disconnect();
            socketRef.current = null;
        });

        socketRef.current.on('disconnect', () => {
          console.log('Socket desconectado.');
          setUsersOnline([]);
        });

        socketRef.current.on('chat message', (msg) => {
          setGlobalMessages((prevMessages) => [...prevMessages, msg]);
        });

        socketRef.current.on('private message', (msg) => {
            console.log('Mensaje privado recibido en App.js:', msg);

            const partnerSocketId = msg.senderSocketId === socketRef.current.id ? msg.to : msg.senderSocketId;

            setPrivateChatMessages((prevMessages) => {
                const updatedMessages = { ...prevMessages };
                if (!updatedMessages[partnerSocketId]) {
                    updatedMessages[partnerSocketId] = [];
                }
                updatedMessages[partnerSocketId] = [...updatedMessages[partnerSocketId], msg];
                return updatedMessages;
            });

            if (msg.senderSocketId !== socketRef.current.id &&
                (currentChat !== `private_${partnerSocketId}` || document.hidden || !document.hasFocus)) {
                playNotificationSound();
                setUnreadPrivateChats((prev) => ({
                    ...prev,
                    [partnerSocketId]: true
                }));
            }
        });

        socketRef.current.on('global history', (history) => {
          setGlobalMessages(history);
        });
    }

    return () => {
      // Desconectar si falta nickname, sexo O provincia
      if (socketRef.current && (!nickname || !userSex || !userProvince)) {
         socketRef.current.disconnect();
         socketRef.current = null;
      }
    };
  }, [isLoading, nickname, userSex, userProvince, currentChat, userInteracted, isMobile]); // Añadir userProvince a dependencias

  const handleAdultConfirmation = (confirmed) => {
    setIsAdult(confirmed);
    localStorage.setItem('isAdult', confirmed);
    setUserInteracted(true);
  };

  // Actualizado: recibe también la provincia
  const handleNicknameSet = (nick, sex, province) => {
    setNickname(nick);
    setUserSex(sex);
    setUserProvince(province); // Guardar provincia
    localStorage.setItem('userNickname', nick);
    localStorage.setItem('userSex', sex);
    localStorage.setItem('userProvince', province); // Guardar provincia en localStorage
    setAppError('');
    setUserInteracted(true);
  };

  const handleSelectChat = (chatId) => {
    setCurrentChat(chatId);
    if (isMobile) {
        setIsSidebarOpen(false);
    }
    if (chatId.startsWith('private_')) {
        const partnerSocketId = chatId.substring(8);
        setUnreadPrivateChats((prev) => ({
            ...prev,
            [partnerSocketId]: false
        }));
    }
    setUserInteracted(true);
  };

  const sendMessage = (messageText, messageType, recipientSocketId = null, file = null) => {
    if (!socketRef.current || !nickname || !userSex) {
        console.error("Socket no está conectado o usuario no registrado. No se puede enviar mensaje.");
        return;
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let messageData = {
        username: nickname,
        gender: userSex,
        province: userProvince, // Incluir provincia en los mensajes
        timestamp: timestamp,
        senderSocketId: socketRef.current.id,
        type: 'text',
        text: messageText
    };

    if (file) {
        if (file.type.startsWith('image/')) {
            messageData.type = 'image';
            messageData.url = file.base64;
        } else {
            messageData.type = 'file';
            messageData.url = file.base64;
            messageData.fileName = file.name;
        }
        messageData.text = file.name;
    }

    if (messageType === 'private' && recipientSocketId) {
        const fullMessageForEmit = { ...messageData, to: recipientSocketId };
        socketRef.current.emit('private message', { to: recipientSocketId, message: fullMessageForEmit });
    } else {
        socketRef.current.emit('chat message', messageData);
    }
  };

  const onlineUsersMap = Object.fromEntries(usersOnline.map(user => [user.id, user]));

  const currentChatPartnerSocketId = currentChat.startsWith('private_') ? currentChat.substring(8) : null;
  const currentChatPartnerNickname = currentChatPartnerSocketId ? onlineUsersMap[currentChatPartnerSocketId]?.username : '';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white text-2xl">
        Cargando...
      </div>
    );
  }

  if (appError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-700 text-white px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error de la Aplicación:</strong>
          <span className="block sm:inline"> {appError}</span>
          <button
                onClick={() => {
                  setAppError('');
                  localStorage.removeItem('userNickname');
                  localStorage.removeItem('userSex');
                  localStorage.removeItem('userProvince'); // Limpiar provincia
                  setNickname('');
                  setUserSex('');
                  setUserProvince(''); // Limpiar provincia
                  setIsAdult(null);
                  if (socketRef.current) {
                    socketRef.current.disconnect();
                    socketRef.current = null;
                  }
                  setUserInteracted(false);
                }}
            className="mt-3 bg-red-800 hover:bg-red-900 text-white font-bold py-2 px-4 rounded"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Si no hay nickname, sexo O provincia, el usuario debe registrarse
  if (isAdult === null) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <VerificacionEdad onConfirmAdult={handleAdultConfirmation} />
      </div>
    );
  } else if (isAdult === false) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-700 text-white px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Acceso Denegado:</strong>
          <span className="block sm:inline"> Debes ser mayor de 18 años para acceder.</span>
        </div>
      </div>
    );
  } else if (isAdult === true && (!nickname || !userSex || !userProvince)) { // Validar también provincia
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <NicknameInput onSetNickname={handleNicknameSet} setAppError={setAppError} />
      </div>
    );
  } else if (isAdult === true && nickname && userSex && userProvince) { // Validar también provincia
    return (
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar del chat */}
        <ChatSidebar
          onSelectChat={handleSelectChat}
          currentChat={currentChat}
          nickname={nickname}
          usersOnline={usersOnline}
          unreadPrivateChats={unreadPrivateChats}
          isMobile={isMobile}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />

        {/* Overlay para cuando la sidebar está abierta en móvil */}
        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={toggleSidebar}
          ></div>
        )}

        {/* Contenido principal del chat */}
        {/* Usamos w-full para asegurar que ocupe todo el ancho disponible en móvil cuando la sidebar está oculta */}
        <div className={`flex-1 flex flex-col w-full ${isMobile && isSidebarOpen ? 'hidden' : ''}`}>

          {/* Nueva Barra de Botones de Navegación Fijos (Solo visible en móvil) */}
          {isMobile && (
              <div className="fixed bottom-16 left-0 w-full bg-gray-800 border-t border-gray-700 z-20 flex justify-around p-2 h-12"> {/* bottom-16 para que esté sobre la barra de entrada (que es h-16) */}
                  <button
                      onClick={() => handleSelectChat('general_chat')}
                      className={`flex-1 mx-1 p-2 rounded-md text-sm font-semibold transition-colors duration-200 flex flex-col items-center justify-center ${
                          currentChat === 'general_chat' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                      }`}
                  >
                      <FontAwesomeIcon icon={faComments} size="lg" /> {/* Solo icono */}
                  </button>
                  <button
                      onClick={() => handleSelectChat('online_users_list')}
                      className={`flex-1 mx-1 p-2 rounded-md text-sm font-semibold transition-colors duration-200 flex flex-col items-center justify-center ${
                          currentChat === 'online_users_list' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                      }`}
                  >
                      <FontAwesomeIcon icon={faUsers} size="lg" /> {/* Solo icono */}
                  </button>
                  <button
                      onClick={() => {
                          const firstUnreadChatId = Object.keys(unreadPrivateChats).find(id => unreadPrivateChats[id] === true);
                          if (firstUnreadChatId) {
                              handleSelectChat(`private_${firstUnreadChatId}`);
                          } else if (usersOnline.length > 1) { // Si no hay no leídos, abre el primer privado disponible
                              const firstPrivateChatUser = usersOnline.find(u => u.id !== socketRef.current.id);
                              if (firstPrivateChatUser) {
                                  handleSelectChat(`private_${firstPrivateChatUser.id}`);
                              } else {
                                  handleSelectChat('online_users_list'); // Si no hay nadie mas, muestra conectados
                              }
                          } else {
                            handleSelectChat('general_chat'); // Si no hay nadie mas, vuelve al general
                          }
                      }}
                      className={`flex-1 mx-1 p-2 rounded-md text-sm font-semibold relative transition-colors duration-200 flex flex-col items-center justify-center ${
                          currentChat.startsWith('private_') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                      }`}
                  >
                      <FontAwesomeIcon icon={faEnvelope} size="lg" /> {/* Solo icono */}
                      {hasAnyUnreadPrivateChat && (
                          <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
                      )}
                  </button>
              </div>
          )}


          {currentChat === 'general_chat' && (
            <ChatGeneral
              nickname={nickname}
              messages={globalMessages ?? []}
              sendMessage={sendMessage}
              userSex={userSex}
              onlineUsersData={onlineUsersMap}
              onSelectChat={handleSelectChat}
              mySocketId={socketRef.current?.id}
              isMobile={isMobile}
              toggleSidebar={toggleSidebar}
            />
          )}
          {currentChat.startsWith('private_') && (
                  <ChatPrivado
                      nickname={nickname}
                      chatPartner={currentChatPartnerNickname}
                      chatPartnerSocketId={currentChatPartnerSocketId}
                      mySocketId={socketRef.current?.id}
                      messages={privateChatMessages[currentChatPartnerSocketId] || []}
                      sendMessage={sendMessage}
                      userSex={userSex}
                      onlineUsersData={onlineUsersMap}
                      isMobile={isMobile}
                      toggleSidebar={toggleSidebar}
                  />
              )}
              {currentChat === 'online_users_list' && (
                  <div className="flex-1 flex flex-col bg-gray-800">
                      <div className="p-4 bg-indigo-900 text-white text-lg font-semibold border-b border-gray-600 flex justify-between items-center">
                          {isMobile && (
                              <button
                                  onClick={toggleSidebar}
                                  className="text-gray-400 hover:text-white mr-4"
                                  aria-label="Abrir menú"
                              >
                                  <FontAwesomeIcon icon={faBars} size="lg" />
                              </button>
                          )}
                          Usuarios Conectados
                      </div>
                      <div className="flex-1 p-4 overflow-y-auto">
                          <p className="text-gray-300 mb-4">Selecciona un usuario de la lista para iniciar un chat privado.</p>
                          {usersOnline.length === 0 && <p className="text-gray-400">No hay otros usuarios conectados.</p>}
                          <ul className="space-y-2">
                              {usersOnline.map(user => (
                                  user.id !== socketRef.current.id && (
                                      <li key={user.id}>
                                          <button
                                              onClick={() => handleSelectChat(`private_${user.id}`)}
                                              className="w-full text-left p-2 bg-gray-700 hover:bg-gray-600 rounded-md flex items-center transition-colors duration-200"
                                          >
                                              <FontAwesomeIcon icon={faUserCircle} className="mr-3 text-gray-400" />
                                              <span className="font-semibold text-white">{user.username}</span>
                                              {user.gender && <span className="ml-2 text-sm text-gray-400">({user.gender})</span>}
                                          </button>
                                      </li>
                                  )
                              ))}
                          </ul>
                      </div>
                  </div>
              )}
            </div>
          </div>
        );
      }
    }

    export default App;
