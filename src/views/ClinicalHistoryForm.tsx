import React, { useState, useEffect } from "react";
import Button from "@atlaskit/button";
import styled from "styled-components";
import type { ClinicalHistory } from "../types";
import { api } from "../api";

interface Props {
  patientId: number;
  initialData?: ClinicalHistory | null;
  mode?: "view" | "edit";
  onSaved?: () => void;
  onCancel?: () => void;
}

const formatTodayDate = () => {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const ClinicalHistoryForm: React.FC<Props> = ({ patientId, initialData, mode = "edit", onSaved, onCancel }) => {
  const [form, setForm] = useState<Partial<ClinicalHistory>>({ patient_id: patientId, fecha: formatTodayDate() });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    }
  }, [initialData]);

  const isReadOnly = mode === "view";

  const setField = (k: keyof ClinicalHistory, v: any) => {
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
      isNegative(form.menarca) ||
      isNegative(form.telarca) ||
      isNegative(form.pubarca) ||
      isNegative(form.ivsa) ||
      isNegative(form.numero_parejas) ||
      isNegative(form.gesta) ||
      isNegative(form.para) ||
      isNegative(form.cesareas) ||
      isNegative(form.abortos) ||
      isNegative(form.productos) ||
      isNegative(form.peso) ||
      isNegative(form.talla) ||
      isNegative(form.imc) ||
      isNegative(form.ta) ||
      isNegative(form.fc) ||
      isNegative(form.fr) ||
      isNegative(form.temp) ||
      isNegative(form.so2)
    ) {
      window.alert("Hay valores numéricos negativos. Corrija antes de guardar.");
      return;
    }
    setSaving(true);
    try {
      // Logic for create or update if we had an update command, 
      // for now keeping it as create_clinical_history as in previous state
      await api.createClinicalHistory(form as ClinicalHistory);
      onSaved?.();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Wrapper>
      <SectionBlock>
        <SectionTitle>Fecha</SectionTitle>
        <Grid columns={2}>
          <Field>
            <Label>Fecha de registro</Label>
            <Input 
              type="date" 
              value={form.fecha || ""} 
              readOnly={isReadOnly}
              onChange={(e)=>setField('fecha', e.target.value)} 
            />
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle>Antecedentes Heredofamiliares</SectionTitle>
        <Grid>
          <CheckRow>
            <input 
              type="checkbox" 
              disabled={isReadOnly}
              checked={form.diabetes === "Si"} 
              onChange={(e)=>setField('diabetes', e.target.checked ? "Si" : "No")} 
            />
            <span>Diabetes</span>
          </CheckRow>
          <CheckRow>
            <input 
              type="checkbox" 
              disabled={isReadOnly}
              checked={form.hipertension === "Si"} 
              onChange={(e)=>setField('hipertension', e.target.checked ? "Si" : "No")} 
            />
            <span>Hipertensión</span>
          </CheckRow>
          <CheckRow>
            <input 
              type="checkbox" 
              disabled={isReadOnly}
              checked={form.cancer === "Si"} 
              onChange={(e)=>setField('cancer', e.target.checked ? "Si" : "No")} 
            />
            <span>Cáncer</span>
          </CheckRow>
          <Field>
            <Label>Otros</Label>
            <Input 
              value={form.otros_heredo || ""} 
              readOnly={isReadOnly}
              onChange={(e)=>setField('otros_heredo', e.target.value)} 
            />
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle>Antecedentes Personales No Patológicos</SectionTitle>
        <Grid>
          <Field>
            <Label>Higiene Personal</Label>
            <Input value={form.higiene_personal || ""} readOnly={isReadOnly} onChange={(e)=>setField('higiene_personal', e.target.value)} />
          </Field>
          <Field>
            <Label>Calidad de Alimentación</Label>
            <Input value={form.calidad_alimentacion || ""} readOnly={isReadOnly} onChange={(e)=>setField('calidad_alimentacion', e.target.value)} />
          </Field>
          <CheckRow>
            <input type="checkbox" disabled={isReadOnly} checked={form.tabaquismo === "Si"} onChange={(e)=>setField('tabaquismo', e.target.checked ? "Si" : "No")} />
            <span>Tabaquismo</span>
          </CheckRow>
          <CheckRow>
            <input type="checkbox" disabled={isReadOnly} checked={form.alcoholismo === "Si"} onChange={(e)=>setField('alcoholismo', e.target.checked ? "Si" : "No")} />
            <span>Alcoholismo</span>
          </CheckRow>
          <Field>
            <Label>Grupo Sanguíneo y RH</Label>
            <Input value={form.grupo_sanguineo_rh || ""} readOnly={isReadOnly} onChange={(e)=>setField('grupo_sanguineo_rh', e.target.value)} />
          </Field>
          <Field>
            <Label>Otros</Label>
            <Input value={form.otros_no_patologicos || ""} readOnly={isReadOnly} onChange={(e)=>setField('otros_no_patologicos', e.target.value)} />
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle>Antecedentes Personales Patológicos</SectionTitle>
        <Grid>
          <Field>
            <Label>Alergias</Label>
            <Input value={form.alergias || ""} readOnly={isReadOnly} onChange={(e)=>setField('alergias', e.target.value)} />
          </Field>
          <Field>
            <Label>Quirúrgicos</Label>
            <Input value={form.quirurgicos || ""} readOnly={isReadOnly} onChange={(e)=>setField('quirurgicos', e.target.value)} />
          </Field>
          <Field>
            <Label>Traumáticos</Label>
            <Input value={form.traumaticos || ""} readOnly={isReadOnly} onChange={(e)=>setField('traumaticos', e.target.value)} />
          </Field>
          <Field>
            <Label>Transfuncionales</Label>
            <Input value={form.transfusionales || ""} readOnly={isReadOnly} onChange={(e)=>setField('transfusionales', e.target.value)} />
          </Field>
          <Field>
            <Label>Médicos</Label>
            <Input value={form.medicos || ""} readOnly={isReadOnly} onChange={(e)=>setField('medicos', e.target.value)} />
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle>Antecedentes Gineco-Obstétricos</SectionTitle>
        <Grid>
          <Field>
            <Label>Menarca (Edad de primera regla)</Label>
            <Input type="number" min="0" value={form.menarca || ""} readOnly={isReadOnly} onChange={(e)=>setField('menarca', e.target.value)} />
          </Field>
          <Field>
            <Label>Telarca</Label>
            <Input type="number" min="0" value={form.telarca || ""} readOnly={isReadOnly} onChange={(e)=>setField('telarca', e.target.value)} />
          </Field>
          <Field>
            <Label>Pubarca</Label>
            <Input type="number" min="0" value={form.pubarca || ""} readOnly={isReadOnly} onChange={(e)=>setField('pubarca', e.target.value)} />
          </Field>
          <Field>
            <Label>Ritmo (Frecuencia x Duración)</Label>
            <Input value={form.ritmo || ""} readOnly={isReadOnly} onChange={(e)=>setField('ritmo', e.target.value)} />
          </Field>
          <Field>
            <Label>Dismenorrea</Label>
            <Input value={form.dismenorrea || ""} readOnly={isReadOnly} onChange={(e)=>setField('dismenorrea', e.target.value)} />
          </Field>
          <Field>
            <Label>IVSA (Inicio de Vida Sexual Activa)</Label>
            <Input type="number" min="0" value={form.ivsa || ""} readOnly={isReadOnly} onChange={(e)=>setField('ivsa', e.target.value)} />
          </Field>
          <Field>
            <Label>Número de parejas sexuales</Label>
            <Input type="number" min="0" value={form.numero_parejas || ""} readOnly={isReadOnly} onChange={(e)=>setField('numero_parejas', e.target.value)} />
          </Field>
          <Field>
            <Label>Método anticonceptivo</Label>
            <Input value={form.metodo_anticonceptivo || ""} readOnly={isReadOnly} onChange={(e)=>setField('metodo_anticonceptivo', e.target.value)} />
          </Field>
          <Field>
            <Label>Gesta</Label>
            <Input type="number" min="0" value={form.gesta || ""} readOnly={isReadOnly} onChange={(e)=>setField('gesta', e.target.value)} />
          </Field>
          <Field>
            <Label>Para</Label>
            <Input type="number" min="0" value={form.para || ""} readOnly={isReadOnly} onChange={(e)=>setField('para', e.target.value)} />
          </Field>
          <Field>
            <Label>Cesáreas</Label>
            <Input type="number" min="0" value={form.cesareas || ""} readOnly={isReadOnly} onChange={(e)=>setField('cesareas', e.target.value)} />
          </Field>
          <Field>
            <Label>Abortos</Label>
            <Input type="number" min="0" value={form.abortos || ""} readOnly={isReadOnly} onChange={(e)=>setField('abortos', e.target.value)} />
          </Field>
          <Field>
            <Label>Productos</Label>
            <Input type="number" min="0" value={form.productos || ""} readOnly={isReadOnly} onChange={(e)=>setField('productos', e.target.value)} />
          </Field>
          <Field>
            <Label>F.U.P. (Fecha de Último Parto)</Label>
            <Input type="date" value={form.fup || ""} readOnly={isReadOnly} onChange={(e)=>setField('fup', e.target.value)} />
          </Field>
          <Field>
            <Label>D.O.C. (Papanicolaou)</Label>
            <Input type="date" value={form.doc || ""} readOnly={isReadOnly} onChange={(e)=>setField('doc', e.target.value)} />
          </Field>
          <Field>
            <Label>F.U.R. (Fecha de Última Regla)</Label>
            <Input type="date" value={form.fur || ""} readOnly={isReadOnly} onChange={(e)=>setField('fur', e.target.value)} />
          </Field>
          <Field>
            <Label>F.P.P. (Fecha Probable de Parto)</Label>
            <Input type="date" value={form.fpp || ""} readOnly={isReadOnly} onChange={(e)=>setField('fpp', e.target.value)} />
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle>Padecimiento actual</SectionTitle>
        <LargeTextArea value={form.padecimiento_actual || ""} readOnly={isReadOnly} onChange={(e)=>setField('padecimiento_actual', e.target.value)} />
      </SectionBlock>

      <SectionBlock>
        <SectionTitle>Exploración Física (Signos Vitales)</SectionTitle>
        <Grid>
          <Field>
            <Label>Peso (kg)</Label>
            <Input type="number" min="0" value={form.peso || ""} readOnly={isReadOnly} onChange={(e)=>setField('peso', e.target.value)} />
          </Field>
          <Field>
            <Label>Talla (cms)</Label>
            <Input type="number" min="0" value={form.talla || ""} readOnly={isReadOnly} onChange={(e)=>setField('talla', e.target.value)} />
          </Field>
          <Field>
            <Label>I.M.C.</Label>
            <Input type="number" min="0" value={form.imc || ""} readOnly={isReadOnly} onChange={(e)=>setField('imc', e.target.value)} />
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
          <Field>
            <Label>SO2</Label>
            <Input type="number" min="0" value={form.so2 || ""} readOnly={isReadOnly} onChange={(e)=>setField('so2', e.target.value)} />
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle>Habitus Exterior y Revisión por Sistemas</SectionTitle>
        <Grid columns={3}>
          <Field>
            <Label>Habitus exterior</Label>
            <TextArea value={form.habitus_exterior || ""} readOnly={isReadOnly} onChange={(e)=>setField('habitus_exterior', e.target.value)} />
          </Field>
          <Field>
            <Label>Cabeza</Label>
            <TextArea value={form.cabeza || ""} readOnly={isReadOnly} onChange={(e)=>setField('cabeza', e.target.value)} />
          </Field>
          <Field>
            <Label>Tórax</Label>
            <TextArea value={form.torax || ""} readOnly={isReadOnly} onChange={(e)=>setField('torax', e.target.value)} />
          </Field>
          <Field>
            <Label>Abdomen</Label>
            <TextArea value={form.abdomen || ""} readOnly={isReadOnly} onChange={(e)=>setField('abdomen', e.target.value)} />
          </Field>
          <Field>
            <Label>Genitales</Label>
            <TextArea value={form.genitales || ""} readOnly={isReadOnly} onChange={(e)=>setField('genitales', e.target.value)} />
          </Field>
          <Field>
            <Label>Extremidades</Label>
            <TextArea value={form.extremidades || ""} readOnly={isReadOnly} onChange={(e)=>setField('extremidades', e.target.value)} />
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle>Conclusión Médica</SectionTitle>
        <Grid columns={2}>
          <Field>
            <Label>Estudios de Laboratorio y Gabinete</Label>
            <TextArea value={form.estudios_lab || ""} readOnly={isReadOnly} onChange={(e)=>setField('estudios_lab', e.target.value)} />
          </Field>
          <Field>
            <Label>DIAGNÓSTICO</Label>
            <TextArea value={form.diagnostico || ""} readOnly={isReadOnly} onChange={(e)=>setField('diagnostico', e.target.value)} />
          </Field>
          <Field>
            <Label>Tratamiento</Label>
            <TextArea value={form.tratamiento || ""} readOnly={isReadOnly} onChange={(e)=>setField('tratamiento', e.target.value)} />
          </Field>
          <Field>
            <Label>Comentarios</Label>
            <TextArea value={form.comentarios || ""} readOnly={isReadOnly} onChange={(e)=>setField('comentarios', e.target.value)} />
          </Field>
        </Grid>
      </SectionBlock>

      <Actions>
        <Button appearance="subtle" onClick={onCancel}>Cerrar</Button>
        {!isReadOnly && (
          <Button appearance="primary" onClick={submit} isDisabled={saving}>Guardar Historia</Button>
        )}
      </Actions>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display:flex; flex-direction:column; gap:16px; max-width:960px;
`;
const SectionTitle = styled.h4`margin:8px 0 4px 0;`;
const Label = styled.label`font-size:13px; margin-top:6px;`;
const CheckRow = styled.label`
  display:flex; align-items:center; gap:8px; font-size:13px;
  input { width:auto; }
`;
const SectionBlock = styled.section`
  border:1px solid #E5E7EB;
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
const Input = styled.input`padding:8px; border:1px solid #DFE1E6; border-radius:4px; &:read-only { background:#f9f9f9; }`;
const TextArea = styled.textarea`padding:8px; border:1px solid #DFE1E6; border-radius:4px; min-height:80px; &:read-only { background:#f9f9f9; }`;
const LargeTextArea = styled.textarea`padding:10px; border:1px solid #DFE1E6; border-radius:6px; min-height:160px; width:100%; &:read-only { background:#f9f9f9; }`;
const Actions = styled.div`display:flex; gap:8px; margin-top:16px;`;

export default ClinicalHistoryForm;
