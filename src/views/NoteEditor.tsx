import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import Button from "@atlaskit/button";
import TextField from "@atlaskit/textfield";
import TextArea from "@atlaskit/textarea";
import { token } from "@atlaskit/tokens";
import styled from "styled-components";
import SectionMessage from "@atlaskit/section-message";

interface PatientNoteForm {
  name: string;
  age: string;
  civil_status: string;
  education: string;
  occupation: string;
  address: string;
  phone: string;
  bg_heredo_fam: string;
  bg_personal_non_path: string;
  bg_personal_path: string;
  allergies: string;
  surgeries: string;
  transfusions: string;
  trauma: string;
  menarche: string;
  rhythm: string;
  ivsa: string;
  partners: string;
  gestations: string;
  parity: string;
  c_sections: string;
  abortions: string;
  contraception: string;
  last_pap: string;
  last_period_date: string;
  due_date: string;
  weight: string;
  height: string;
  bmi: string;
  blood_pressure: string;
  heart_rate: string;
  respiratory_rate: string;
  temperature: string;
  habitus_exterior: string;
  head: string;
  thorax: string;
  abdomen: string;
  genitals: string;
  extremities: string;
  labs_studies: string;
  diagnosis: string;
  treatment: string;
  general_notes: string;
}

const EMPTY_FORM: PatientNoteForm = {
  name: "",
  age: "",
  civil_status: "",
  education: "",
  occupation: "",
  address: "",
  phone: "",
  bg_heredo_fam: "",
  bg_personal_non_path: "",
  bg_personal_path: "",
  allergies: "",
  surgeries: "",
  transfusions: "",
  trauma: "",
  menarche: "",
  rhythm: "",
  ivsa: "",
  partners: "",
  gestations: "",
  parity: "",
  c_sections: "",
  abortions: "",
  contraception: "",
  last_pap: "",
  last_period_date: "",
  due_date: "",
  weight: "",
  height: "",
  bmi: "",
  blood_pressure: "",
  heart_rate: "",
  respiratory_rate: "",
  temperature: "",
  habitus_exterior: "",
  head: "",
  thorax: "",
  abdomen: "",
  genitals: "",
  extremities: "",
  labs_studies: "",
  diagnosis: "",
  treatment: "",
  general_notes: "",
};

