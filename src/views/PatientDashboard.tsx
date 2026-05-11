import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "@atlaskit/button";
import { token } from "@atlaskit/tokens";
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
  const [histories, setHistories] = useState<ClinicalHistory[]>([]);
  const [notes, setNotes] = useState<MedicalNote[]>([]);
  const [colposcopies, setColposcopies] = useState<ColposcopyEntry[]>([]);

  useEffect(() => { if (!isNew && id) load(); }, [id]);

  const load = async () => {
    if (!id) return;
    const pid = Number(id);
    try {
      const p = await api.getPatient(pid);
      setPatient(p);
      const h = await api.listClinicalHistoriesForPatient(pid);
      setHistories(h || []);
      const n = await api.listMedicalNotesForPatient(pid);
      setNotes(n || []);
      const c = await api.listColposcopiesForPatient(pid);
      setColposcopies(c || []);
    } catch (e) { console.error(e); }
  };

  if (isNew) {
    // render create form that requires creating a clinical history as part of creation
    return <NewPatientWrapper><NewPatientCreator onCreated={() => navigate(`/patients`)} /></NewPatientWrapper>;
  }

  const printHistory = () => {
    window.print();
  };

  return (
    <Container>
      <Header>
        <h2>{patient ? patient.nombre : "Paciente"}</h2>
        <HeaderActions>
          <Button appearance="subtle" onClick={printHistory}>Imprimir historial</Button>
          <Button appearance="subtle" onClick={() => navigate('/patients')}>Volver</Button>
        </HeaderActions>
      </Header>

      <Section>
        <h3>Historial Clínico</h3>
        <ClinicalHistoryForm patientId={Number(id)} onSaved={load} />
        <List>
          {histories.map(h => (
            <li key={h.id}>[{h.fecha}] {h.diagnostico || h.padecimiento_actual}</li>
          ))}
        </List>
      </Section>

      <Section>
        <h3>Notas Médicas</h3>
        <MedicalNoteForm patientId={Number(id)} patientName={patient?.nombre || ""} onSaved={load} />
        <List>
          {notes.map(n => (
            <li key={n.id}>[{n.fecha_hora}] {n.notas?.slice(0,200)}</li>
          ))}
        </List>
      </Section>

      <Section>
        <SectionHeader>
          <h3>Colposcopias</h3>
          <Button appearance="primary" onClick={() => navigate(`/patient/${id}/colposcopy`)}>
            Abrir colposcopia
          </Button>
        </SectionHeader>
        <List>
          {colposcopies.length === 0 && <li>Sin colposcopias registradas.</li>}
          {colposcopies.map((c) => (
            <li key={c.id}>[{c.fecha_hora}] {c.file_path?.split('/').pop() || 'captura'}</li>
          ))}
        </List>
      </Section>
    </Container>
  );
};

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
    diabetes: "",
    hipertension: "",
    cancer: "",
    otros_heredo: "",
    higiene_personal: "",
    calidad_alimentacion: "",
    tabaquismo: "",
    alcoholismo: "",
    grupo_sanguineo_rh: "",
    otros_no_patologicos: "",
    alergias: "",
    quirurgicos: "",
    traumaticos: "",
    transfusionales: "",
    medicos: "",
    menarca: "",
    telarca: "",
    pubarca: "",
    ritmo: "",
    dismenorrea: "",
    ivsa: "",
    numero_parejas: "",
    metodo_anticonceptivo: "",
    gesta: "",
    para: "",
    cesareas: "",
    abortos: "",
    productos: "",
    fup: "",
    doc: "",
    fur: "",
    fpp: "",
    padecimiento_actual: "",
    peso: "",
    talla: "",
    imc: "",
    ta: "",
    fc: "",
    fr: "",
    temp: "",
    so2: "",
    habitus_exterior: "",
    cabeza: "",
    torax: "",
    abdomen: "",
    genitales: "",
    extremidades: "",
    estudios_lab: "",
    diagnostico: "",
    tratamiento: "",
    comentarios: "",
  });

  const setP = (k: keyof Patient, v: any) => setPatient((s)=>({...s,[k]:v}));
  const setH = (k: keyof ClinicalHistory, v: any) => setHistory((s)=>({...s,[k]:v}));

  const isNegative = (value?: string | null) => {
    if (value === undefined || value === null || value === "") return false;
    const num = Number(value);
    return Number.isFinite(num) && num < 0;
  };

  const submit = async () => {
    if (
      isNegative(patient.edad) ||
      isNegative(history.menarca) ||
      isNegative(history.telarca) ||
      isNegative(history.pubarca) ||
      isNegative(history.ivsa) ||
      isNegative(history.numero_parejas) ||
      isNegative(history.gesta) ||
      isNegative(history.para) ||
      isNegative(history.cesareas) ||
      isNegative(history.abortos) ||
      isNegative(history.productos) ||
      isNegative(history.peso) ||
      isNegative(history.talla) ||
      isNegative(history.imc) ||
      isNegative(history.ta) ||
      isNegative(history.fc) ||
      isNegative(history.fr) ||
      isNegative(history.temp) ||
      isNegative(history.so2)
    ) {
      window.alert("Hay valores numéricos negativos. Corrija antes de guardar.");
      return;
    }
    if (!patient.nombre || patient.nombre.trim() === "") {
      window.alert("El nombre es obligatorio.");
      return;
    }
    setSaving(true);
    try {
      const newId = await api.createPatient(patient as Patient);
      history.patient_id = Number(newId);
      history.fecha = patient.fecha || formatTodayDate();
      await api.createClinicalHistory(history as ClinicalHistory);
      onCreated(Number(newId));
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      window.alert(message);
      console.error(e);
    }
    finally { setSaving(false); }
  };

  return (
    <FormWrapper>
      <SectionBlock>
        <SectionTitle>Datos de Identificación</SectionTitle>
        <Grid>
          <Field style={{ gridColumn: "1 / -1" }}>
            <Label>Fecha</Label>
            <Input type="date" value={patient.fecha || ""} onChange={e=>setP('fecha', e.target.value)} />
          </Field>
          <Field>
            <Label>Nombre</Label>
            <Input value={patient.nombre || ""} onChange={e=>setP('nombre', e.target.value)} />
          </Field>
          <Field>
            <Label>Fecha de Nacimiento</Label>
            <Input type="date" value={patient.fecha_nacimiento || ""} onChange={e=>setP('fecha_nacimiento', e.target.value)} />
          </Field>
          <Field>
            <Label>Sexo</Label>
            <Input value={patient.sexo || ""} onChange={e=>setP('sexo', e.target.value)} />
          </Field>
          <Field>
            <Label>Edad</Label>
            <Input type="number" min="0" value={patient.edad || ""} onChange={e=>setP('edad', e.target.value)} />
          </Field>
          <Field>
            <Label>Estado Civil</Label>
            <Input value={patient.estado_civil || ""} onChange={e=>setP('estado_civil', e.target.value)} />
          </Field>
          <Field>
            <Label>Escolaridad</Label>
            <Input value={patient.escolaridad || ""} onChange={e=>setP('escolaridad', e.target.value)} />
          </Field>
          <Field>
            <Label>Ocupación</Label>
            <Input value={patient.ocupacion || ""} onChange={e=>setP('ocupacion', e.target.value)} />
          </Field>
          <Field>
            <Label>Dirección</Label>
            <Input value={patient.direccion || ""} onChange={e=>setP('direccion', e.target.value)} />
          </Field>
          <Field>
            <Label>Teléfono</Label>
            <Input type="tel" value={patient.telefono || ""} onChange={e=>setP('telefono', e.target.value)} />
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle>Historia Clínica (obligatoria)</SectionTitle>

        <SubTitle>Antecedentes Heredofamiliares</SubTitle>
        <Grid>
          <CheckRow>
            <input type="checkbox" checked={history.diabetes === "Si"} onChange={(e)=>setH('diabetes', e.target.checked ? "Si" : "No")} />
            <span>Diabetes</span>
          </CheckRow>
          <CheckRow>
            <input type="checkbox" checked={history.hipertension === "Si"} onChange={(e)=>setH('hipertension', e.target.checked ? "Si" : "No")} />
            <span>Hipertensión</span>
          </CheckRow>
          <CheckRow>
            <input type="checkbox" checked={history.cancer === "Si"} onChange={(e)=>setH('cancer', e.target.checked ? "Si" : "No")} />
            <span>Cáncer</span>
          </CheckRow>
          <Field>
            <Label>Otros</Label>
            <Input value={history.otros_heredo || ""} onChange={e=>setH('otros_heredo', e.target.value)} />
          </Field>
        </Grid>

        <SubTitle>Antecedentes Personales No Patológicos</SubTitle>
        <Grid>
          <Field>
            <Label>Higiene Personal</Label>
            <Input value={history.higiene_personal || ""} onChange={e=>setH('higiene_personal', e.target.value)} />
          </Field>
          <Field>
            <Label>Calidad de Alimentación</Label>
            <Input value={history.calidad_alimentacion || ""} onChange={e=>setH('calidad_alimentacion', e.target.value)} />
          </Field>
          <CheckRow>
            <input type="checkbox" checked={history.tabaquismo === "Si"} onChange={(e)=>setH('tabaquismo', e.target.checked ? "Si" : "No")} />
            <span>Tabaquismo</span>
          </CheckRow>
          <CheckRow>
            <input type="checkbox" checked={history.alcoholismo === "Si"} onChange={(e)=>setH('alcoholismo', e.target.checked ? "Si" : "No")} />
            <span>Alcoholismo</span>
          </CheckRow>
          <Field>
            <Label>Grupo Sanguíneo y RH</Label>
            <Input value={history.grupo_sanguineo_rh || ""} onChange={e=>setH('grupo_sanguineo_rh', e.target.value)} />
          </Field>
          <Field>
            <Label>Otros</Label>
            <Input value={history.otros_no_patologicos || ""} onChange={e=>setH('otros_no_patologicos', e.target.value)} />
          </Field>
        </Grid>

        <SubTitle>Antecedentes Personales Patológicos</SubTitle>
        <Grid>
          <Field>
            <Label>Alergias</Label>
            <Input value={history.alergias || ""} onChange={e=>setH('alergias', e.target.value)} />
          </Field>
          <Field>
            <Label>Quirúrgicos</Label>
            <Input value={history.quirurgicos || ""} onChange={e=>setH('quirurgicos', e.target.value)} />
          </Field>
          <Field>
            <Label>Traumáticos</Label>
            <Input value={history.traumaticos || ""} onChange={e=>setH('traumaticos', e.target.value)} />
          </Field>
          <Field>
            <Label>Transfuncionales</Label>
            <Input value={history.transfusionales || ""} onChange={e=>setH('transfusionales', e.target.value)} />
          </Field>
          <Field>
            <Label>Médicos</Label>
            <Input value={history.medicos || ""} onChange={e=>setH('medicos', e.target.value)} />
          </Field>
        </Grid>

        <SubTitle>Antecedentes Gineco-Obstétricos</SubTitle>
        <Grid>
          <Field>
            <Label>Menarca (Edad de primera regla)</Label>
            <Input type="number" min="0" value={history.menarca || ""} onChange={e=>setH('menarca', e.target.value)} />
          </Field>
          <Field>
            <Label>Telarca</Label>
            <Input type="number" min="0" value={history.telarca || ""} onChange={e=>setH('telarca', e.target.value)} />
          </Field>
          <Field>
            <Label>Pubarca</Label>
            <Input type="number" min="0" value={history.pubarca || ""} onChange={e=>setH('pubarca', e.target.value)} />
          </Field>
          <Field>
            <Label>Ritmo (Frecuencia x Duración)</Label>
            <Input value={history.ritmo || ""} onChange={e=>setH('ritmo', e.target.value)} />
          </Field>
          <Field>
            <Label>Dismenorrea</Label>
            <Input value={history.dismenorrea || ""} onChange={e=>setH('dismenorrea', e.target.value)} />
          </Field>
          <Field>
            <Label>IVSA (Inicio de Vida Sexual Activa)</Label>
            <Input type="number" min="0" value={history.ivsa || ""} onChange={e=>setH('ivsa', e.target.value)} />
          </Field>
          <Field>
            <Label>Número de parejas sexuales</Label>
            <Input type="number" min="0" value={history.numero_parejas || ""} onChange={e=>setH('numero_parejas', e.target.value)} />
          </Field>
          <Field>
            <Label>Método anticonceptivo</Label>
            <Input value={history.metodo_anticonceptivo || ""} onChange={e=>setH('metodo_anticonceptivo', e.target.value)} />
          </Field>
          <Field>
            <Label>Gesta</Label>
            <Input type="number" min="0" value={history.gesta || ""} onChange={e=>setH('gesta', e.target.value)} />
          </Field>
          <Field>
            <Label>Para</Label>
            <Input type="number" min="0" value={history.para || ""} onChange={e=>setH('para', e.target.value)} />
          </Field>
          <Field>
            <Label>Cesáreas</Label>
            <Input type="number" min="0" value={history.cesareas || ""} onChange={e=>setH('cesareas', e.target.value)} />
          </Field>
          <Field>
            <Label>Abortos</Label>
            <Input type="number" min="0" value={history.abortos || ""} onChange={e=>setH('abortos', e.target.value)} />
          </Field>
          <Field>
            <Label>Productos</Label>
            <Input type="number" min="0" value={history.productos || ""} onChange={e=>setH('productos', e.target.value)} />
          </Field>
          <Field>
            <Label>F.U.P. (Fecha de Último Parto)</Label>
            <Input type="date" value={history.fup || ""} onChange={e=>setH('fup', e.target.value)} />
          </Field>
          <Field>
            <Label>D.O.C. (Papanicolaou)</Label>
            <Input type="date" value={history.doc || ""} onChange={e=>setH('doc', e.target.value)} />
          </Field>
          <Field>
            <Label>F.U.R. (Fecha de Última Regla)</Label>
            <Input type="date" value={history.fur || ""} onChange={e=>setH('fur', e.target.value)} />
          </Field>
          <Field>
            <Label>F.P.P. (Fecha Probable de Parto)</Label>
            <Input type="date" value={history.fpp || ""} onChange={e=>setH('fpp', e.target.value)} />
          </Field>
        </Grid>

        <SubTitle>Padecimiento actual</SubTitle>
        <LargeTextArea value={history.padecimiento_actual || ""} onChange={e=>setH('padecimiento_actual', e.target.value)} />

        <SubTitle>Exploración Física (Signos Vitales)</SubTitle>
        <Grid>
          <Field>
            <Label>Peso (kg)</Label>
            <Input type="number" min="0" value={history.peso || ""} onChange={e=>setH('peso', e.target.value)} />
          </Field>
          <Field>
            <Label>Talla (cms)</Label>
            <Input type="number" min="0" value={history.talla || ""} onChange={e=>setH('talla', e.target.value)} />
          </Field>
          <Field>
            <Label>I.M.C.</Label>
            <Input type="number" min="0" value={history.imc || ""} onChange={e=>setH('imc', e.target.value)} />
          </Field>
          <Field>
            <Label>T/A</Label>
            <Input type="number" min="0" value={history.ta || ""} onChange={e=>setH('ta', e.target.value)} />
          </Field>
          <Field>
            <Label>F.C.</Label>
            <Input type="number" min="0" value={history.fc || ""} onChange={e=>setH('fc', e.target.value)} />
          </Field>
          <Field>
            <Label>F.R.</Label>
            <Input type="number" min="0" value={history.fr || ""} onChange={e=>setH('fr', e.target.value)} />
          </Field>
          <Field>
            <Label>Temp</Label>
            <Input type="number" min="0" value={history.temp || ""} onChange={e=>setH('temp', e.target.value)} />
          </Field>
          <Field>
            <Label>SO2</Label>
            <Input type="number" min="0" value={history.so2 || ""} onChange={e=>setH('so2', e.target.value)} />
          </Field>
        </Grid>

        <SubTitle>Habitus Exterior y Revisión por Sistemas</SubTitle>
        <Grid columns={3}>
          <Field>
            <Label>Habitus exterior</Label>
            <TextArea value={history.habitus_exterior || ""} onChange={e=>setH('habitus_exterior', e.target.value)} />
          </Field>
          <Field>
            <Label>Cabeza</Label>
            <TextArea value={history.cabeza || ""} onChange={e=>setH('cabeza', e.target.value)} />
          </Field>
          <Field>
            <Label>Tórax</Label>
            <TextArea value={history.torax || ""} onChange={e=>setH('torax', e.target.value)} />
          </Field>
          <Field>
            <Label>Abdomen</Label>
            <TextArea value={history.abdomen || ""} onChange={e=>setH('abdomen', e.target.value)} />
          </Field>
          <Field>
            <Label>Genitales</Label>
            <TextArea value={history.genitales || ""} onChange={e=>setH('genitales', e.target.value)} />
          </Field>
          <Field>
            <Label>Extremidades</Label>
            <TextArea value={history.extremidades || ""} onChange={e=>setH('extremidades', e.target.value)} />
          </Field>
        </Grid>

        <SubTitle>Conclusión Médica</SubTitle>
        <Grid columns={2}>
          <Field>
            <Label>Estudios de Laboratorio y Gabinete</Label>
            <TextArea value={history.estudios_lab || ""} onChange={e=>setH('estudios_lab', e.target.value)} />
          </Field>
          <Field>
            <Label>DIAGNÓSTICO</Label>
            <TextArea value={history.diagnostico || ""} onChange={e=>setH('diagnostico', e.target.value)} />
          </Field>
          <Field>
            <Label>Tratamiento</Label>
            <TextArea value={history.tratamiento || ""} onChange={e=>setH('tratamiento', e.target.value)} />
          </Field>
          <Field>
            <Label>Comentarios</Label>
            <TextArea value={history.comentarios || ""} onChange={e=>setH('comentarios', e.target.value)} />
          </Field>
        </Grid>

      </SectionBlock>

      <Actions>
        <Button appearance="subtle" onClick={() => window.history.back()}>Cancelar</Button>
        <Button appearance="primary" onClick={submit} isDisabled={saving}>Crear paciente</Button>
      </Actions>
    </FormWrapper>
  );
};

