import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "@atlaskit/button";
import styled from "styled-components";
import { api } from "../api";
import type { Patient, ColposcopyEntry, ClinicalHistory } from "../types";

const Colposcopy: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [, setHistory] = useState<ClinicalHistory | null>(null);
  const [form, setForm] = useState<Partial<ColposcopyEntry>>({
    patient_id: Number(id),
    fecha_hora: new Date().toISOString(),
    colposcopia_tipo: "Satisfactoria",
    cervix: "Eutrófico",
    zona_transformacion: "Normal",
    superficie: "Lisa",
    bordes: "Definidos",
    epitelio_acetoblanco: "Tenue",
    prueba_schiller: "Negativo"
  });

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captures, setCaptures] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
    startCamera();
    return () => {
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    try {
      const p = await api.getPatient(Number(id));
      setPatient(p);
      const hList = await api.listClinicalHistoriesForPatient(Number(id));
      if (hList && hList.length > 0) {
        const h = hList[0];
        setHistory(h);
        // Pre-fill OB/GYN data from history
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
    } catch (e) { console.error(e); }
  };

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (e) { window.alert("No se pudo acceder a la cámara: " + e); }
  };

  const captureFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCaptures(prev => [dataUrl, ...prev].slice(0, 4));
  };

  const saveStudy = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const finalForm = { ...form };
      if (captures[0]) finalForm.figura1_path = captures[0];
      if (captures[1]) finalForm.figura2_path = captures[1];
      if (captures[2]) finalForm.figura3_path = captures[2];
      if (captures[3]) finalForm.figura4_path = captures[3];

      await api.createColposcopy(finalForm as ColposcopyEntry);
      window.alert("Estudio guardado con éxito");
      navigate(`/patient/${id}`);
    } catch (e) { window.alert("Error al guardar: " + e); }
    finally { setSaving(false); }
  };

  const updateField = (k: keyof ColposcopyEntry, v: any) => setForm(s => ({ ...s, [k]: v }));

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
            <SectionTitle>Captura en Vivo</SectionTitle>
            <VideoWrapper>
              <video ref={videoRef} autoPlay playsInline muted />
              <CaptureBtn onClick={captureFrame}>Capturar Foto</CaptureBtn>
            </VideoWrapper>
            
            <Gallery>
               {captures.map((cap, i) => (
                 <CaptureThumb key={i}>
                   <img src={cap} alt={`Figura ${i+1}`} />
                   <span>Figura {i+1}</span>
                 </CaptureThumb>
               ))}
               {captures.length === 0 && <p style={{fontSize:'12px', color:'#666'}}>No hay capturas aún.</p>}
            </Gallery>
          </Section>

          <Section>
             <SectionTitle>Diagramas</SectionTitle>
             <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                <DiagramBox>
                   <img src="/src/assets/diagrams/genitales.png" alt="Genitales" onError={(e)=>(e.target as any).style.display='none'} />
                   <p>Genitales Externos</p>
                </DiagramBox>
                <DiagramBox>
                   <img src="/src/assets/diagrams/cuadrantes.png" alt="Cuadrantes" onError={(e)=>(e.target as any).style.display='none'} />
                   <p>Cuadrantes Cervicales</p>
                </DiagramBox>
             </div>
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
                  <option>Satisfactoria</option>
                  <option>No satisfactoria</option>
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
            </Grid>
          </Section>

          <Section>
            <SectionTitle>4. Conclusión y Diagnóstico</SectionTitle>
            <Field><Label>Diagnóstico Colposcópico</Label><TextArea value={form.diagnostico_colposcopico || ""} onChange={e=>updateField('diagnostico_colposcopico', e.target.value)} /></Field>
            <Field style={{marginTop:'10px'}}><Label>Plan de Tratamiento</Label><TextArea value={form.plan_tratamiento || ""} onChange={e=>updateField('plan_tratamiento', e.target.value)} /></Field>
          </Section>
        </FormScroll>
      </MainLayout>
    </Container>
  );
};

const Container = styled.div`padding: 24px; background: #f4f5f7; height: 100vh; display: flex; flex-direction: column;`;
const Header = styled.div`display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;`;
const MainLayout = styled.div`display: grid; grid-template-columns: 450px 1fr; gap: 24px; flex: 1; overflow: hidden;`;
const Sidebar = styled.div`display: flex; flex-direction: column; gap: 20px; overflow-y: auto;`;
const FormScroll = styled.div`background: #fff; border-radius: 8px; border: 1px solid #DFE1E6; padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 24px;`;
const Section = styled.div``;
const SectionTitle = styled.h4`margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 1px solid #eee; color: #172B4D;`;
const VideoWrapper = styled.div`position: relative; background: #000; border-radius: 8px; overflow: hidden; aspect-ratio: 16/9; video { width: 100%; height: 100%; object-fit: cover; }`;
const CaptureBtn = styled.button`position: absolute; bottom: 12px; right: 12px; padding: 8px 16px; background: #0052CC; color: #fff; border: none; border-radius: 4px; cursor: pointer; &:hover { background: #0065FF; }`;
const Gallery = styled.div`display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 10px;`;
const CaptureThumb = styled.div`display: flex; flex-direction: column; align-items: center; img { width: 100%; aspect-ratio: 1/1; object-fit: cover; border-radius: 4px; border: 1px solid #DFE1E6; } span { font-size: 10px; color: #666; margin-top: 2px; }`;
const DiagramBox = styled.div`border: 1px solid #DFE1E6; padding: 10px; border-radius: 6px; text-align: center; background: #fafbfc; img { width: 100%; height: 80px; object-fit: contain; } p { font-size: 10px; margin-top: 5px; color: #666; }`;
const Grid = styled.div<{ columns?: number }>`display: grid; grid-template-columns: repeat(${props => props.columns || 1}, 1fr); gap: 12px;`;
const Field = styled.div`display: flex; flex-direction: column; gap: 4px;`;
const Label = styled.label`font-size: 11px; font-weight: 600; color: #6B778C;`;
const Input = styled.input`padding: 8px; border: 1px solid #DFE1E6; border-radius: 3px; font-size: 13px;`;
const Select = styled.select`padding: 8px; border: 1px solid #DFE1E6; border-radius: 3px; font-size: 13px; background: #fff;`;
const TextArea = styled.textarea`padding: 8px; border: 1px solid #DFE1E6; border-radius: 3px; font-size: 13px; min-height: 80px; font-family: inherit; resize: vertical;`;

export default Colposcopy;