const NoteEditor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const noteId = searchParams.get("id");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PatientNoteForm>(EMPTY_FORM);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (noteId) {
      loadNote(parseInt(noteId));
    }
  }, [noteId]);

  const loadNote = async (id: number) => {
    try {
      const result = await invoke<Partial<PatientNoteForm>>("get_note", { id });
      setFormData({ ...EMPTY_FORM, ...result });
      setSaveError("");
    } catch (err) {
      console.error("Failed to load note", err);
      setSaveError("No se pudo cargar el registro clínico.");
    }
  };

  const handleInputChange = (field: keyof PatientNoteForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onSave = async () => {
    if (!formData.name) {
      alert("El nombre es obligatorio");
      return;
    }
    setLoading(true);
    setSaveError("");
    try {
      if (noteId) {
        await invoke("update_note", { id: parseInt(noteId), note: formData });
      } else {
        await invoke("create_note", { note: formData });
      }
      navigate("/notes");
    } catch (err) {
      console.error("Failed to save note", err);
      setSaveError("No se pudo guardar el registro. Verifique los datos e intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <Title>{noteId ? `Editar Registro #${noteId}` : "Nueva Nota Médica"}</Title>
        <ButtonGroup>
          <Button onClick={() => navigate("/notes")}>Cancelar</Button>
          <Button appearance="primary" isDisabled={loading} onClick={onSave}>Guardar Registro</Button>
        </ButtonGroup>
      </Header>

      {saveError && (
        <SectionMessage appearance="error">
          <p>{saveError}</p>
        </SectionMessage>
      )}

      <ScrollArea>
        <Section>
          <SectionTitle>Datos de la Paciente</SectionTitle>
          <Grid>
            <FieldWrapper span={2}>
              <Label>Nombre Completo</Label>
              <TextField value={formData.name} onChange={(e: any) => handleInputChange("name", e.target.value)} />
            </FieldWrapper>
            <FieldWrapper>
              <Label>Edad</Label>
              <TextField value={formData.age} onChange={(e: any) => handleInputChange("age", e.target.value)} />
            </FieldWrapper>
            <FieldWrapper>
              <Label>Estado Civil</Label>
              <TextField value={formData.civil_status} onChange={(e: any) => handleInputChange("civil_status", e.target.value)} />
            </FieldWrapper>
            <FieldWrapper>
              <Label>Escolaridad</Label>
              <TextField value={formData.education} onChange={(e: any) => handleInputChange("education", e.target.value)} />
            </FieldWrapper>
            <FieldWrapper>
              <Label>Ocupación</Label>
              <TextField value={formData.occupation} onChange={(e: any) => handleInputChange("occupation", e.target.value)} />
            </FieldWrapper>
            <FieldWrapper span={2}>
              <Label>Dirección</Label>
              <TextField value={formData.address} onChange={(e: any) => handleInputChange("address", e.target.value)} />
            </FieldWrapper>
            <FieldWrapper>
              <Label>Teléfono</Label>
              <TextField value={formData.phone} onChange={(e: any) => handleInputChange("phone", e.target.value)} />
            </FieldWrapper>
          </Grid>
        </Section>

        <Section>
          <SectionTitle>Antecedentes Médicos</SectionTitle>
          <Column>
            <FieldWrapper>
              <Label>Heredofamiliares</Label>
              <TextArea value={formData.bg_heredo_fam} onChange={(e: any) => handleInputChange("bg_heredo_fam", e.target.value)} />
            </FieldWrapper>
            <FieldWrapper>
              <Label>Personales No Patológicos</Label>
              <TextArea value={formData.bg_personal_non_path} onChange={(e: any) => handleInputChange("bg_personal_non_path", e.target.value)} />
            </FieldWrapper>
            <FieldWrapper>
              <Label>Personales Patológicos</Label>
              <TextArea value={formData.bg_personal_path} onChange={(e: any) => handleInputChange("bg_personal_path", e.target.value)} />
            </FieldWrapper>
            <Grid>
              <FieldWrapper>
                <Label>Alergias</Label>
                <TextField value={formData.allergies} onChange={(e: any) => handleInputChange("allergies", e.target.value)} />
              </FieldWrapper>
              <FieldWrapper>
                <Label>Quirúrgicos</Label>
                <TextField value={formData.surgeries} onChange={(e: any) => handleInputChange("surgeries", e.target.value)} />
              </FieldWrapper>
              <FieldWrapper>
                <Label>Transfusiones</Label>
                <TextField value={formData.transfusions} onChange={(e: any) => handleInputChange("transfusions", e.target.value)} />
              </FieldWrapper>
              <FieldWrapper>
                <Label>Traumatismos</Label>
                <TextField value={formData.trauma} onChange={(e: any) => handleInputChange("trauma", e.target.value)} />
              </FieldWrapper>
            </Grid>
          </Column>
        </Section>

        <Section>
          <SectionTitle>Antecedentes Gineco-Obstétricos (AGO)</SectionTitle>
          <Grid cols={5}>
            <FieldWrapper><Label>Menarca</Label><TextField value={formData.menarche} onChange={(e:any)=>handleInputChange("menarche", e.target.value)}/></FieldWrapper>
            <FieldWrapper><Label>Ritmo</Label><TextField value={formData.rhythm} onChange={(e:any)=>handleInputChange("rhythm", e.target.value)}/></FieldWrapper>
            <FieldWrapper><Label>IVSA</Label><TextField value={formData.ivsa} onChange={(e:any)=>handleInputChange("ivsa", e.target.value)}/></FieldWrapper>
            <FieldWrapper><Label>Parejas</Label><TextField value={formData.partners} onChange={(e:any)=>handleInputChange("partners", e.target.value)}/></FieldWrapper>
            <FieldWrapper><Label>Gestas (G)</Label><TextField value={formData.gestations} onChange={(e:any)=>handleInputChange("gestations", e.target.value)}/></FieldWrapper>
            <FieldWrapper><Label>Partos (P)</Label><TextField value={formData.parity} onChange={(e:any)=>handleInputChange("parity", e.target.value)}/></FieldWrapper>
            <FieldWrapper><Label>Cesáreas (C)</Label><TextField value={formData.c_sections} onChange={(e:any)=>handleInputChange("c_sections", e.target.value)}/></FieldWrapper>
            <FieldWrapper><Label>Abortos (A)</Label><TextField value={formData.abortions} onChange={(e:any)=>handleInputChange("abortions", e.target.value)}/></FieldWrapper>
            <FieldWrapper><Label>Método Anticonceptivo</Label><TextField value={formData.contraception} onChange={(e:any)=>handleInputChange("contraception", e.target.value)}/></FieldWrapper>
            <FieldWrapper><Label>Último PAP</Label><TextField value={formData.last_pap} onChange={(e:any)=>handleInputChange("last_pap", e.target.value)}/></FieldWrapper>
            <FieldWrapper><Label>FUM</Label><TextField value={formData.last_period_date} onChange={(e:any)=>handleInputChange("last_period_date", e.target.value)}/></FieldWrapper>
            <FieldWrapper><Label>FPP</Label><TextField value={formData.due_date} onChange={(e:any)=>handleInputChange("due_date", e.target.value)}/></FieldWrapper>
          </Grid>
        </Section>

        <Section>
          <SectionTitle>Signos Vitales</SectionTitle>
          <Grid cols={5}>
            <FieldWrapper><Label>Peso (kg)</Label><TextField value={formData.weight} onChange={(e:any)=>handleInputChange("weight", e.target.value)}/></FieldWrapper>
            <FieldWrapper><Label>Talla (m)</Label><TextField value={formData.height} onChange={(e:any)=>handleInputChange("height", e.target.value)}/></FieldWrapper>
            <FieldWrapper><Label>T/A</Label><TextField value={formData.blood_pressure} onChange={(e:any)=>handleInputChange("blood_pressure", e.target.value)}/></FieldWrapper>
            <FieldWrapper><Label>F.C.</Label><TextField value={formData.heart_rate} onChange={(e:any)=>handleInputChange("heart_rate", e.target.value)}/></FieldWrapper>
            <FieldWrapper><Label>F.R.</Label><TextField value={formData.respiratory_rate} onChange={(e:any)=>handleInputChange("respiratory_rate", e.target.value)}/></FieldWrapper>
            <FieldWrapper><Label>Temp (°C)</Label><TextField value={formData.temperature} onChange={(e:any)=>handleInputChange("temperature", e.target.value)}/></FieldWrapper>
          </Grid>
        </Section>

        <Section>
          <SectionTitle>Exploración Física</SectionTitle>
          <Column>
            <FieldWrapper><Label>Habitus Exterior</Label><TextArea value={formData.habitus_exterior} onChange={(e:any)=>handleInputChange("habitus_exterior", e.target.value)}/></FieldWrapper>
            <FieldWrapper><Label>Cabeza y Cuello</Label><TextArea value={formData.head} onChange={(e:any)=>handleInputChange("head", e.target.value)}/></FieldWrapper>
            <FieldWrapper><Label>Tórax</Label><TextArea value={formData.thorax} onChange={(e:any)=>handleInputChange("thorax", e.target.value)}/></FieldWrapper>
            <FieldWrapper><Label>Abdomen</Label><TextArea value={formData.abdomen} onChange={(e:any)=>handleInputChange("abdomen", e.target.value)}/></FieldWrapper>
            <FieldWrapper><Label>Genitales</Label><TextArea value={formData.genitals} onChange={(e:any)=>handleInputChange("genitals", e.target.value)}/></FieldWrapper>
            <FieldWrapper><Label>Extremidades</Label><TextArea value={formData.extremities} onChange={(e:any)=>handleInputChange("extremities", e.target.value)}/></FieldWrapper>
          </Column>
        </Section>

        <Section>
          <SectionTitle>Evaluación y Plan</SectionTitle>
          <Column>
            <FieldWrapper><Label>Laboratorios y Estudios</Label><TextArea value={formData.labs_studies} onChange={(e:any)=>handleInputChange("labs_studies", e.target.value)}/></FieldWrapper>
            <FieldWrapper><Label>Diagnóstico</Label><TextArea value={formData.diagnosis} onChange={(e:any)=>handleInputChange("diagnosis", e.target.value)}/></FieldWrapper>
            <FieldWrapper><Label>Tratamiento</Label><TextArea value={formData.treatment} onChange={(e:any)=>handleInputChange("treatment", e.target.value)}/></FieldWrapper>
            <FieldWrapper><Label>Notas Generales</Label><TextArea value={formData.general_notes} onChange={(e:any)=>handleInputChange("general_notes", e.target.value)}/></FieldWrapper>
          </Column>
        </Section>
      </ScrollArea>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 2px solid ${token('color.border', '#DFE1E6')};
`;

const Title = styled.h2`
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const ScrollArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
  height: calc(100vh - 250px);
  overflow-y: auto;
  padding-right: 20px;
`;

const Section = styled.div`
  background: ${token('color.background.neutral.subtle', '#F4F5F7')};
  padding: 30px;
  border: 1px solid ${token('color.border', '#DFE1E6')};
`;

const SectionTitle = styled.h4`
  margin: 0 0 20px 0;
  color: ${token('color.text.brand', '#0052CC')};
  font-weight: 700;
  text-transform: uppercase;
  font-size: 14px;
`;

const Grid = styled.div<{ cols?: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.cols || 2}, 1fr);
  gap: 20px;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FieldWrapper = styled.div<{ span?: number }>`
  grid-column: span ${props => props.span || 1};
`;

const Label = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: ${token('color.text.subtle', '#6B778C')};
  margin-bottom: 5px;
`;

export default NoteEditor;
