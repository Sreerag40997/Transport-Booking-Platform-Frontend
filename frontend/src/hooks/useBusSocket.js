import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Manage WebSocket connection for bus booking flow.
 */
export function useBusSocket(userId, onMessage) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!userId) return;

    const wsUrl = `ws://localhost:8080/api/buses/ws?userId=${userId}`;
    let socket;
    let reconnectTimeout;

    const connect = () => {
      console.log(`[WS Bus] Connecting to ${wsUrl}...`);
      socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('[WS Bus] Connection established');
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[WS Bus RECV]', data);
          if (onMessageRef.current) {
            onMessageRef.current(data);
          }
        } catch (err) {
          console.error('[WS Bus] Parse Error:', err);
        }
      };

      socket.onerror = (error) => {
        console.error('[WS Bus] Error:', error);
      };

      socket.onclose = (event) => {
        console.warn(`[WS Bus] Connection closed (code: ${event.code}). Retrying in 3s...`);
        setIsConnected(false);
        reconnectTimeout = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (socket) {
        socket.onclose = null;
        socket.close();
      }
    };
  }, [userId]);

  const sendMessage = useCallback((msg) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msg));
    }
  }, []);

  return { isConnected, sendMessage };
}
