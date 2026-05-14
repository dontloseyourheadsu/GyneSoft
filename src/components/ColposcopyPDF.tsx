import React, { useEffect, useState } from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Svg, Line, Path, Circle, Rect, Ellipse } from '@react-pdf/renderer';
import type { ColposcopyEntry, Patient } from '../types';
import { api } from '../api';

const styles = StyleSheet.create({
  page: { padding: 40, paddingBottom: 70, fontSize: 9, fontFamily: 'Helvetica', color: '#1a1a1a', lineHeight: 1.2 },
  
  // Header
  headerContainer: { flexDirection: 'row', marginBottom: 20, borderBottom: '1.5pt solid #0052CC', paddingBottom: 10 },
  logoBox: { width: 70, height: 70, marginRight: 15 },
  headerInfo: { flex: 1, justifyContent: 'center' },
  clinicName: { fontSize: 16, fontWeight: 'bold', color: '#0052CC', marginBottom: 2 },
  doctorName: { fontSize: 12, fontWeight: 'bold', marginBottom: 2 },
  specialty: { fontSize: 8, color: '#444' },

  // Study Title Box
  titleSection: { backgroundColor: '#f4f5f7', padding: 8, marginBottom: 15, borderRadius: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleText: { fontSize: 11, fontWeight: 'bold', color: '#172B4D' },
  dateText: { fontSize: 9, fontWeight: 'bold' },

  // Info Sections
  section: { marginBottom: 12 },
  sectionHeader: { backgroundColor: '#0052CC', color: '#fff', padding: 4, fontWeight: 'bold', fontSize: 9, marginBottom: 6, borderRadius: 2 },
  
  row: { flexDirection: 'row', marginBottom: 8 },
  field: { flexDirection: 'column', marginBottom: 6, minHeight: 28 },
  label: { fontWeight: 'bold', fontSize: 7, color: '#6B778C', textTransform: 'uppercase', marginBottom: 2, lineHeight: 1.2 },
  value: { fontSize: 9, color: '#172B4D', lineHeight: 1.35 },
  
  // Grid layout for G-O data
  goGrid: { flexDirection: 'row', flexWrap: 'wrap', border: '0.5pt solid #DFE1E6', borderRadius: 4, padding: 4 },
  goItem: { width: '25%', padding: 4, minHeight: 30 },

  // Findings
  twoColRow: { flexDirection: 'row', marginBottom: 10 },
  halfCol: { width: '50%', paddingRight: 12 },
  
  // Text areas
  textArea: { padding: 8, backgroundColor: '#fafbfc', border: '0.5pt solid #DFE1E6', borderRadius: 4, minHeight: 35 },
  
  // Visual Section
  visualSection: { marginTop: 10 },
  visualGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  diagramBox: { width: '50%', marginBottom: 15, padding: 5, alignItems: 'center' },
  visualBox: { width: '33.33%', marginBottom: 15, padding: 5, alignItems: 'center' },
  visualImgContainer: { position: 'relative', width: '100%', height: 110, border: '0.5pt solid #DFE1E6', borderRadius: 4, overflow: 'hidden', backgroundColor: '#fff' },
  visualImg: { width: '100%', height: '100%', objectFit: 'contain' },
  visualLabel: { fontSize: 7, marginTop: 4, color: '#6B778C', fontWeight: 'bold', textAlign: 'center' },

  // Signature
  signatureArea: { marginTop: 30, flexDirection: 'row', justifyContent: 'flex-end' },
  signatureBox: { width: 200, alignItems: 'center', borderTop: '1pt solid #172B4D', paddingTop: 8 },
  
  // Footer
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTop: '0.5pt solid #DFE1E6', paddingTop: 10, textAlign: 'center', fontSize: 7, color: '#6B778C' }
});

interface Props {
  patient: Patient | null;
  study: ColposcopyEntry;
}

const InfoField = ({ label, value, flex = 1 }: { label: string, value?: string | number | null, flex?: number }) => (
  <View style={[styles.field, { flex }]}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || '---'}</Text>
  </View>
);

