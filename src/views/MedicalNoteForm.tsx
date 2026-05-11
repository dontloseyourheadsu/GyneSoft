import React, { useState } from "react";
import Button from "@atlaskit/button";
import styled from "styled-components";
import type { MedicalNote } from "../types";
import { api } from "../api";

interface Props { patientId: number; patientName?: string | null; onSaved?: () => void }

const MedicalNoteForm: React.FC<Props> = ({ patientId, patientName, onSaved }) => {
  const [form, setForm] = useState<Partial<MedicalNote>>({ patient_id: patientId });
  const [saving, setSaving] = useState(false);

  const setField = (k: keyof MedicalNote, v: any) => setForm((s) => ({ ...s, [k]: v }));

  const isNegative = (value?: string | null) => {
    if (value === undefined || value === null || value === "") return false;
    const num = Number(value);
    return Number.isFinite(num) && num < 0;
  };

  const submit = async () => {
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
      await api.createMedicalNote(form as MedicalNote);
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
          <Input type="datetime-local" value={form.fecha_hora || ""} onChange={(e)=>setField('fecha_hora', e.target.value)} />
        </Field>
        <Field style={{ gridColumn: "1 / -1" }}>
          <Label>Notas</Label>
          <TextArea value={form.notas || ""} onChange={(e)=>setField('notas', e.target.value)} />
        </Field>
      </Grid>

      <SectionTitle>Signos Vitales</SectionTitle>
      <Grid>
        <Field>
          <Label>Peso</Label>
          <Input type="number" min="0" value={form.peso || ""} onChange={(e)=>setField('peso', e.target.value)} />
        </Field>
        <Field>
          <Label>Talla</Label>
          <Input type="number" min="0" value={form.talla || ""} onChange={(e)=>setField('talla', e.target.value)} />
        </Field>
        <Field>
          <Label>T/A</Label>
          <Input type="number" min="0" value={form.ta || ""} onChange={(e)=>setField('ta', e.target.value)} />
        </Field>
        <Field>
          <Label>F.C.</Label>
          <Input type="number" min="0" value={form.fc || ""} onChange={(e)=>setField('fc', e.target.value)} />
        </Field>
        <Field>
          <Label>F.R.</Label>
          <Input type="number" min="0" value={form.fr || ""} onChange={(e)=>setField('fr', e.target.value)} />
        </Field>
        <Field>
          <Label>Temp</Label>
          <Input type="number" min="0" value={form.temp || ""} onChange={(e)=>setField('temp', e.target.value)} />
        </Field>
      </Grid>

      <SectionTitle>Dx / Plan / Firma</SectionTitle>
      <Grid columns={2}>
        <Field>
          <Label>Dx</Label>
          <Input value={form.dx || ""} onChange={(e)=>setField('dx', e.target.value)} />
        </Field>
        <Field>
          <Label>Plan</Label>
          <Input value={form.plan || ""} onChange={(e)=>setField('plan', e.target.value)} />
        </Field>
        <Field>
          <Label>Firma (nombre)</Label>
          <Input value={form.firma || ""} onChange={(e)=>setField('firma', e.target.value)} />
        </Field>
        <Field>
          <Label>Especialidad</Label>
          <Input value={form.especialidad || ""} onChange={(e)=>setField('especialidad', e.target.value)} />
        </Field>
        <Field>
          <Label>Cédula Profesional</Label>
          <Input value={form.cedula_prof || ""} onChange={(e)=>setField('cedula_prof', e.target.value)} />
        </Field>
        <Field>
          <Label>Cédula de Especialidad</Label>
          <Input value={form.cedula_especialidad || ""} onChange={(e)=>setField('cedula_especialidad', e.target.value)} />
        </Field>
      </Grid>

      <div>
        <Button appearance="primary" onClick={submit} isDisabled={saving}>Guardar Nota</Button>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display:flex; flex-direction:column; gap:8px;
`;
const SectionTitle = styled.h4`margin:8px 0 4px 0;`;
const Label = styled.label`font-size:13px; margin-top:6px;`;
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
const Input = styled.input`padding:8px; border:1px solid #DFE1E6; border-radius:4px;`;
const TextArea = styled.textarea`padding:8px; border:1px solid #DFE1E6; border-radius:4px; min-height:120px;`;

export default MedicalNoteForm;