const Container = styled.div`
  display:flex; flex-direction:column; gap:16px;
`;
const Header = styled.div`display:flex; justify-content:space-between;`;
const HeaderActions = styled.div`display:flex; gap:8px;`;
const SectionHeader = styled.div`display:flex; justify-content:space-between; align-items:center;`;
const Section = styled.div`background:#fff; padding:12px; border:1px solid #eee;`;
const List = styled.ul`margin:8px 0; padding-left:18px;`;
const NewPatientWrapper = styled.div`max-width:980px; background:#fff; padding:16px; border:1px solid ${token('color.border','#DFE1E6')};`;

const FormWrapper = styled.div`
  display:flex; flex-direction:column; gap:20px;
`;
const SectionTitle = styled.h4`margin:0 0 8px 0;`;
const SubTitle = styled.h5`margin:8px 0 4px 0; font-weight:600;`;
const Label = styled.label`font-size:13px; margin-top:6px;`;
const CheckRow = styled.label`
  display:flex; align-items:center; gap:8px; font-size:13px;
  input { width:auto; }
`;
const SectionBlock = styled.section`
  border:1px solid ${token('color.border','#DFE1E6')};
  background:#fff;
  padding:16px;
  border-radius:10px;
`;
const Grid = styled.div<{ columns?: number }>`
  display:grid;
  grid-template-columns: repeat(${(props) => props.columns || 4}, minmax(180px, 1fr));
  gap:12px 16px;
  align-items:start;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;
const Field = styled.div`
  display:flex; flex-direction:column; gap:6px;
`;
const Input = styled.input`padding:8px; border:1px solid ${token('color.border','#DFE1E6')}; border-radius:4px;`;
const TextArea = styled.textarea`padding:8px; border:1px solid ${token('color.border','#DFE1E6')}; border-radius:4px; min-height:80px;`;
const LargeTextArea = styled.textarea`padding:10px; border:1px solid ${token('color.border','#DFE1E6')}; border-radius:6px; min-height:160px; width:100%;`;
const Actions = styled.div`display:flex; gap:8px; justify-content:flex-end;`;

export default PatientDashboard;
