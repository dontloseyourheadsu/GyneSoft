import React, { useState, useEffect } from "react";
import Button from "@atlaskit/button";
import styled from "styled-components";
import type { MedicalNote } from "../types";
import { api } from "../api";

interface Props { 
  patientId: number; 
  patientName?: string | null; 
  initialData?: MedicalNote | null;
  mode?: "create" | "view" | "edit";
  onSaved?: () => void; 
  onCancel?: () => void;
}

const formatTodayDateTime = () => {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

const MedicalNoteForm: React.FC<Props> = ({ patientId, patientName, initialData, mode = "create", onSaved, onCancel }) => {
  const [form, setForm] = useState<Partial<MedicalNote>>({ 
    patient_id: patientId, 
    fecha_hora: mode === "create" ? formatTodayDateTime() : "" 
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    }
  }, [initialData]);

  const isReadOnly = mode === "view";

  const setField = (k: keyof MedicalNote, v: any) => {
    if (isReadOnly) return;
    setForm((s) => ({ ...s, [k]: v }));
  };

  const isNegative = (value?: string | null) => {
    if (value === undefined || value === null || value === "") return false;
    const num = Number(value);
    return Number.isFinite(num) && num < 0;
  };

  const submit = async () => {
    if (isReadOnly) return;
    if (
      isNegative(form.peso) ||
      isNegative(form.talla) ||
      isNegative(form.ta) ||
      isNegative(form.fc) ||
      isNegative(form.fr) ||
      isNegative(form.temp)
    ) {
      window.alert("Hay valores numéricos negativos. Corrija antes de guardar.");
      return;
    }
    setSaving(true);
    try {
      if (form.id) {
        await api.updateMedicalNote(form.id, form as MedicalNote);
      } else {
        await api.createMedicalNote(form as MedicalNote);
      }
      onSaved?.();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <Wrapper>
      <SectionTitle>Identificación</SectionTitle>
      <Grid columns={2}>
        <Field>
          <Label>Nombre de la paciente</Label>
          <Input value={patientName || ""} readOnly />
        </Field>
      </Grid>

      <SectionTitle>Registro</SectionTitle>
      <Grid columns={2}>
        <Field>
          <Label>Fecha y Hora</Label>
          <Input 
            type="datetime-local" 
            value={form.fecha_hora || ""} 
            readOnly={isReadOnly}
            onChange={(e)=>setField('fecha_hora', e.target.value)} 
          />
        </Field>
        <Field style={{ gridColumn: "1 / -1" }}>
          <Label>Notas</Label>
          <TextArea value={form.notas || ""} readOnly={isReadOnly} onChange={(e)=>setField('notas', e.target.value)} />
        </Field>
      </Grid>

      <SectionTitle>Signos Vitales</SectionTitle>
      <Grid>
        <Field>
          <Label>Peso</Label>
          <Input type="number" min="0" value={form.peso || ""} readOnly={isReadOnly} onChange={(e)=>setField('peso', e.target.value)} />
        </Field>
        <Field>
          <Label>Talla</Label>
          <Input type="number" min="0" value={form.talla || ""} readOnly={isReadOnly} onChange={(e)=>setField('talla', e.target.value)} />
        </Field>
        <Field>
          <Label>T/A</Label>
          <Input type="number" min="0" value={form.ta || ""} readOnly={isReadOnly} onChange={(e)=>setField('ta', e.target.value)} />
        </Field>
        <Field>
          <Label>F.C.</Label>
          <Input type="number" min="0" value={form.fc || ""} readOnly={isReadOnly} onChange={(e)=>setField('fc', e.target.value)} />
        </Field>
        <Field>
          <Label>F.R.</Label>
          <Input type="number" min="0" value={form.fr || ""} readOnly={isReadOnly} onChange={(e)=>setField('fr', e.target.value)} />
        </Field>
        <Field>
          <Label>Temp</Label>
          <Input type="number" min="0" value={form.temp || ""} readOnly={isReadOnly} onChange={(e)=>setField('temp', e.target.value)} />
        </Field>
      </Grid>

      <SectionTitle>Dx / Plan / Firma</SectionTitle>
      <Grid columns={2}>
        <Field>
          <Label>Dx</Label>
          <Input value={form.dx || ""} readOnly={isReadOnly} onChange={(e)=>setField('dx', e.target.value)} />
        </Field>
        <Field>
          <Label>Plan</Label>
          <Input value={form.plan || ""} readOnly={isReadOnly} onChange={(e)=>setField('plan', e.target.value)} />
        </Field>
        <Field>
          <Label>Firma (nombre)</Label>
          <Input value={form.firma || ""} readOnly={isReadOnly} onChange={(e)=>setField('firma', e.target.value)} />
        </Field>
        <Field>
          <Label>Especialidad</Label>
          <Input value={form.especialidad || ""} readOnly={isReadOnly} onChange={(e)=>setField('especialidad', e.target.value)} />
        </Field>
        <Field>
          <Label>Cédula Profesional</Label>
          <Input value={form.cedula_prof || ""} readOnly={isReadOnly} onChange={(e)=>setField('cedula_prof', e.target.value)} />
        </Field>
        <Field>
          <Label>Cédula de Especialidad</Label>
          <Input value={form.cedula_especialidad || ""} readOnly={isReadOnly} onChange={(e)=>setField('cedula_especialidad', e.target.value)} />
        </Field>
      </Grid>

      <Actions>
        <Button appearance="subtle" onClick={onCancel}>Cerrar</Button>
        {!isReadOnly && (
          <Button appearance="primary" onClick={submit} isDisabled={saving}>
            {mode === "create" ? "Guardar Nota" : "Actualizar Nota"}
          </Button>
        )}
      </Actions>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display:flex; flex-direction:column; gap:8px; max-width:800px; padding-bottom:32px;
`;
const SectionTitle = styled.h4`margin:8px 0 4px 0; border-bottom:1px solid #eee; padding-bottom:4px;`;
const Label = styled.label`font-size:13px; margin-top:6px; color:#666;`;
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
const Input = styled.input`padding:8px; border:1px solid #DFE1E6; border-radius:4px; &:read-only { background:#f9f9f9; }`;
const TextArea = styled.textarea`padding:8px; border:1px solid #DFE1E6; border-radius:4px; min-height:120px; &:read-only { background:#f9f9f9; }`;
const Actions = styled.div`display:flex; gap:8px; margin-top:20px;`;

export default MedicalNoteForm;
