import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import Button from "@atlaskit/button";
import { token } from "@atlaskit/tokens";
import styled from "styled-components";
import SectionMessage from "@atlaskit/section-message";
import { api } from "../api";

interface LinuxVideoDevice {
  label: string;
  path: string;
}

interface CaptureEntry {
  filePath: string;
  label: string;
}

const preferredDeviceScore = (label: string): number => {
  const lower = label.toLowerCase();

  if (lower.includes("stk1160")) return 100;
  if (lower.includes("usb 2.0 video")) return 90;
  if (lower.includes("colpo") || lower.includes("capture")) return 80;
  if (lower.includes("video grabber") || lower.includes("easycap")) return 70;
  if (lower.includes("usb video")) return 50;

  return 0;
};

const Colposcopy = () => {
  const { id } = useParams();
  const patientId = id ? Number(id) : null;
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [captures, setCaptures] = useState<CaptureEntry[]>([]);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    void initializeDevices();

    return () => {
      stopCurrentStream();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === "s") {
        event.preventDefault();
        void captureFrame();
      }
      if (key === "c") {
        event.preventDefault();
        cycleDevice();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [devices, selectedDeviceId]);

  const stopCurrentStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startStream = async (deviceId: string): Promise<boolean> => {
    stopCurrentStream();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: deviceId },
          width: { ideal: 720 },
          height: { ideal: 480 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setError("");
      return true;
    } catch {
      return false;
    }
  };

  const loadRecentCaptures = async () => {
    try {
      if (patientId) {
        const result = await api.listColposcopiesForPatient(patientId);
        setCaptures(
          result.map((entry) => ({
            filePath: entry.file_path || "",
            label: entry.file_path?.split("/").pop() ?? "captura.jpg",
          }))
        );
        return;
      }

      const result = await invoke<string[]>("list_recent_captures", { limit: 12 });
      setCaptures(
        result.map((filePath) => ({
          filePath,
          label: filePath.split("/").pop() ?? "captura.jpg",
        }))
      );
    } catch {
      setCaptures([]);
    }
  };

  const initializeDevices = async () => {
    try {
      setStatus("Solicitando acceso a cámaras...");
      setError("");

      const permissionStream = await navigator.mediaDevices.getUserMedia({ video: true });
      permissionStream.getTracks().forEach((track) => track.stop());

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter((device) => device.kind === "videoinput");
      setDevices(videoDevices);
      await loadRecentCaptures();

      if (videoDevices.length === 0) {
        setError("No se detectaron cámaras en el sistema.");
        setStatus("");
        return;
      }

      const ranked = [...videoDevices].sort(
        (a, b) => preferredDeviceScore(b.label) - preferredDeviceScore(a.label)
      );
      let selected = "";

      if (ranked.length > 0 && preferredDeviceScore(ranked[0].label) > 0) {
        selected = ranked[0].deviceId;
        setStatus(`Intentando conectar colposcopio: ${ranked[0].label || "dispositivo externo"}`);

        try {
          const linuxDevices = await invoke<LinuxVideoDevice[]>("list_linux_video_devices");
          const linuxMatch = linuxDevices.find((dev) => {
            const l = dev.label.toLowerCase();
            return l.includes("stk1160") || l.includes("usb 2.0 video") || l.includes("easycap");
          });

          if (linuxMatch) {
            await invoke("setup_stk1160_linux", { devicePath: linuxMatch.path });
          }
        } catch {
          // Si la configuración Linux falla, continuamos con fallback por navegador.
        }
      } else {
        selected = ranked[0].deviceId;
        setStatus("No se detectó colposcopio dedicado, iniciando webcam...");
      }

      if (!(await startStream(selected))) {
        const fallback = ranked.find((device) => device.deviceId !== selected);
        if (!fallback || !(await startStream(fallback.deviceId))) {
          setError("No fue posible iniciar ninguna cámara disponible.");
          setStatus("");
          return;
        }
        setSelectedDeviceId(fallback.deviceId);
        setStatus("Conectado en modo respaldo con webcam.");
        return;
      }

      setSelectedDeviceId(selected);
      const selectedLabel = ranked.find((d) => d.deviceId === selected)?.label;
      if (selectedLabel && preferredDeviceScore(selectedLabel) > 0) {
        setStatus("Colposcopio conectado correctamente.");
      } else {
        setStatus("Conectado con webcam en modo respaldo.");
      }
    } catch {
      setError("No se pudo inicializar la cámara. Revise permisos del sistema.");
      setStatus("");
    }
  };

  const selectDevice = async (deviceId: string) => {
    const ok = await startStream(deviceId);
    if (!ok) {
      setError("No se pudo iniciar la cámara seleccionada.");
      return;
    }
    setSelectedDeviceId(deviceId);
    setStatus("Fuente de video actualizada.");
  };

  const cycleDevice = () => {
    if (devices.length <= 1) return;

    const current = devices.findIndex((d) => d.deviceId === selectedDeviceId);
    const nextIndex = current === -1 ? 0 : (current + 1) % devices.length;
    void selectDevice(devices[nextIndex].deviceId);
  };

  const captureFrame = async () => {
    if (!videoRef.current) return;

    setIsCapturing(true);

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);

      try {
        const filePath = await invoke<string>("save_capture_image", { base64Data: dataUrl });
        if (patientId) {
          await api.createColposcopy({
            patient_id: patientId,
            fecha_hora: new Date().toISOString(),
            file_path: filePath,
          });
        }
        const label = filePath.split("/").pop() ?? "captura.jpg";
        setCaptures((prev) => [{ filePath, label }, ...prev].slice(0, 12));
        setStatus(`Imagen capturada correctamente: ${label}`);
        setError("");
      } catch {
        setError("No se pudo guardar la captura en disco.");
      }
    }

    setIsCapturing(false);
  };

  return (
    <Container>
      <Sidebar>
        <SidebarTitle>Dispositivos</SidebarTitle>
        <DeviceList>
          {devices.map((device) => (
            <DeviceItem
              key={device.deviceId}
              active={device.deviceId === selectedDeviceId}
              onClick={() => void selectDevice(device.deviceId)}
            >
              {device.label || `Cámara ${device.deviceId.substring(0, 5)}`}
            </DeviceItem>
          ))}
        </DeviceList>

        <Button
          shouldFitContainer
          onClick={() => void initializeDevices()}
        >
          Refrescar Lista
        </Button>

        <Button
          shouldFitContainer
          onClick={cycleDevice}
        >
          Cambiar Cámara (C)
        </Button>

        {status && (
          <StatusMessage>
            <SectionMessage appearance="success">
              <p>{status}</p>
            </SectionMessage>
          </StatusMessage>
        )}

        <GalleryTitle>Capturas recientes</GalleryTitle>
        <GalleryList>
          {captures.length === 0 && <CaptureHint>Aún no hay capturas guardadas.</CaptureHint>}
          {captures.map((capture) => (
            <CaptureItem key={capture.filePath}>
              <strong>{capture.label}</strong>
              <CapturePath>{capture.filePath}</CapturePath>
            </CaptureItem>
          ))}
        </GalleryList>
      </Sidebar>

      <MainArea>
        {error && <SectionMessage appearance="error"><p>{error}</p></SectionMessage>}
        <VideoWrapper>
          <StyledVideo ref={videoRef} autoPlay playsInline />
        </VideoWrapper>
        <Controls>
          <Button
            appearance="primary"
            onClick={() => void captureFrame()}
            isDisabled={isCapturing}
          >
            {isCapturing ? "Guardando..." : "Capturar Imagen (S)"}
          </Button>
        </Controls>
      </MainArea>
    </Container>
  );
};

