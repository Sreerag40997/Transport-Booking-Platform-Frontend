import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Manage WebSocket connection for flight booking flow.
 */
export function useFlightSocket(userId, onMessage) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!userId) return;

    const wsUrl = `ws://localhost:8080/api/flights/ws?userId=${userId}`;
    let socket;

    try {
      socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessageRef.current) {
            onMessageRef.current(data);
          }
        } catch (err) {
          console.error('[WS] Parse Error:', err);
        }
      };

      socket.onerror = (error) => {
        console.error('[WS] Error:', error);
      };

      socket.onclose = () => {
        setIsConnected(false);
      };

    } catch (err) {
      console.error('[WS] Connection failed:', err);
    }

    return () => {
      if (socket) {
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