const GenitalesDiagram = () => (
  <Svg viewBox="0 0 220 310" style={{ width: '100%', height: '100%' }}>
    <Path d="M110,20 C178,20 185,80 185,135 C185,198 153,255 110,278 C67,255 35,198 35,135 C35,80 42,20 110,20 Z" fill="white" stroke="#1a1a6e" strokeWidth={2.2} />
    <Path d="M110,80 C148,80 162,115 162,155 C162,195 140,228 110,240 C80,228 58,195 58,155 C58,115 72,80 110,80 Z" fill="none" stroke="#1a1a6e" strokeWidth={2} />
    <Path d="M110,102 C138,102 148,130 148,162 C148,192 132,216 110,226 C88,216 72,192 72,162 C72,130 82,102 110,102 Z" fill="none" stroke="#1a1a6e" strokeWidth={1.8} />
    <Path d="M110,160 C118,160 122,171 122,181 C122,192 117,200 110,204 C103,200 98,192 98,181 C98,171 102,160 110,160 Z" fill="none" stroke="#1a1a6e" strokeWidth={1.5} />
    <Path d="M103,80 A7,7 0 0 1 117,80 Z" fill="#1a1a6e" />
    <Path d="M96,83 A14,11 0 0 1 124,83" fill="none" stroke="#1a1a6e" strokeWidth={1.8} />
    <Circle cx={110} cy={278} r={11} fill="white" stroke="#1a1a6e" strokeWidth={1.8} />
  </Svg>
);

const CuadrantesDiagram = () => (
  <Svg viewBox="0 0 300 240" style={{ width: '100%', height: '100%' }}>
    <Rect x={10} y={10} width={280} height={220} fill="white" stroke="#111" strokeWidth={2} />
    <Line x1={10} y1={10} x2={290} y2={230} stroke="#111" strokeWidth={1.5} />
    <Line x1={290} y1={10} x2={10} y2={230} stroke="#111" strokeWidth={1.5} />
    <Ellipse cx={150} cy={120} rx={128} ry={98} fill="white" stroke="#111" strokeWidth={2} />
    <Ellipse cx={150} cy={120} rx={68} ry={44} fill="white" stroke="#111" strokeWidth={1.8} />
    <Line x1={100} y1={120} x2={200} y2={120} stroke="#111" strokeWidth={1.5} />
  </Svg>
);

const DiagramWithMarks = ({ type, marksJson, label }: { type: 'genitales' | 'cuadrantes', marksJson?: string | null, label: string }) => {
  let marks: any[] = [];
  try { if (marksJson) marks = JSON.parse(marksJson); } catch(e) {}

  return (
    <View style={styles.diagramBox} wrap={false}>
      <View style={styles.visualImgContainer}>
        {type === 'genitales' ? <GenitalesDiagram /> : <CuadrantesDiagram />}
        {marks.length > 0 && (
          <Svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} viewBox="0 0 1 1">
            {marks.map((m: any, i: number) => (
              <React.Fragment key={i}>
                <Line x1={m.x - 0.03} y1={m.y - 0.03} x2={m.x + 0.03} y2={m.y + 0.03} stroke="#0052CC" strokeWidth={0.015} />
                <Line x1={m.x + 0.03} y1={m.y - 0.03} x2={m.x - 0.03} y2={m.y + 0.03} stroke="#0052CC" strokeWidth={0.015} />
              </React.Fragment>
            ))}
          </Svg>
        )}
      </View>
      <Text style={styles.visualLabel}>{label}</Text>
    </View>
  );
};

