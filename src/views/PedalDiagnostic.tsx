import React, { useEffect, useState } from "react";
import Button from "@atlaskit/button";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const PedalDiagnostic: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const eventData = {
        key: e.key,
        code: e.code,
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        alt: e.altKey,
        time: new Date().toLocaleTimeString(),
      };
      setEvents(prev => [eventData, ...prev].slice(0, 20));
      // Prevenir el refresh si es Ctrl+R o F5 para poder verlo
      if (e.key === "F5" || (e.ctrlKey && e.key === "r")) {
        // e.preventDefault(); 
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Container>
      <h3>Diagnóstico de Pedal</h3>
      <p>Presiona el pedal varias veces y observa qué teclas aparecen en la lista.</p>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <Button onClick={() => setEvents([])}>Limpiar</Button>
        <Button onClick={() => navigate(-1)}>Volver</Button>
      </div>

      <LogBox>
        {events.map((ev, i) => (
          <LogItem key={i}>
            <strong>[{ev.time}]</strong> Tecla: <mark>{ev.key}</mark> | Código: {ev.code} | Ctrl: {ev.ctrl ? "SÍ" : "No"} | Alt: {ev.alt ? "SÍ" : "No"}
          </LogItem>
        ))}
        {events.length === 0 && <p>Esperando input...</p>}
      </LogBox>
    </Container>
  );
};

const Container = styled.div`padding: 40px;`;
const LogBox = styled.div`background: #1e1e1e; color: #00ff00; padding: 20px; border-radius: 8px; min-height: 400px; font-family: monospace;`;
const LogItem = styled.div`margin-bottom: 8px; border-bottom: 1px solid #333; padding-bottom: 4px; mark { background: #00ff00; color: #000; padding: 0 4px; }`;

export default PedalDiagnostic;
