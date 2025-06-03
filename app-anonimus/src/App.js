import React, { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import './index.css';

// Importar componentes
import VerificacionEdad from './components/VerificacionEdad';
import UserInfoInput from './components/UserInfoInput';
import ChatGeneral from './components/ChatGeneral';
import ChatSidebar from './components/ChatSidebar';
import ChatPrivado from './components/ChatPrivado';

// URL del servidor de Socket.IO
// ¡IMPORTANTE! Reemplaza 'https://TU_URL_DEL_BACKEND_DE_RENDER_AQUI' con la URL real de tu backend cuando lo despliegues en Render.com.
const SOCKET_SERVER_URL = 'https://TU_URL_DEL_BACKEND_DE_RENDER_AQUI'; // CAMBIA ESTO DESPUÉS

// Salas de chat por provincia (constante, no cambia)
const PROVINCE_ROOMS = [
    "Buenos Aires", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes",
    "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza",
    "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis",
    "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"
].map(p => ({
    name: p,
    id: p.replace(/\s/g, '_').toLowerCase() // Nombres de sala amigables para URL
}));

function App() {
    // --- Estados de la aplicación ---
    const [isAdult, setIsAdult] = useState(null); // null: sin verificar, true: adulto, false: no adulto
    const [nickname, setNickname] = useState('');
    const [sex, setSex] = useState('');
    const [selectedProvinceRoomId, setSelectedProvinceRoomId] = useState(null);
    const [currentChat, setCurrentChat] = useState(null); // El chat actualmente visible
    const [appError, setAppError] = useState(''); // Errores generales de la aplicación/conexión

    const [usersOnline, setUsersOnline] = useState([]); // Lista de usuarios conectados
    const [unreadPrivateChats, setUnreadPrivateChats] = useState({}); // { 'nickname': true/false }
    const [privateMessagesHistory, setPrivateMessagesHistory] = useState({}); // { 'nickname': [msg1, msg2] }
    const [provinceMessagesHistory, setProvinceMessagesHistory] = useState({}); // { 'provinceId': [msg1, msg2] }
    const [unreadProvinceChats, setUnreadProvinceChats] = useState({}); // { 'provinceId': true/false }

    const [socketConnected, setSocketConnected] = useState(false); // Estado de la conexión del socket

    // Referencia al objeto socket para que persista entre renders
    const socketRef = useRef(null);

    // --- Funciones de manejo del socket ---

    // initializeSocket se encarga de crear y configurar el socket.
    // Esta función no debe ser recreada innecesariamente.
    const initializeSocket = useCallback(() => {
        console.log('🔴 [DEPURACIÓN APP] initializeSocket: Inicia conexión con Nickname:', nickname, 'Province:', selectedProvinceRoomId);

        // Si ya hay un socket en la referencia, primero desconéctalo para asegurar una nueva conexión limpia.
        if (socketRef.current) {
            console.log('🔴 [DEPURACIÓN APP] initializeSocket: Desconectando socketRef principal existente antes de crear uno nuevo.');
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        // Crear una nueva conexión Socket.IO, pasando los datos del usuario en la query.
        socketRef.current = io(SOCKET_SERVER_URL, {
            query: { nickname, sex, province: selectedProvinceRoomId },
            forceNew: true, // Siempre una nueva conexión cuando se llama a initializeSocket
            transports: ['websocket', 'polling'],
            reconnect: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000
        });

        console.log('🔴 [DEPURACIÓN APP] initializeSocket: Intentando conectar nuevo socket principal.');

        // --- Listeners de eventos del socket ---
        // Estos listeners se configuran una vez por instancia de socket.

        socketRef.current.on('connect', () => {
            console.log('🟢 [DEPURACIÓN APP] Socket CONECTADO:', socketRef.current.id);
            setSocketConnected(true);
            setAppError(''); // Limpiar errores de conexión
            // Cuando se conecta, el servidor ya debe enviarnos la información de 'info accepted' y 'user list'
            // No necesitamos emitir 'set nickname' aquí, ya se hizo en la query inicial.
        });

        socketRef.current.on('info accepted', () => {
            console.log(`✅ [DEPURACIÓN APP] Información aceptada y unido a la sala: ${selectedProvinceRoomId}`);
            // Establecer el chat actual a la sala de la provincia si aún no hay un chat activo
            setCurrentChat((prevCurrentChat) => {
                if (!prevCurrentChat || !PROVINCE_ROOMS.some(room => room.id === prevCurrentChat) || prevCurrentChat === 'input_info') {
                    return selectedProvinceRoomId; // Usar el ID de la provincia seleccionada
                }
                return prevCurrentChat; // Mantener el chat actual si ya está en una sala válida
            });
            setUnreadProvinceChats((prev) => ({ ...prev, [selectedProvinceRoomId]: false }));
        });

        socketRef.current.on('user list', (list) => {
            console.log('🔵 [DEPURACIÓN APP] Lista de usuarios actualizada:', list);
            setUsersOnline(list);
        });

        socketRef.current.on('status message', (msg) => {
            console.log('🟡 [DEPURACIÓN APP] Mensaje de estado global:', msg);
        });

        socketRef.current.on('nickname in use', (message) => {
            console.log('🟠 [DEPURACIÓN APP] Nickname en uso. Reseteando info y desconectando.');
            setAppError(message + " Por favor, reintente con otro.");
            // Limpiar datos del localStorage y estados para forzar al usuario a reingresar
            localStorage.removeItem('userNickname');
            localStorage.removeItem('userSex');
            localStorage.removeItem('selectedProvinceRoom');
            setNickname('');
            setSex('');
            setSelectedProvinceRoomId(null);
            setCurrentChat(null);
            // Desconectar el socket si está conectado, ya que el servidor nos rechazó
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            setSocketConnected(false); // Asegurar que el estado refleje la desconexión
        });

        socketRef.current.on('disconnect', (reason) => {
            console.log('🔴 [DEPURACIÓN APP] Socket DESCONECTADO. Razón:', reason);
            setSocketConnected(false);
            setUsersOnline([]); // Limpiar lista de usuarios online al desconectarse
            if (reason === 'io server disconnect') {
                setAppError('Desconectado por el servidor (ej. nickname en uso). Por favor, vuelve a iniciar sesión.');
            } else if (reason === 'io client disconnect') {
                // Esta razón es común si el cliente mismo inicia la desconexión (ej. en cleanup de useEffect)
                setAppError('Te has desconectado. Intentando reconectar...');
            } else {
                setAppError('Conexión perdida con el servidor. Intentando reconectar...');
            }
        });

        socketRef.current.on('connect_error', (err) => {
            console.error('❌ [DEPURACIÓN APP] Error de conexión del socket:', err);
            setAppError(`No se pudo conectar al servidor: ${err.message}. Intentando reconectar...`);
        });

        socketRef.current.on('error', (err) => {
            console.error('❌ [DEPURACIÓN APP] Error general del socket:', err);
            setAppError('Error de conexión con el servidor. Inténtalo de nuevo.');
        });

        socketRef.current.on('reconnect_attempt', (attemptNumber) => {
            console.log(`🔄 [DEPURACIÓN APP] Intentando reconectar... Intento ${attemptNumber}`);
            setAppError(`Intentando reconectar al servidor... (${attemptNumber})`);
        });

        socketRef.current.on('reconnect', (attemptNumber) => {
            console.log(`✅ [DEPURACIÓN APP] Reconectado al servidor después de ${attemptNumber} intentos.`);
            setSocketConnected(true);
            setAppError(''); // Limpiar error al reconectar
            // Cuando se reconecta, el servidor debería re-enviar la lista de usuarios y el estado
            setCurrentChat((prevCurrentChat) => {
                if (!prevCurrentChat || !PROVINCE_ROOMS.some(room => room.id === prevCurrentChat)) {
                    return selectedProvinceRoomId;
                }
                return prevCurrentChat;
            });
        });

        socketRef.current.on('reconnect_error', (err) => {
            console.error(`❌ [DEPURACIÓN APP] Error de reconexión:`, err);
            setAppError(`No se pudo reconectar al servidor: ${err.message}. Por favor, recarga la página.`);
        });

        socketRef.current.on('reconnect_failed', () => {
            console.error(`❌ [DEPURACIÓN APP] Falló la reconexión después de varios intentos.`);
            setAppError('No se pudo reconectar al servidor. Por favor, recarga la página.');
        });

        socketRef.current.on('chat message', (msg) => {
            console.log('💬 [DEPURACIÓN APP] Mensaje de sala (general/provincial) recibido:', msg);
            const roomName = msg.room || selectedProvinceRoomId; // Asegurar que el mensaje se guarde en la sala correcta
            setProvinceMessagesHistory((prevHistory) => ({
                ...prevHistory,
                [roomName]: [...(prevHistory[roomName] || []), msg]
            }));
            // Marcar como no leído si el chat actual no es esta sala
            if (currentChat !== roomName) {
                setUnreadProvinceChats((prev) => ({ ...prev, [roomName]: true }));
            }
        });

        socketRef.current.on('private message', (msg) => {
            console.log('🔒 [DEPURACIÓN APP] Mensaje privado recibido:', msg);
            // Determinar el compañero de chat (si soy el emisor, es el 'to'; si soy el receptor, es el 'from')
            const chatPartner = msg.from === nickname ? msg.to : msg.from;
            setPrivateMessagesHistory((prevHistory) => ({
                ...prevHistory,
                [chatPartner]: [...(prevHistory[chatPartner] || []), msg]
            }));

            // Marcar como no leído si el chat actual no es con este compañero
            if (msg.from !== nickname && currentChat !== `private_${msg.from}`) {
                setUnreadPrivateChats((prev) => ({ ...prev, [msg.from]: true }));
            }
        });

    }, [nickname, sex, selectedProvinceRoomId]); // <-- ¡CORRECCIÓN APLICADA AQUÍ! currentChat ha sido ELIMINADO de las dependencias.


    // --- Efecto para cargar datos del localStorage al inicio ---
    // Este efecto se ejecuta solo una vez al montar el componente para intentar cargar la sesión.
    useEffect(() => {
        console.log('✨ [DEPURACIÓN APP] useEffect: Inicialización de localStorage.');
        const storedIsAdult = localStorage.getItem('isAdult');
        const storedNickname = localStorage.getItem('userNickname');
        const storedSex = localStorage.getItem('userSex');
        const storedProvince = localStorage.getItem('selectedProvinceRoom');

        if (storedIsAdult === 'true') {
            setIsAdult(true);
            if (storedNickname && storedSex && storedProvince) {
                console.log('✨ [DEPURACIÓN APP] localStorage: Usuario existente detectado. Cargando info.');
                setNickname(storedNickname);
                setSex(storedSex);
                setSelectedProvinceRoomId(storedProvince);
            } else {
                console.log('✨ [DEPURACIÓN APP] localStorage: Info de usuario incompleta, reseteando. Volviendo a pedir edad.');
                // Si la edad está confirmada pero los datos de usuario no, reseteamos todo a null para volver a pedir edad y datos
                localStorage.removeItem('isAdult'); // Resetear edad para ir a la primera pantalla
                localStorage.removeItem('userNickname');
                localStorage.removeItem('userSex');
                localStorage.removeItem('selectedProvinceRoom');
                setIsAdult(null); // Esto mostrará la pantalla de VerificacionEdad
                setNickname('');
                setSex('');
                setSelectedProvinceRoomId(null);
            }
        } else if (storedIsAdult === 'false') {
            setIsAdult(false);
            console.log('✨ [DEPURACIÓN APP] localStorage: No adulto, acceso denegado.');
        } else {
            setIsAdult(null); // Mostrar verificación de edad si no hay info en localStorage
            console.log('✨ [DEPURACIÓN APP] localStorage: Sin info de edad, mostrando verificación.');
        }
    }, []);


    // --- Efecto principal para MANEJAR LA CONEXIÓN/DESCONEXIÓN DEL SOCKET ---
    // Este useEffect es CLAVE. Su trabajo es iniciar la conexión o desconectarla limpiamente.
    // Se dispara SÓLO cuando los datos de usuario (nickname, sex, provinceId) se establecen o cambian.
    // 'socketConnected' y 'currentChat' NO son dependencias aquí para evitar bucles.
    useEffect(() => {
        console.log('⚙️ [DEPURACIÓN APP] useEffect principal de Socket (Conexión/Desconexión): Evaluando conexión.');

        // Si tenemos todos los datos de usuario, y el socket aún no existe o no está conectado, inicializamos.
        if (nickname && sex && selectedProvinceRoomId && (!socketRef.current || !socketRef.current.connected)) {
            console.log('⚙️ [DEPURACIÓN APP] useEffect principal de Socket: Datos de usuario válidos. Iniciando initializeSocket().');
            initializeSocket();
        }
        // Si no tenemos todos los datos de usuario (se reseteó la sesión, o aún no se ingresaron)
        // y hay un socket conectado, lo desconectamos para limpiar el estado.
        else if ((!nickname || !sex || !selectedProvinceRoomId) && socketRef.current && socketRef.current.connected) {
            console.log("⚙️ [DEPURACIÓN APP] useEffect principal de Socket: Datos de usuario incompletos. Desconectando socket existente.");
            socketRef.current.disconnect();
            socketRef.current = null;
            setSocketConnected(false);
        }

        // FUNCIÓN DE LIMPIEZA del useEffect.
        // Se ejecuta cuando las dependencias de este useEffect cambian O el componente se desmonta.
        return () => {
            if (socketRef.current && socketRef.current.connected) { // Asegúrate de desconectar solo si está conectado
                console.log("❌ [DEPURACIÓN APP] Cleanup del useEffect principal: Desconectando socket.");
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            // Asegurarse de que el estado refleje la desconexión al limpiar
            setSocketConnected(false);
        };
    }, [nickname, sex, selectedProvinceRoomId, initializeSocket]); // Dependencias: solo la info del usuario y la función de inicialización.


    // --- Handlers de acciones de usuario ---

    const handleAdultConfirmation = (confirmed) => {
        console.log('👶 [DEPURACIÓN APP] handleAdultConfirmation: Confirmación de edad:', confirmed);
        setIsAdult(confirmed);
        localStorage.setItem('isAdult', confirmed);
        // Si se confirma la edad, y no hay nickname, vamos a la pantalla de UserInfoInput
        if (confirmed && !localStorage.getItem('userNickname')) {
            setNickname(''); // Asegura que el estado de nickname esté vacío para renderizar UserInfoInput
        }
    };

    const handleUserInfoSet = (nick, userSex, provinceId) => {
        console.log("👤 [DEPURACIÓN APP] handleUserInfoSet: Estableciendo información de usuario en estados locales y localStorage.");
        setNickname(nick);
        setSex(userSex);
        setSelectedProvinceRoomId(provinceId);
        localStorage.setItem('userNickname', nick);
        localStorage.setItem('userSex', userSex);
        localStorage.setItem('selectedProvinceRoom', provinceId);
        setAppError(''); // Limpiar cualquier error previo
        // El useEffect principal detectará estos cambios de estado y llamará a initializeSocket
    };

    const handleSelectChat = (chatId) => {
        console.log("🔥 [DEPURACIÓN APP] handleSelectChat - Se seleccionó el chat:", chatId);
        setCurrentChat(chatId);

        // Marcar mensajes como leídos al seleccionar el chat
        if (PROVINCE_ROOMS.some(room => room.id === chatId)) {
            console.log('🔥 [DEPURACIÓN APP] handleSelectChat: Es chat provincial. Marcando como leído.');
            setUnreadProvinceChats((prev) => ({ ...prev, [chatId]: false }));
        } else if (chatId.startsWith('private_')) {
            const privatePartner = chatId.replace('private_', '');
            console.log('🔥 [DEPURACIÓN APP] handleSelectChat: Es chat privado. Marcando como leído para:', privatePartner);
            setUnreadPrivateChats((prev) => ({ ...prev, [privatePartner]: false }));
        }
    };

    // Función para enviar mensajes (general o privado)
    const sendMessage = useCallback((message, type = 'province', to = null) => {
        console.log('📧 [DEPURACIÓN APP] sendMessage: Intentando enviar mensaje. Tipo:', type, 'To:', to, 'Message:', message);
        if (socketRef.current && socketRef.current.connected) {
            const msgData = {
                sender: nickname,
                text: message,
                timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
            };

            if (type === 'private' && to) {
                console.log('📧 [DEPURACIÓN APP] sendMessage: Enviando mensaje privado a:', to);
                socketRef.current.emit('private message', { to, msg: msgData });
                // ELIMINADA LA ACTUALIZACIÓN LOCAL AQUÍ para evitar la duplicación en el chat privado.
                // El mensaje se añadirá cuando se reciba de vuelta del servidor.
            } else if (type === 'province' && currentChat === selectedProvinceRoomId) {
                console.log('📧 [DEPURACIÓN APP] sendMessage: Enviando mensaje de sala a:', selectedProvinceRoomId);
                socketRef.current.emit('chat message', { ...msgData, room: selectedProvinceRoomId });
                // ELIMINADA LA ACTUALIZACIÓN LOCAL AQUÍ para evitar la duplicación en el chat general.
                // El mensaje se añadirá cuando se reciba de vuelta del servidor.
            }
        } else {
            console.error('❌ [DEPURACIÓN APP] Socket no conectado para enviar mensaje.');
            setAppError('No estás conectado al servidor. Por favor, recarga la página o revisa tu conexión.');
        }
    }, [nickname, currentChat, selectedProvinceRoomId]); // Dependencias para useCallback

    // --- Lógica para renderizar el componente de chat activo ---
    const renderChatComponent = () => {
        console.log('🎨 [DEPURACIÓN APP] renderChatComponent: Ejecutándose. Current Chat:', currentChat);
        console.log('🎨 [DEPURACIÓN APP] renderChatComponent: Info de usuario - Nickname:', nickname, 'Sex:', sex, 'Province ID:', selectedProvinceRoomId);

        // Estado inicial, antes de que el usuario haya ingresado sus datos
        if (!nickname || !sex || !selectedProvinceRoomId) {
            console.log('🎨 [DEPURACIÓN APP] renderChatComponent: Faltan datos esenciales de usuario. Retornando null.');
            return null; // O un placeholder si lo deseas
        }

        // Si no hay un chat seleccionado pero los datos de usuario son válidos (por ejemplo, después de la carga inicial)
        if (!currentChat) {
            console.log('🎨 [DEPURACIÓN APP] renderChatComponent: No hay chat seleccionado actualmente. Sugiriendo seleccionar uno.');
            // Aquí no predeterminamos a la sala provincial automáticamente, esperamos a la lógica de 'info accepted'
            return (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
                    Selecciona un chat de la barra lateral para empezar.
                </div>
            );
        }

        // Mostrar un mensaje de conexión si el socket no está activo
        if (!socketConnected) {
            console.log('🎨 [DEPURACIÓN APP] renderChatComponent: Socket no conectado. Esperando conexión para renderizar chat.');
            return (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
                    Conectando al servidor... {appError && <p className="text-red-500">{appError}</p>}
                </div>
            );
        }

        // Renderizar chat privado
        if (currentChat.startsWith('private_')) {
            const privatePartner = currentChat.replace('private_', '');
            console.log('🎨 [DEPURACIÓN APP] renderChatComponent: Condición: chat privado. Compañero:', privatePartner);
            const messages = privateMessagesHistory[privatePartner] || [];
            return (
                <ChatPrivado
                    messages={messages}
                    sendMessage={(msg) => sendMessage(msg, 'private', privatePartner)}
                    nickname={nickname}
                    chatPartner={privatePartner}
                />
            );
        }
        // Renderizar chat provincial/general
        else if (currentChat === selectedProvinceRoomId) {
            console.log('🎨 [DEPURACIÓN APP] renderChatComponent: Condición: chat provincial. ID: ', selectedProvinceRoomId);
            const province = PROVINCE_ROOMS.find(room => room.id === selectedProvinceRoomId);
            const messages = provinceMessagesHistory[selectedProvinceRoomId] || [];
            return (
                <ChatGeneral
                    messages={messages}
                    sendMessage={(msg) => sendMessage(msg, 'province')}
                    nickname={nickname}
                    provinceName={province ? province.name : 'Desconocida'}
                />
            );
        }

        // En caso de que currentChat tenga un valor inesperado
        console.log('🎨 [DEPURACIÓN APP] renderChatComponent: Condición de chat no reconocida para:', currentChat);
        return (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
                No se pudo cargar el chat. Selecciona uno válido.
            </div>
        );
    };

    // --- Renderizado condicional de la aplicación según el estado ---

    // 1. Verificación de edad
    if (isAdult === null) {
        console.log('🌐 [DEPURACIÓN APP] Renderizando VerificacionEdad.');
        return <VerificacionEdad onConfirm={handleAdultConfirmation} />;
    }

    // 2. Acceso denegado por edad
    if (isAdult === false) {
        console.log('🌐 [DEPURACIÓN APP] Renderizando mensaje de acceso denegado por edad.');
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
                <p className="text-xl">Lo siento, debes ser mayor de 18 años para usar esta aplicación.</p>
            </div>
        );
    }

    // 3. Ingreso de información de usuario (si es adulto pero no ha ingresado sus datos)
    // Se pasa PROVINCE_ROOMS al UserInfoInput para que el usuario pueda seleccionar su provincia.
    if (!nickname || !sex || !selectedProvinceRoomId) {
        console.log('🌐 [DEPURACIÓN APP] Renderizando UserInfoInput. Error:', appError);
        return <UserInfoInput onInfoSet={handleUserInfoSet} error={appError} provinceRooms={PROVINCE_ROOMS} />;
    }

    // Si todo lo anterior está bien, renderizar la interfaz principal del chat
    const currentProvince = PROVINCE_ROOMS.find(p => p.id === selectedProvinceRoomId);
    const generalChatNameDisplay = currentProvince ? `Chat General (${currentProvince.name})` : 'Chat General';

    console.log('🌐 [DEPURACIÓN APP] Renderizando Interfaz Principal de Chat. CurrentChat:', currentChat, 'Socket Connected:', socketConnected);
    return (
        <div className="flex flex-col h-screen"> {/* Cambiado a flex-col para el banner superior */}
            {/* Espacio para Google AdSense Banner Superior */}
            <div className="w-full bg-gray-800 p-2 flex items-center justify-center border-b border-gray-700">
                <p className="text-gray-400 text-sm italic">Espacio para Publicidad (Google AdSense)</p>
                {/* Reemplaza data-ad-client y data-ad-slot con tus valores reales de AdSense */}
                <ins className="adsbygoogle"
                     style={{ display: 'block', width: '728px', height: '90px' }} // Ajusta el tamaño según tu ad unit
                     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                     data-ad-slot="YYYYYYYYYYYYYYYY">
                </ins>
                <script>
                    (window.adsbygoogle = window.adsbygoogle || []).push({});
                </script>
            </div>

            <div className="flex flex-1 overflow-hidden bg-gray-900 text-white"> {/* El resto de la app, toma el espacio restante */}
                <ChatSidebar
                    usersOnline={usersOnline}
                    onSelectChat={handleSelectChat}
                    currentChat={currentChat}
                    nickname={nickname}
                    unreadPrivateChats={unreadPrivateChats}
                    generalChatNameDisplay={generalChatNameDisplay}
                    selectedProvinceRoomId={selectedProvinceRoomId}
                    unreadProvinceChats={unreadProvinceChats}
                />
                <div className="flex-1 flex flex-col">
                    {appError && ( // Mostrar errores persistentes en la interfaz principal
                        <div className="bg-red-800 text-white p-2 text-center">
                            {appError}
                        </div>
                    )}
                    {renderChatComponent()} {/* Este componente decide qué chat renderizar */}
                </div>
            </div>
        </div>
    );
}

export default App;