const Container = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 30px;
  height: calc(100vh - 140px);
`;

const Sidebar = styled.div`
  background: ${token('color.background.neutral.subtle', '#F4F5F7')};
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-right: 1px solid ${token('color.border', '#DFE1E6')};
`;

const SidebarTitle = styled.h4`
  margin: 0 0 20px 0;
  text-transform: uppercase;
  font-size: 12px;
  color: ${token('color.text.subtle', '#6B778C')};
`;

const DeviceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 30px;
`;

const DeviceItem = styled.div<{ active: boolean }>`
  padding: 12px;
  background: ${props => props.active ? token('color.background.selected', '#DEEBFF') : 'white'};
  border: 1px solid ${props => props.active ? token('color.border.selected', '#2684FF') : token('color.border', '#DFE1E6')};
  color: ${props => props.active ? token('color.text.selected', '#0052CC') : 'inherit'};
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background: ${token('color.background.neutral.subtle', '#EBECF0')};
  }
`;

const StatusMessage = styled.div`
  margin-top: 10px;
`;

const GalleryTitle = styled.h5`
  margin: 14px 0 0 0;
  text-transform: uppercase;
  font-size: 12px;
  color: ${token('color.text.subtle', '#6B778C')};
`;

const GalleryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 40vh;
  overflow: auto;
`;

const CaptureItem = styled.div`
  background: white;
  border: 1px solid ${token('color.border', '#DFE1E6')};
  padding: 10px;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CapturePath = styled.span`
  color: ${token('color.text.subtle', '#6B778C')};
  word-break: break-all;
`;

const CaptureHint = styled.p`
  margin: 0;
  color: ${token('color.text.subtle', '#6B778C')};
  font-size: 12px;
`;

const MainArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const VideoWrapper = styled.div`
  flex: 1;
  background: black;
  border: 1px solid ${token('color.border', '#DFE1E6')};
  overflow: hidden;
`;

const StyledVideo = styled.video`
  width: 100%;
  height: 100%;
  background: black;
  object-fit: contain;
`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  padding: 10px 0;

  button {
    min-height: 60px;
    min-width: 280px;
    font-size: 18px;
  }
`;

export default Colposcopy;
