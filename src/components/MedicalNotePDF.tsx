import React, { useEffect, useState } from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import type { MedicalNote, Patient } from '../types';
import { api } from '../api';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#1a1a1a', lineHeight: 1.4 },
  header: { marginBottom: 20, borderBottom: '1.5pt solid #0052CC', paddingBottom: 10, flexDirection: 'row', alignItems: 'center' },
  logo: { width: 60, height: 60, marginRight: 15, objectFit: 'contain' },
  headerText: { flex: 1 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#0052CC', marginBottom: 2 },
  subtitle: { fontSize: 12, color: '#444' },
  
  section: { marginBottom: 15 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', backgroundColor: '#0052CC', color: '#fff', padding: 4, marginBottom: 8, borderRadius: 2 },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: '100%' },
  gridItem: { width: '50%', marginBottom: 8, paddingRight: 15 },
  label: { fontSize: 8, fontWeight: 'bold', color: '#6B778C', marginBottom: 1, textTransform: 'uppercase' },
  value: { fontSize: 10, color: '#172B4D' },
  
  noteBox: { padding: 10, backgroundColor: '#fafbfc', border: '0.5pt solid #DFE1E6', borderRadius: 4, minHeight: 150 },
  noteText: { fontSize: 10, color: '#172B4D', lineHeight: 1.5 },
  
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTop: '0.5pt solid #DFE1E6', paddingTop: 10, textAlign: 'center', fontSize: 8, color: '#6B778C' },
  signatureArea: { marginTop: 30, alignItems: 'center' },
  signatureLine: { width: 200, borderTop: '1pt solid #172B4D', marginTop: 40, paddingTop: 5, alignItems: 'center' }
});

interface Props {
  patient: Patient | null;
  note: MedicalNote;
}

const InfoField = ({ label, value }: { label: string, value?: string | null }) => (
  <View style={styles.gridItem}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || '---'}</Text>
  </View>
);

export const MedicalNotePDF: React.FC<Props> = ({ patient, note }) => {
  const [config, setConfig] = useState<Record<string, string>>({});

  useEffect(() => {
    api.getConfig().then(setConfig).catch(console.error);
  }, []);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {(config.logo_data || config.logo_path) && <Image src={config.logo_data || config.logo_path} style={styles.logo} />}
          <View style={styles.headerText}>
            <Text style={styles.title}>{config.clinic_name || 'GYNESOFT'}</Text>
            <Text style={styles.subtitle}>NOTA MÉDICA DE SEGUIMIENTO</Text>
          </View>
        </View>

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>DATOS DEL PACIENTE</Text>
          <View style={styles.grid}>
            <InfoField label="Nombre" value={patient?.nombre} />
            <InfoField label="Fecha/Hora" value={note.fecha_hora?.replace('T', ' ')} />
          </View>
        </View>

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>SIGNOS VITALES</Text>
          <View style={styles.grid}>
            <InfoField label="Peso" value={note.peso ? `${note.peso} kg` : null} />
            <InfoField label="Talla" value={note.talla ? `${note.talla} cm` : null} />
            <InfoField label="T/A" value={note.ta} />
            <InfoField label="F.C." value={note.fc} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTAS DE EVOLUCIÓN</Text>
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>{note.notas || 'Sin contenido.'}</Text>
          </View>
        </View>

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>DIAGNÓSTICO Y PLAN</Text>
          <View style={{ marginBottom: 10 }}>
            <Text style={styles.label}>Diagnóstico (Dx)</Text>
            <Text style={styles.value}>{note.dx || '---'}</Text>
          </View>
          <View>
            <Text style={styles.label}>Plan de Tratamiento</Text>
            <Text style={styles.value}>{note.plan || '---'}</Text>
          </View>
        </View>

        <View style={styles.signatureArea} wrap={false}>
          <View style={styles.signatureLine}>
            <Text style={{ fontWeight: 'bold' }}>{config.doctor_name || note.firma}</Text>
            <Text style={{ fontSize: 9 }}>{config.doctor_specialty || note.especialidad}</Text>
            <Text style={{ fontSize: 8 }}>Ced. Prof: {config.cedula_prof || note.cedula_prof}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>{config.clinic_address || 'Dirección de la Clínica'}</Text>
          <Text>Tel: {config.clinic_phone || 'Teléfono'}</Text>
        </View>
      </Page>
    </Document>
  );
};
