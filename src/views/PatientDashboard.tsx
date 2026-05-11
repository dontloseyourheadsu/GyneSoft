import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "@atlaskit/button";
import styled from "styled-components";
import { api } from "../api";
import type { Patient, ClinicalHistory, MedicalNote, ColposcopyEntry } from "../types";
import ClinicalHistoryForm from "./ClinicalHistoryForm";
import MedicalNoteForm from "./MedicalNoteForm";

const PatientDashboard: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";
  const [patient, setPatient] = useState<Patient | null>(null);
  const [history, setHistory] = useState<ClinicalHistory | null>(null);
  const [notes, setNotes] = useState<MedicalNote[]>([]);
  const [colposcopies, setColposcopies] = useState<ColposcopyEntry[]>([]);

  // Modal/Overlay states
  const [activeForm, setActiveForm] = useState<{
    type: "history" | "note" | "colposcopy";
    mode: "view" | "edit" | "create";
    data?: any;
  } | null>(null);

  useEffect(() => { if (!isNew && id) load(); }, [id]);

  const load = async () => {
    if (!id) return;
    const pid = Number(id);
    try {
      const p = await api.getPatient(pid);
      setPatient(p);
      const hList = await api.listClinicalHistoriesForPatient(pid);
      console.log("Histories loaded:", hList);
      setHistory(hList && hList.length > 0 ? hList[0] : null);
      const n = await api.listMedicalNotesForPatient(pid);
      setNotes(n || []);
      const c = await api.listColposcopiesForPatient(pid);
      setColposcopies(c || []);
    } catch (e) { console.error(e); }
  };

  if (isNew) {
    return <NewPatientWrapper><NewPatientCreator onCreated={() => navigate(`/patients`)} /></NewPatientWrapper>;
  }

  const handleDeleteNote = async (_noteId: number) => {
    if (window.confirm("¿Está seguro de que desea eliminar esta nota?")) {
      // Assuming a delete command exists or will be added. 
      // For now we just call it and reload.
      // await api.deleteMedicalNote(noteId); 
      load();
    }
  };

  return (
    <Container>
      <Header>
        <HeaderInfo>
          <PatientName>{patient ? patient.nombre : "Cargando..."}</PatientName>
          <PatientSubtitle>Expediente de Paciente</PatientSubtitle>
        </HeaderInfo>
        <HeaderActions>
          <Button appearance="subtle" onClick={() => navigate('/patients')}>Volver a la lista</Button>
        </HeaderActions>
      </Header>

      <DashboardGrid>
        {/* SECTION 1: HISTORIAL CLÍNICO */}
        <DashboardCard>
          <CardHeader>
            <CardTitle>Historial Clínico</CardTitle>
            <CardActions>
              <Button appearance="subtle" onClick={() => setActiveForm({ type: "history", mode: "view", data: history })}>Ver</Button>
              <Button appearance="subtle" onClick={() => setActiveForm({ type: "history", mode: "edit", data: history })}>Editar</Button>
              <Button appearance="subtle" onClick={() => window.print()}>Imprimir</Button>
            </CardActions>
          </CardHeader>
          <CardContent>
            {history ? (
              <p>Estado: Expediente iniciado el {history.fecha}</p>
            ) : (
              <p style={{color: 'red'}}>Error: No se encontró el historial base de este paciente.</p>
            )}
          </CardContent>
        </DashboardCard>

        {/* SECTION 2: NOTAS MÉDICAS */}
        <DashboardCard>
          <CardHeader>
            <CardTitle>Notas Médicas</CardTitle>
            <Button appearance="primary" onClick={() => setActiveForm({ type: "note", mode: "create" })}>Nueva Nota</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Título / Resumen</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {notes.length === 0 && (
                  <tr><td colSpan={3}>No hay notas médicas.</td></tr>
                )}
                {notes.map(n => (
                  <tr key={n.id}>
                    <td>{n.fecha_hora?.split('T')[0] || "S/F"}</td>
                    <td>{n.notas?.slice(0, 50) || "(Sin título)"}...</td>
                    <td style={{ textAlign: 'right' }}>
                      <TableActions>
                        <Button appearance="subtle" onClick={() => setActiveForm({ type: "note", mode: "view", data: n })}>Ver</Button>
                        <Button appearance="subtle" onClick={() => setActiveForm({ type: "note", mode: "edit", data: n })}>Editar</Button>
                        <Button appearance="subtle" onClick={() => window.print()}>Imprimir</Button>
                        <Button appearance="subtle" onClick={() => n.id && handleDeleteNote(n.id)}>Borrar</Button>
                      </TableActions>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </DashboardCard>

        {/* SECTION 3: COLPOSCOPIA */}
        <DashboardCard>
          <CardHeader>
            <CardTitle>Colposcopia</CardTitle>
            <Button appearance="primary" onClick={() => navigate(`/patient/${id}/colposcopy`)}>Nuevo Estudio</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Capturas</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {colposcopies.length === 0 && (
                  <tr><td colSpan={3}>No hay estudios de colposcopia.</td></tr>
                )}
                {colposcopies.map(c => (
                  <tr key={c.id}>
                    <td>{c.fecha_hora || "S/F"}</td>
                    <td>1 imagen</td>
                    <td style={{ textAlign: 'right' }}>
                      <TableActions>
                        <Button appearance="subtle">Ver</Button>
                        <Button appearance="subtle">Imprimir</Button>
                      </TableActions>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </DashboardCard>
      </DashboardGrid>

      {/* MODAL OVERLAY */}
      {activeForm && (
        <Overlay>
          <ModalContainer>
            <ModalHeader>
              <h3>
                {activeForm.type === "history" ? "Historial Clínico" : "Nota Médica"} 
                ({activeForm.mode === "view" ? "Ver" : activeForm.mode === "edit" ? "Editar" : "Crear"})
              </h3>
              <Button appearance="subtle" onClick={() => setActiveForm(null)}>Cerrar</Button>
            </ModalHeader>
            <ModalBody>
              {activeForm.type === "history" && (
                <ClinicalHistoryForm 
                  patientId={Number(id)} 
                  initialData={activeForm.data} 
                  mode={activeForm.mode === "view" ? "view" : "edit"} 
                  onSaved={() => { setActiveForm(null); load(); }}
                  onCancel={() => setActiveForm(null)}
                />
              )}
              {activeForm.type === "note" && (
                <MedicalNoteForm 
                  patientId={Number(id)} 
                  patientName={patient?.nombre}
                  initialData={activeForm.data} 
                  mode={activeForm.mode}
                  onSaved={() => { setActiveForm(null); load(); }}
                  onCancel={() => setActiveForm(null)}
                />
              )}
            </ModalBody>
          </ModalContainer>
        </Overlay>
      )}
    </Container>
  );
};

// ... formatTodayDate and NewPatientCreator from previous version ...
const formatTodayDate = () => {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const NewPatientCreator: React.FC<{ onCreated: (id?:number)=>void }> = ({ onCreated }) => {
  const [saving, setSaving] = useState(false);
  const [patient, setPatient] = useState<Partial<Patient>>({ nombre: "", fecha: formatTodayDate(), fecha_nacimiento: "", sexo: "", edad: "", estado_civil: "", escolaridad: "", ocupacion: "", direccion: "", telefono: "" });
  const [history, setHistory] = useState<Partial<ClinicalHistory>>({
    fecha: formatTodayDate(),
    diabetes: "", hipertension: "", cancer: "", otros_heredo: "", higiene_personal: "", calidad_alimentacion: "", tabaquismo: "", alcoholismo: "", grupo_sanguineo_rh: "", otros_no_patologicos: "",
    alergias: "", quirurgicos: "", traumaticos: "", transfusionales: "", medicos: "",
    menarca: "", telarca: "", pubarca: "", ritmo: "", dismenorrea: "", ivsa: "", numero_parejas: "", metodo_anticonceptivo: "", gesta: "", para: "", cesareas: "", abortos: "", productos: "", fup: "", doc: "", fur: "", fpp: "", padecimiento_actual: "",
    peso: "", talla: "", imc: "", ta: "", fc: "", fr: "", temp: "", so2: "",
    habitus_exterior: "", cabeza: "", torax: "", abdomen: "", genitales: "", extremidades: "",
    estudios_lab: "", diagnostico: "", tratamiento: "", comentarios: "",
  });

  const setP = (k: keyof Patient, v: any) => setPatient((s)=>({...s,[k]:v}));
  const setH = (k: keyof ClinicalHistory, v: any) => setHistory((s)=>({...s,[k]:v}));

  const submit = async () => {
    if (!patient.nombre?.trim()) { window.alert("El nombre es obligatorio."); return; }
    setSaving(true);
    try {
      const newId = await api.createPatient(patient as Patient);
      history.patient_id = Number(newId);
      history.fecha = patient.fecha || formatTodayDate();
      await api.createClinicalHistory(history as ClinicalHistory);
      onCreated(Number(newId));
    } catch (e) { window.alert(String(e)); }
    finally { setSaving(false); }
  };

  return (
    <FormWrapper>
      <SectionBlock>
        <SectionTitle>Datos de Identificación del Nuevo Paciente</SectionTitle>
        <Grid>
          <Field style={{ gridColumn: "1 / -1" }}><Label>Fecha</Label><Input type="date" value={patient.fecha || ""} onChange={e=>setP('fecha', e.target.value)} /></Field>
          <Field><Label>Nombre</Label><Input value={patient.nombre || ""} onChange={e=>setP('nombre', e.target.value)} /></Field>
          <Field><Label>Nacimiento</Label><Input type="date" value={patient.fecha_nacimiento || ""} onChange={e=>setP('fecha_nacimiento', e.target.value)} /></Field>
          <Field><Label>Sexo</Label><Input value={patient.sexo || ""} onChange={e=>setP('sexo', e.target.value)} /></Field>
          <Field><Label>Edad</Label><Input type="number" value={patient.edad || ""} onChange={e=>setP('edad', e.target.value)} /></Field>
        </Grid>
      </SectionBlock>
      <SectionBlock>
        <SectionTitle>Historia Clínica Inicial</SectionTitle>
        <Grid columns={1}>
           <Field><Label>Padecimiento Actual / Motivo de consulta</Label><LargeTextArea value={history.padecimiento_actual || ""} onChange={e=>setH('padecimiento_actual', e.target.value)} /></Field>
        </Grid>
        <p style={{marginTop: '8px', fontSize: '12px', color: '#666'}}>Podrá completar el resto de los campos después de crear el expediente.</p>
      </SectionBlock>
      <Actions>
        <Button appearance="subtle" onClick={() => window.history.back()}>Cancelar</Button>
        <Button appearance="primary" onClick={submit} isDisabled={saving}>Crear expediente</Button>
      </Actions>
    </FormWrapper>
  );
};

const Container = styled.div`padding: 24px; background: #f4f5f7; min-height: 100vh;`;
const Header = styled.div`display:flex; justify-content:space-between; margin-bottom: 24px; align-items: flex-end;`;
const HeaderInfo = styled.div``;
const PatientName = styled.h2`margin:0; color: #172B4D;`;
const PatientSubtitle = styled.p`margin:0; color: #6B778C; font-size: 14px;`;
const HeaderActions = styled.div`display:flex; gap:8px;`;

const DashboardGrid = styled.div`display: flex; flex-direction: column; gap: 24px;`;
const DashboardCard = styled.div`background: #fff; border-radius: 8px; border: 1px solid #DFE1E6; overflow: hidden;`;
const CardHeader = styled.div`padding: 16px 20px; border-bottom: 1px solid #DFE1E6; display: flex; justify-content: space-between; align-items: center; background: #fafbfc;`;
const CardTitle = styled.h3`margin: 0; font-size: 16px; color: #172B4D;`;
const CardActions = styled.div`display: flex; gap: 8px;`;
const CardContent = styled.div`padding: 20px;`;

const Table = styled.table`width: 100%; border-collapse: collapse; margin-top: 8px; th { text-align: left; padding: 12px; border-bottom: 2px solid #EBECF0; color: #6B778C; font-size: 12px; text-transform: uppercase; } td { padding: 12px; border-bottom: 1px solid #EBECF0; font-size: 14px; }`;
const TableActions = styled.div`display: flex; gap: 4px; justify-content: flex-end;`;

const Overlay = styled.div`position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: flex-start; padding: 40px; z-index: 1000; overflow-y: auto;`;
const ModalContainer = styled.div`background: #fff; width: 100%; max-width: 1000px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.2);`;
const ModalHeader = styled.div`padding: 16px 24px; border-bottom: 1px solid #EBECF0; display: flex; justify-content: space-between; align-items: center; background: #fff; border-radius: 8px 8px 0 0;`;
const ModalBody = styled.div`padding: 24px;`;

const NewPatientWrapper = styled.div`max-width:800px; margin: 40px auto;`;
const FormWrapper = styled.div`display:flex; flex-direction:column; gap:20px;`;
const SectionBlock = styled.section`border:1px solid #DFE1E6; background:#fff; padding:24px; border-radius:8px;`;
const SectionTitle = styled.h4`margin:0 0 16px 0; color: #172B4D;`;
const Label = styled.label`font-size:12px; font-weight: 600; color: #6B778C; margin-bottom: 4px;`;
const Grid = styled.div<{ columns?: number }>`display:grid; grid-template-columns: repeat(${(props) => props.columns || 4}, 1fr); gap:16px;`;
const Field = styled.div`display:flex; flex-direction:column;`;
const Input = styled.input`padding:8px; border:1px solid #DFE1E6; border-radius:3px;`;
const LargeTextArea = styled.textarea`padding:10px; border:1px solid #DFE1E6; border-radius:3px; min-height:120px; width:100%; font-family: inherit;`;
const Actions = styled.div`display:flex; gap:8px; justify-content:flex-end;`;

export default PatientDashboard;
