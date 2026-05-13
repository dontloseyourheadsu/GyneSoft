import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Button from "@atlaskit/button";
import styled, { keyframes, css } from "styled-components";
import { api } from "../api";
import diagramaGenitales from "../assets/diagrams/diagrama1_pendiente.svg";
import diagramaCuadrantes from "../assets/diagrams/diagrama2_cuadrado.svg";
import type { Patient, ColposcopyEntry, ClinicalHistory } from "../types";

const Colposcopy: React.FC = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const studyId = searchParams.get("studyId");
  const navigate = useNavigate();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [, setHistory] = useState<ClinicalHistory | null>(null);
  const [form, setForm] = useState<Partial<ColposcopyEntry>>({
    patient_id: Number(id),
    fecha_hora: new Date().toISOString(),
    colposcopia_tipo: "Correcto",
    cervix: "Eutrófico",
    zona_transformacion: "Normal",
    superficie: "Lisa",
    bordes: "Definidos",
    epitelio_acetoblanco: "Tenue",
    prueba_schiller: "Negativo"
  });

  const [rustFrame, setRustFrame] = useState<string | null>(null);
  const rustFrameRef = useRef<string | null>(null);
  const streamActiveRef = useRef(false);
  const [captures, setCaptures] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(false);
  const [diagramTool, setDiagramTool] = useState<"mark" | "erase">("mark");
  const [diagramMarks, setDiagramMarks] = useState<{ genitales: DiagramMark[]; cuadrantes: DiagramMark[] }>({
    genitales: [],
    cuadrantes: []
  });

  const captureFrame = useCallback(() => {
    const currentFrame = rustFrameRef.current;
    if (currentFrame) {
      setCaptures(prev => [currentFrame, ...prev]);
      setFlash(true);
      setTimeout(() => setFlash(false), 150);
    }
  }, []);

  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      // Pedal logic: F5 or Ctrl+C
      if (e.key === "F5" || (e.ctrlKey && e.key.toLowerCase() === "c")) {
        e.preventDefault();
        captureFrame();
      }
    };
    window.addEventListener("keydown", handleGlobalKeys);

    loadData();
    startCamera();
    return () => { 
      streamActiveRef.current = false;
      window.removeEventListener("keydown", handleGlobalKeys);
    };
  }, [id, studyId, captureFrame]);

  const loadData = async () => {
    if (!id) return;
    try {
      const p = await api.getPatient(Number(id));
      setPatient(p);

      if (studyId) {
        const study = await api.getColposcopy(Number(studyId));
        setForm(study);
        setCaptures(study.captures || []);
        
        const marks = { genitales: [], cuadrantes: [] };
        if (study.diagram_genitales_marks) {
          try { marks.genitales = JSON.parse(study.diagram_genitales_marks); } catch(e) {}
        }
        if (study.diagram_cuadrantes_marks) {
          try { marks.cuadrantes = JSON.parse(study.diagram_cuadrantes_marks); } catch(e) {}
        }
        setDiagramMarks(marks);
      } else {
        const hList = await api.listClinicalHistoriesForPatient(Number(id));
        if (hList && hList.length > 0) {
          const h = hList[0];
          setHistory(h);
          setForm(prev => ({
            ...prev,
            menarca: h.menarca,
            ritmo: h.ritmo,
            mpf: h.metodo_anticonceptivo,
            ivsa: h.ivsa,
            gestas: h.gesta,
            partos: h.para,
            abortos: h.abortos,
            cesareas: h.cesareas,
            fum: h.fur,
            ultimo_pap: h.doc
          }));
        }
      }
    } catch (e) { console.error(e); }
  };

  const startCamera = async () => {
    try {
      let stkPath = "/dev/video4";
      try {
        const linuxDevs = await (api as any).listLinuxVideoDevices();
        const stk = (linuxDevs as any[]).find(d => d.label.toLowerCase().includes("stk1160"));
        if (stk) {
          stkPath = stk.path;
          await (api as any).setupStk1160Linux(stkPath);
        }
      } catch (e) { console.warn("Auto-config STK failed:", e); }

      streamActiveRef.current = true;
      runRustStream(stkPath);
    } catch (e) { window.alert("No se pudo acceder a la cámara: " + e); }
  };

  const runRustStream = async (path: string) => {
    if (!streamActiveRef.current) return;
    try {
      const data = await (api as any).testCameraCapture(path);
      setRustFrame(data);
      rustFrameRef.current = data;
    } catch (e) { console.error("Rust stream error:", e); }
    setTimeout(() => runRustStream(path), 100);
  };

  const moveCapture = (index: number, direction: 'up' | 'down') => {
    const newCaptures = [...captures];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newCaptures.length) return;
    [newCaptures[index], newCaptures[targetIndex]] = [newCaptures[targetIndex], newCaptures[index]];
    setCaptures(newCaptures);
  };

  const saveStudy = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const finalForm: ColposcopyEntry = { 
        ...form, 
        captures,
        diagram_genitales_marks: JSON.stringify(diagramMarks.genitales),
        diagram_cuadrantes_marks: JSON.stringify(diagramMarks.cuadrantes)
      } as ColposcopyEntry;
      
      if (studyId) {
        await api.updateColposcopy(Number(studyId), finalForm);
        window.alert("Estudio actualizado con éxito");
      } else {
        await api.createColposcopy(finalForm);
        window.alert("Estudio guardado con éxito");
      }
      navigate(`/patient/${id}`);
    } catch (e) { window.alert("Error al guardar: " + e); }
    finally { setSaving(false); }
  };

  const updateField = (k: keyof ColposcopyEntry, v: any) => setForm(s => ({ ...s, [k]: v }));

  const handleDiagramClick = (key: "genitales" | "cuadrantes", e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    if (diagramTool === "mark") {
      const newMark: DiagramMark = { id: `${Date.now()}-${Math.random()}`, x, y };
      setDiagramMarks(prev => ({ ...prev, [key]: [newMark, ...prev[key]] }));
      return;
    }

    const eraseRadiusPx = 14;
    setDiagramMarks(prev => {
      const target = prev[key];
      if (target.length === 0) return prev;
      let closestIndex = -1;
      let closestDistance = Infinity;
      target.forEach((mark, index) => {
        const dx = (mark.x * rect.width) - (x * rect.width);
        const dy = (mark.y * rect.height) - (y * rect.height);
        const distance = Math.hypot(dx, dy);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      if (closestIndex === -1 || closestDistance > eraseRadiusPx) return prev;
      return { ...prev, [key]: target.filter((_, index) => index !== closestIndex) };
    });
  };

  return (
    <Container>
      <Header>
        <h2>Estudio de Colposcopia - {patient?.nombre}</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button onClick={() => navigate(`/patient/${id}`)}>Cancelar</Button>
          <Button appearance="primary" onClick={saveStudy} isDisabled={saving}>Guardar Estudio</Button>
        </div>
      </Header>

      <MainLayout>
        <Sidebar>
          <Section>
            <SectionTitle>Captura en Vivo (F5 o Pedal)</SectionTitle>
            <VideoWrapper $flash={flash}>
              {rustFrame ? (
                <img src={rustFrame} alt="Live Stream" />
              ) : (
                <div style={{color:'#666', fontSize:'12px'}}>Iniciando cámara...</div>
              )}
              <CaptureBtn onClick={captureFrame}>Capturar Foto</CaptureBtn>
            </VideoWrapper>
          </Section>

          <Section>
             <SectionTitle>Diagramas</SectionTitle>
             <DiagramToolbar>
               <Button isSelected={diagramTool === "mark"} onClick={() => setDiagramTool("mark")}>Marcar X azul</Button>
               <Button isSelected={diagramTool === "erase"} onClick={() => setDiagramTool("erase")}>Borrar marcas</Button>
             </DiagramToolbar>
             <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                <DiagramBox>
                   <DiagramCanvas onClick={(e) => handleDiagramClick("genitales", e)}>
                     <img src={diagramaGenitales} alt="Genitales" />
                     <DiagramOverlay viewBox="0 0 1 1" preserveAspectRatio="none">
                       {diagramMarks.genitales.map(mark => (
                         <React.Fragment key={mark.id}>
                           <line x1={mark.x - 0.03} y1={mark.y - 0.03} x2={mark.x + 0.03} y2={mark.y + 0.03} />
                           <line x1={mark.x + 0.03} y1={mark.y - 0.03} x2={mark.x - 0.03} y2={mark.y + 0.03} />
                         </React.Fragment>
                       ))}
                     </DiagramOverlay>
                   </DiagramCanvas>
                   <p>Genitales Externos</p>
                </DiagramBox>
                <DiagramBox>
                   <DiagramCanvas onClick={(e) => handleDiagramClick("cuadrantes", e)}>
                     <img src={diagramaCuadrantes} alt="Cuadrantes" />
                     <DiagramOverlay viewBox="0 0 1 1" preserveAspectRatio="none">
                       {diagramMarks.cuadrantes.map(mark => (
                         <React.Fragment key={mark.id}>
                           <line x1={mark.x - 0.03} y1={mark.y - 0.03} x2={mark.x + 0.03} y2={mark.y + 0.03} />
                           <line x1={mark.x + 0.03} y1={mark.y - 0.03} x2={mark.x - 0.03} y2={mark.y + 0.03} />
                         </React.Fragment>
                       ))}
                     </DiagramOverlay>
                   </DiagramCanvas>
                   <p>Cuadrantes Cervicales</p>
                </DiagramBox>
             </div>
          </Section>

          <Section>
            <SectionTitle>Capturas Ordenables</SectionTitle>
            <GalleryWrapper>
              <GalleryList>
                {captures.map((cap, i) => (
                  <CaptureItem key={i}>
                    <Controls>
                      <IconButton onClick={() => moveCapture(i, 'up')} disabled={i === 0}>▲</IconButton>
                      <IconButton onClick={() => moveCapture(i, 'down')} disabled={i === captures.length - 1}>▼</IconButton>
                    </Controls>
                    <img src={cap} alt={`Captura ${i+1}`} />
                    <span style={{flex: 1, textAlign:'center'}}>Captura {i+1}</span>
                    <Button appearance="subtle" onClick={() => setCaptures(c => c.filter((_, idx) => idx !== i))}>X</Button>
                  </CaptureItem>
                ))}
                {captures.length === 0 && <p style={{fontSize:'12px', color:'#666', textAlign:'center', padding:'20px'}}>No hay capturas aún.</p>}
              </GalleryList>
            </GalleryWrapper>
          </Section>
        </Sidebar>

        <FormScroll>
          <Section>
            <SectionTitle>1. Identificación y Envío</SectionTitle>
            <Grid columns={2}>
              <Field><Label>Envío por</Label><Input value={form.envio || ""} onChange={e=>updateField('envio', e.target.value)} /></Field>
              <Field><Label>Fecha Estudio</Label><Input type="date" value={form.fecha_hora?.split('T')[0] || ""} onChange={e=>updateField('fecha_hora', e.target.value)} /></Field>
            </Grid>
          </Section>

          <Section>
            <SectionTitle>2. Datos Gineco-Obstétricos</SectionTitle>
            <Grid columns={3}>
              <Field><Label>Menarca</Label><Input value={form.menarca || ""} onChange={e=>updateField('menarca', e.target.value)} /></Field>
              <Field><Label>Ritmo</Label><Input value={form.ritmo || ""} onChange={e=>updateField('ritmo', e.target.value)} /></Field>
              <Field><Label>MPF</Label><Input value={form.mpf || ""} onChange={e=>updateField('mpf', e.target.value)} /></Field>
              <Field><Label>IVSA</Label><Input value={form.ivsa || ""} onChange={e=>updateField('ivsa', e.target.value)} /></Field>
              <Field><Label>G</Label><Input value={form.gestas || ""} onChange={e=>updateField('gestas', e.target.value)} /></Field>
              <Field><Label>P</Label><Input value={form.partos || ""} onChange={e=>updateField('partos', e.target.value)} /></Field>
              <Field><Label>A</Label><Input value={form.abortos || ""} onChange={e=>updateField('abortos', e.target.value)} /></Field>
              <Field><Label>C</Label><Input value={form.cesareas || ""} onChange={e=>updateField('cesareas', e.target.value)} /></Field>
              <Field><Label>FUM</Label><Input type="date" value={form.fum || ""} onChange={e=>updateField('fum', e.target.value)} /></Field>
              <Field><Label>Último PAP</Label><Input type="date" value={form.ultimo_pap || ""} onChange={e=>updateField('ultimo_pap', e.target.value)} /></Field>
            </Grid>
          </Section>

          <Section>
            <SectionTitle>3. Datos Colposcópicos</SectionTitle>
            <Grid columns={2}>
              <Field><Label>Vulva y Vagina</Label><Input value={form.vulva_vagina || ""} onChange={e=>updateField('vulva_vagina', e.target.value)} /></Field>
              <Field>
                <Label>Colposcopia</Label>
                <Select value={form.colposcopia_tipo || ""} onChange={e=>updateField('colposcopia_tipo', e.target.value)}>
                  <option>Correcto</option>
                  <option>Incorrecto</option>
                </Select>
              </Field>
              <Field>
                <Label>Cérvix</Label>
                <Select value={form.cervix || ""} onChange={e=>updateField('cervix', e.target.value)}>
                  <option>Eutrófico</option>
                  <option>Otros</option>
                </Select>
              </Field>
              <Field>
                <Label>Zona Transformación</Label>
                <Select value={form.zona_transformacion || ""} onChange={e=>updateField('zona_transformacion', e.target.value)}>
                  <option>Normal</option>
                  <option>Grado 1</option>
                  <option>Grado 2</option>
                </Select>
              </Field>
              <Field>
                <Label>Superficie</Label>
                <Select value={form.superficie || ""} onChange={e=>updateField('superficie', e.target.value)}>
                  <option>Lisa</option>
                  <option>Rugosa</option>
                  <option>Delgada</option>
                  <option>Gruesa</option>
                </Select>
              </Field>
              <Field>
                <Label>Bordes</Label>
                <Select value={form.bordes || ""} onChange={e=>updateField('bordes', e.target.value)}>
                  <option>Definidos</option>
                  <option>Difusos</option>
                </Select>
              </Field>
              <Field><Label>Epitelio Acetoblanco</Label><Input value={form.epitelio_acetoblanco || ""} onChange={e=>updateField('epitelio_acetoblanco', e.target.value)} /></Field>
              <Field><Label>Prueba Schiller</Label><Input value={form.prueba_schiller || ""} onChange={e=>updateField('prueba_schiller', e.target.value)} /></Field>
            </Grid>
          </Section>

          <Section>
            <SectionTitle>4. Observaciones y Conclusión</SectionTitle>
            <Grid columns={2}>
              <Field><Label>Patrón Vascular Velloso</Label><Input value={form.patron_vascular_velloso || ""} onChange={e=>updateField('patron_vascular_velloso', e.target.value)} /></Field>
              <Field><Label>Vasos Atípicos</Label><Input value={form.vasos_atipicos || ""} onChange={e=>updateField('vasos_atipicos', e.target.value)} /></Field>
              <Field><Label>Puntilleo</Label><Input value={form.puntilleo || ""} onChange={e=>updateField('puntilleo', e.target.value)} /></Field>
              <Field><Label>Mosaico</Label><Input value={form.mosaico || ""} onChange={e=>updateField('mosaico', e.target.value)} /></Field>
            </Grid>
            <Field style={{marginTop:'10px'}}><Label>Diagnóstico Colposcópico</Label><TextArea value={form.diagnostico_colposcopico || ""} onChange={e=>updateField('diagnostico_colposcopico', e.target.value)} /></Field>
            <Field style={{marginTop:'10px'}}><Label>Otras Observaciones</Label><TextArea value={form.otras_observaciones || ""} onChange={e=>updateField('otras_observaciones', e.target.value)} /></Field>
            <Field style={{marginTop:'10px'}}><Label>Plan de Tratamiento</Label><TextArea value={form.plan_tratamiento || ""} onChange={e=>updateField('plan_tratamiento', e.target.value)} /></Field>
          </Section>
        </FormScroll>
      </MainLayout>
    </Container>
  );
};

const flashAnimation = keyframes`
  0% { filter: brightness(1); }
  50% { filter: brightness(2.5) contrast(0.8); }
  100% { filter: brightness(1); }
`;

const Container = styled.div`padding: 24px; background: #f4f5f7; height: 100vh; display: flex; flex-direction: column;`;
const Header = styled.div`display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;`;
const MainLayout = styled.div`grid-template-columns: 450px 1fr; gap: 24px; flex: 1; overflow: hidden; display: grid;`;
const Sidebar = styled.div`display: flex; flex-direction: column; gap: 20px; overflow-y: auto; padding-right: 8px;`;
const FormScroll = styled.div`background: #fff; border-radius: 8px; border: 1px solid #DFE1E6; padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 24px;`;
const Section = styled.div``;
const SectionTitle = styled.h4`margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 1px solid #eee; color: #172B4D;`;

const VideoWrapper = styled.div<{ $flash?: boolean }>`
  position: relative; 
  background: #000; 
  border-radius: 8px; 
  overflow: hidden; 
  aspect-ratio: 16/9; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  img { 
    width: 100%; height: 100%; object-fit: contain; 
    ${props => props.$flash && css`animation: ${flashAnimation} 0.15s ease-out;`}
  }
`;

const CaptureBtn = styled.button`position: absolute; bottom: 12px; right: 12px; padding: 8px 16px; background: #0052CC; color: #fff; border: none; border-radius: 4px; cursor: pointer; &:hover { background: #0065FF; }`;

const GalleryWrapper = styled.div`background: #fafbfc; border: 1px solid #DFE1E6; border-radius: 8px; height: 380px; overflow-y: auto; padding: 12px;`;
const GalleryList = styled.div`display: flex; flex-direction: column; gap: 12px;`;
const CaptureItem = styled.div`display: flex; align-items: center; background: #fff; border: 1px solid #DFE1E6; border-radius: 4px; padding: 8px; gap: 12px; img { height: 120px; aspect-ratio: 1.5/1; object-fit: contain; border-radius: 2px; border: 1px solid #eee; } span { font-size: 11px; font-weight: 600; color: #172B4D; }`;
const Controls = styled.div`display: flex; flex-direction: column; gap: 4px;`;
const IconButton = styled.button`background: #f4f5f7; border: 1px solid #DFE1E6; border-radius: 3px; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; font-size: 12px; &:hover:not(:disabled) { background: #ebecf0; } &:disabled { opacity: 0.3; cursor: not-allowed; }`;

const DiagramBox = styled.div`border: 1px solid #DFE1E6; padding: 10px; border-radius: 6px; text-align: center; background: #fafbfc; img { width: 100%; height: 160px; object-fit: contain; } p { font-size: 10px; margin-top: 5px; color: #666; }`;
const DiagramToolbar = styled.div`display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;`;
const DiagramCanvas = styled.div`position: relative; width: 100%; height: 180px; cursor: crosshair; img { width: 100%; height: 100%; object-fit: contain; display: block; }`;
const DiagramOverlay = styled.svg`position: absolute; inset: 0; pointer-events: none; stroke: #0052CC; stroke-width: 0.015; stroke-linecap: round;`;
const Grid = styled.div<{ columns?: number }>`display: grid; grid-template-columns: repeat(${props => props.columns || 1}, 1fr); gap: 12px;`;
const Field = styled.div`display: flex; flex-direction: column; gap: 4px;`;
const Label = styled.label`font-size: 11px; font-weight: 600; color: #6B778C;`;
const Input = styled.input`padding: 8px; border: 1px solid #DFE1E6; border-radius: 3px; font-size: 13px;`;
const Select = styled.select`padding: 8px; border: 1px solid #DFE1E6; border-radius: 3px; font-size: 13px; background: #fff;`;
const TextArea = styled.textarea`padding: 8px; border: 1px solid #DFE1E6; border-radius: 3px; font-size: 13px; min-height: 80px; font-family: inherit; resize: vertical;`;

type DiagramMark = { id: string; x: number; y: number };

export default Colposcopy;
