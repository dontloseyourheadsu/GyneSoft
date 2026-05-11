import React, { useState } from "react";
import Button from "@atlaskit/button";
import styled from "styled-components";
import type { ClinicalHistory } from "../types";
import { api } from "../api";

interface Props {
  patientId: number;
  onSaved?: () => void;
}

const formatTodayDate = () => {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const ClinicalHistoryForm: React.FC<Props> = ({ patientId, onSaved }) => {
  const [form, setForm] = useState<Partial<ClinicalHistory>>({ patient_id: patientId, fecha: formatTodayDate() });
  const [saving, setSaving] = useState(false);

  const setField = (k: keyof ClinicalHistory, v: any) => setForm((s) => ({ ...s, [k]: v }));

  const isNegative = (value?: string | null) => {
    if (value === undefined || value === null || value === "") return false;
    const num = Number(value);
    return Number.isFinite(num) && num < 0;
  };

  const submit = async () => {
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
            <Input type="date" value={form.fecha || ""} onChange={(e)=>setField('fecha', e.target.value)} />
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle>Antecedentes Heredofamiliares</SectionTitle>
        <Grid>
          <CheckRow>
            <input type="checkbox" checked={form.diabetes === "Si"} onChange={(e)=>setField('diabetes', e.target.checked ? "Si" : "No")} />
            <span>Diabetes</span>
          </CheckRow>
          <CheckRow>
            <input type="checkbox" checked={form.hipertension === "Si"} onChange={(e)=>setField('hipertension', e.target.checked ? "Si" : "No")} />
            <span>Hipertensión</span>
          </CheckRow>
          <CheckRow>
            <input type="checkbox" checked={form.cancer === "Si"} onChange={(e)=>setField('cancer', e.target.checked ? "Si" : "No")} />
            <span>Cáncer</span>
          </CheckRow>
          <Field>
            <Label>Otros</Label>
            <Input value={form.otros_heredo || ""} onChange={(e)=>setField('otros_heredo', e.target.value)} />
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle>Antecedentes Personales No Patológicos</SectionTitle>
        <Grid>
          <Field>
            <Label>Higiene Personal</Label>
            <Input value={form.higiene_personal || ""} onChange={(e)=>setField('higiene_personal', e.target.value)} />
          </Field>
          <Field>
            <Label>Calidad de Alimentación</Label>
            <Input value={form.calidad_alimentacion || ""} onChange={(e)=>setField('calidad_alimentacion', e.target.value)} />
          </Field>
          <CheckRow>
            <input type="checkbox" checked={form.tabaquismo === "Si"} onChange={(e)=>setField('tabaquismo', e.target.checked ? "Si" : "No")} />
            <span>Tabaquismo</span>
          </CheckRow>
          <CheckRow>
            <input type="checkbox" checked={form.alcoholismo === "Si"} onChange={(e)=>setField('alcoholismo', e.target.checked ? "Si" : "No")} />
            <span>Alcoholismo</span>
          </CheckRow>
          <Field>
            <Label>Grupo Sanguíneo y RH</Label>
            <Input value={form.grupo_sanguineo_rh || ""} onChange={(e)=>setField('grupo_sanguineo_rh', e.target.value)} />
          </Field>
          <Field>
            <Label>Otros</Label>
            <Input value={form.otros_no_patologicos || ""} onChange={(e)=>setField('otros_no_patologicos', e.target.value)} />
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle>Antecedentes Personales Patológicos</SectionTitle>
        <Grid>
          <Field>
            <Label>Alergias</Label>
            <Input value={form.alergias || ""} onChange={(e)=>setField('alergias', e.target.value)} />
          </Field>
          <Field>
            <Label>Quirúrgicos</Label>
            <Input value={form.quirurgicos || ""} onChange={(e)=>setField('quirurgicos', e.target.value)} />
          </Field>
          <Field>
            <Label>Traumáticos</Label>
            <Input value={form.traumaticos || ""} onChange={(e)=>setField('traumaticos', e.target.value)} />
          </Field>
          <Field>
            <Label>Transfuncionales</Label>
            <Input value={form.transfusionales || ""} onChange={(e)=>setField('transfusionales', e.target.value)} />
          </Field>
          <Field>
            <Label>Médicos</Label>
            <Input value={form.medicos || ""} onChange={(e)=>setField('medicos', e.target.value)} />
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle>Antecedentes Gineco-Obstétricos</SectionTitle>
        <Grid>
          <Field>
            <Label>Menarca (Edad de primera regla)</Label>
            <Input type="number" min="0" value={form.menarca || ""} onChange={(e)=>setField('menarca', e.target.value)} />
          </Field>
          <Field>
            <Label>Telarca</Label>
            <Input type="number" min="0" value={form.telarca || ""} onChange={(e)=>setField('telarca', e.target.value)} />
          </Field>
          <Field>
            <Label>Pubarca</Label>
            <Input type="number" min="0" value={form.pubarca || ""} onChange={(e)=>setField('pubarca', e.target.value)} />
          </Field>
          <Field>
            <Label>Ritmo (Frecuencia x Duración)</Label>
            <Input value={form.ritmo || ""} onChange={(e)=>setField('ritmo', e.target.value)} />
          </Field>
          <Field>
            <Label>Dismenorrea</Label>
            <Input value={form.dismenorrea || ""} onChange={(e)=>setField('dismenorrea', e.target.value)} />
          </Field>
          <Field>
            <Label>IVSA (Inicio de Vida Sexual Activa)</Label>
            <Input type="number" min="0" value={form.ivsa || ""} onChange={(e)=>setField('ivsa', e.target.value)} />
          </Field>
          <Field>
            <Label>Número de parejas sexuales</Label>
            <Input type="number" min="0" value={form.numero_parejas || ""} onChange={(e)=>setField('numero_parejas', e.target.value)} />
          </Field>
          <Field>
            <Label>Método anticonceptivo</Label>
            <Input value={form.metodo_anticonceptivo || ""} onChange={(e)=>setField('metodo_anticonceptivo', e.target.value)} />
          </Field>
          <Field>
            <Label>Gesta</Label>
            <Input type="number" min="0" value={form.gesta || ""} onChange={(e)=>setField('gesta', e.target.value)} />
          </Field>
          <Field>
            <Label>Para</Label>
            <Input type="number" min="0" value={form.para || ""} onChange={(e)=>setField('para', e.target.value)} />
          </Field>
          <Field>
            <Label>Cesáreas</Label>
            <Input type="number" min="0" value={form.cesareas || ""} onChange={(e)=>setField('cesareas', e.target.value)} />
          </Field>
          <Field>
            <Label>Abortos</Label>
            <Input type="number" min="0" value={form.abortos || ""} onChange={(e)=>setField('abortos', e.target.value)} />
          </Field>
          <Field>
            <Label>Productos</Label>
            <Input type="number" min="0" value={form.productos || ""} onChange={(e)=>setField('productos', e.target.value)} />
          </Field>
          <Field>
            <Label>F.U.P. (Fecha de Último Parto)</Label>
            <Input type="date" value={form.fup || ""} onChange={(e)=>setField('fup', e.target.value)} />
          </Field>
          <Field>
            <Label>D.O.C. (Papanicolaou)</Label>
            <Input type="date" value={form.doc || ""} onChange={(e)=>setField('doc', e.target.value)} />
          </Field>
          <Field>
            <Label>F.U.R. (Fecha de Última Regla)</Label>
            <Input type="date" value={form.fur || ""} onChange={(e)=>setField('fur', e.target.value)} />
          </Field>
          <Field>
            <Label>F.P.P. (Fecha Probable de Parto)</Label>
            <Input type="date" value={form.fpp || ""} onChange={(e)=>setField('fpp', e.target.value)} />
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle>Padecimiento actual</SectionTitle>
        <LargeTextArea value={form.padecimiento_actual || ""} onChange={(e)=>setField('padecimiento_actual', e.target.value)} />
      </SectionBlock>

      <SectionBlock>
        <SectionTitle>Exploración Física (Signos Vitales)</SectionTitle>
        <Grid>
          <Field>
            <Label>Peso (kg)</Label>
            <Input type="number" min="0" value={form.peso || ""} onChange={(e)=>setField('peso', e.target.value)} />
          </Field>
          <Field>
            <Label>Talla (cms)</Label>
            <Input type="number" min="0" value={form.talla || ""} onChange={(e)=>setField('talla', e.target.value)} />
          </Field>
          <Field>
            <Label>I.M.C.</Label>
            <Input type="number" min="0" value={form.imc || ""} onChange={(e)=>setField('imc', e.target.value)} />
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
          <Field>
            <Label>SO2</Label>
            <Input type="number" min="0" value={form.so2 || ""} onChange={(e)=>setField('so2', e.target.value)} />
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle>Habitus Exterior y Revisión por Sistemas</SectionTitle>
        <Grid columns={3}>
          <Field>
            <Label>Habitus exterior</Label>
            <TextArea value={form.habitus_exterior || ""} onChange={(e)=>setField('habitus_exterior', e.target.value)} />
          </Field>
          <Field>
            <Label>Cabeza</Label>
            <TextArea value={form.cabeza || ""} onChange={(e)=>setField('cabeza', e.target.value)} />
          </Field>
          <Field>
            <Label>Tórax</Label>
            <TextArea value={form.torax || ""} onChange={(e)=>setField('torax', e.target.value)} />
          </Field>
          <Field>
            <Label>Abdomen</Label>
            <TextArea value={form.abdomen || ""} onChange={(e)=>setField('abdomen', e.target.value)} />
          </Field>
          <Field>
            <Label>Genitales</Label>
            <TextArea value={form.genitales || ""} onChange={(e)=>setField('genitales', e.target.value)} />
          </Field>
          <Field>
            <Label>Extremidades</Label>
            <TextArea value={form.extremidades || ""} onChange={(e)=>setField('extremidades', e.target.value)} />
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle>Conclusión Médica</SectionTitle>
        <Grid columns={2}>
          <Field>
            <Label>Estudios de Laboratorio y Gabinete</Label>
            <TextArea value={form.estudios_lab || ""} onChange={(e)=>setField('estudios_lab', e.target.value)} />
          </Field>
          <Field>
            <Label>DIAGNÓSTICO</Label>
            <TextArea value={form.diagnostico || ""} onChange={(e)=>setField('diagnostico', e.target.value)} />
          </Field>
          <Field>
            <Label>Tratamiento</Label>
            <TextArea value={form.tratamiento || ""} onChange={(e)=>setField('tratamiento', e.target.value)} />
          </Field>
          <Field>
            <Label>Comentarios</Label>
            <TextArea value={form.comentarios || ""} onChange={(e)=>setField('comentarios', e.target.value)} />
          </Field>
        </Grid>
      </SectionBlock>

      <div>
        <Button appearance="primary" onClick={submit} isDisabled={saving}>Guardar Historia</Button>
      </div>
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
const Input = styled.input`padding:8px; border:1px solid #DFE1E6; border-radius:4px;`;
const TextArea = styled.textarea`padding:8px; border:1px solid #DFE1E6; border-radius:4px; min-height:80px;`;
const LargeTextArea = styled.textarea`padding:10px; border:1px solid #DFE1E6; border-radius:6px; min-height:160px; width:100%;`;

export default ClinicalHistoryForm;