export const ColposcopyPDF: React.FC<Props> = ({ patient, study }) => {
  const [config, setConfig] = useState<Record<string, string>>({});

  useEffect(() => {
    api.getConfig().then(setConfig).catch(console.error);
  }, []);

  const captures = study.captures || [];

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.headerContainer}>
          {(config.logo_data || config.logo_path) && <Image src={config.logo_data || config.logo_path} style={styles.logoBox} />}
          <View style={styles.headerInfo}>
            <Text style={styles.clinicName}>{config.clinic_name || 'GYNESOFT'}</Text>
            <Text style={styles.doctorName}>{config.doctor_name || 'Dr. Médico Especialista'}</Text>
            <Text style={styles.specialty}>{config.doctor_specialty || 'Ginecología y Obstetricia'}</Text>
            <Text style={styles.specialty}>Ced. Prof: {config.cedula_prof} | Ced. Esp: {config.cedula_esp}</Text>
          </View>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.titleText}>REPORTE DE COLPOSCOPIA</Text>
          <Text style={styles.dateText}>FECHA: {study.fecha_hora?.split('T')[0]}</Text>
        </View>

        {/* Patient Info */}
        <View style={styles.section}>
          <View style={styles.row}>
            <InfoField label="Nombre de la Paciente" value={patient?.nombre} flex={3} />
            <InfoField label="Edad" value={patient?.edad ? `${patient.edad} Años` : ''} />
            <InfoField label="Referida por" value={study.envio} />
          </View>
        </View>

        {/* GO Data */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ANTECEDENTES GINECO-OBSTÉTRICOS</Text>
          <View style={styles.goGrid}>
            <View style={styles.goItem}><InfoField label="Menarca" value={study.menarca} /></View>
            <View style={styles.goItem}><InfoField label="Ritmo" value={study.ritmo} /></View>
            <View style={styles.goItem}><InfoField label="MPF" value={study.mpf} /></View>
            <View style={styles.goItem}><InfoField label="IVSA" value={study.ivsa} /></View>
            <View style={styles.goItem}><InfoField label="Gestas" value={study.gestas} /></View>
            <View style={styles.goItem}><InfoField label="Partos" value={study.partos} /></View>
            <View style={styles.goItem}><InfoField label="Abortos" value={study.abortos} /></View>
            <View style={styles.goItem}><InfoField label="Cesáreas" value={study.cesareas} /></View>
            <View style={styles.goItem}><InfoField label="FUM" value={study.fum} /></View>
            <View style={styles.goItem}><InfoField label="Último PAP" value={study.ultimo_pap} /></View>
          </View>
        </View>

        {/* Findings */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>HALLAZGOS COLPOSCÓPICOS</Text>
          <View style={styles.twoColRow}>
            <View style={styles.halfCol}><InfoField label="Vulva y Vagina" value={study.vulva_vagina} /></View>
            <View style={styles.halfCol}><InfoField label="Tipo de Colposcopia" value={study.colposcopia_tipo} /></View>
          </View>
          <View style={styles.twoColRow}>
            <View style={styles.halfCol}><InfoField label="Cérvix" value={study.cervix} /></View>
            <View style={styles.halfCol}><InfoField label="Zona de Transformación" value={study.zona_transformacion} /></View>
          </View>
          <View style={styles.twoColRow}>
            <View style={styles.halfCol}><InfoField label="Superficie" value={study.superficie} /></View>
            <View style={styles.halfCol}><InfoField label="Bordes" value={study.bordes} /></View>
          </View>
          <View style={styles.twoColRow}>
            <View style={styles.halfCol}><InfoField label="Epitelio Acetoblanco" value={study.epitelio_acetoblanco} /></View>
            <View style={styles.halfCol}><InfoField label="Prueba de Schiller" value={study.prueba_schiller} /></View>
          </View>
        </View>

        {/* Observations */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>OBSERVACIONES ESPECÍFICAS</Text>
          <View style={styles.twoColRow}>
            <View style={styles.halfCol}><InfoField label="Patrón Vascular Velloso" value={study.patron_vascular_velloso} /></View>
            <View style={styles.halfCol}><InfoField label="Vasos Atípicos" value={study.vasos_atipicos} /></View>
          </View>
          <View style={styles.twoColRow}>
            <View style={styles.halfCol}><InfoField label="Puntilleo" value={study.puntilleo} /></View>
            <View style={styles.halfCol}><InfoField label="Mosaico" value={study.mosaico} /></View>
          </View>
        </View>

        {/* Conclusion */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionHeader}>DIAGNÓSTICO Y PLAN</Text>
          <InfoField label="Diagnóstico Colposcópico" value={study.diagnostico_colposcopico} />
          <View style={{height: 8}} />
          <InfoField label="Otras Observaciones" value={study.otras_observaciones} />
          <View style={{height: 8}} />
          <InfoField label="Plan de Tratamiento" value={study.plan_tratamiento} />
        </View>

        {/* Visual Support */}
        <View style={styles.visualSection} wrap={false}>
          <Text style={styles.sectionHeader}>APOYO VISUAL</Text>
          <View style={styles.visualGrid}>
            <DiagramWithMarks type="genitales" marksJson={study.diagram_genitales_marks} label="Genitales Externos" />
            <DiagramWithMarks type="cuadrantes" marksJson={study.diagram_cuadrantes_marks} label="Cuadrantes Cervicales" />
          </View>
        </View>

        {captures.length > 0 && (
          <View style={styles.visualSection} break>
            <Text style={styles.sectionHeader}>CAPTURAS</Text>
            <View style={styles.visualGrid}>
              {captures.map((cap, i) => (
                <View style={styles.visualBox} key={i} wrap={false}>
                  <View style={styles.visualImgContainer}>
                    <Image src={cap} style={styles.visualImg} />
                  </View>
                  <Text style={styles.visualLabel}>Captura {i + 1}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Signature Area */}
        <View style={styles.signatureArea} wrap={false}>
          <View style={styles.signatureBox}>
            <Text style={{fontWeight: 'bold'}}>{config.doctor_name || 'Dr. Médico Especialista'}</Text>
            <Text>Cédula Profesional: {config.cedula_prof}</Text>
            {config.cedula_esp && <Text>Cédula Especialidad: {config.cedula_esp}</Text>}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>{config.clinic_address || 'Dirección de la Clínica'}</Text>
          <Text>Tel: {config.clinic_phone || 'Teléfono'}</Text>
        </View>

      </Page>
    </Document>
  );
};

