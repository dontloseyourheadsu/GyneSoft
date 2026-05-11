import React, { useEffect, useState } from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import type { MedicalNote, Patient } from '../types';
import { api } from '../api';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica' },
  header: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#172B4D', paddingBottom: 10, flexDirection: 'row', alignItems: 'center' },
  logo: { width: 50, height: 50, marginRight: 15, objectFit: 'contain' },
  headerText: { flex: 1 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#172B4D', marginBottom: 2 },
  subtitle: { fontSize: 12, color: '#666' },
  section: { marginBottom: 15 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', backgroundColor: '#f0f0f0', padding: 4, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: '100%' },
  gridItem: { width: '50%', marginBottom: 8, paddingRight: 15 },
  label: { fontSize: 8, fontWeight: 'bold', color: '#6B778C', marginBottom: 1, textTransform: 'uppercase' },
  value: { fontSize: 10, color: '#172B4D' },
  footer: { marginTop: 40, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
  signature: { marginTop: 20, textAlign: 'center', fontStyle: 'italic' }
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

  const logoSource = config.logo_data || '/src-tauri/icons/logo.jpg';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image src={logoSource} style={styles.logo} />
          <View style={styles.headerText}>
            <Text style={styles.title}>{config.clinic_name || 'GYNESOFT'}</Text>
            <Text style={styles.subtitle}>Nota Médica de Seguimiento</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATOS DEL PACIENTE</Text>
          <View style={styles.grid}>
            <InfoField label="Nombre" value={patient?.nombre} />
            <InfoField label="Fecha/Hora" value={note.fecha_hora?.replace('T', ' ')} />
          </View>
        </View>

        <View style={styles.section}>
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
          <Text style={{ fontSize: 10, lineHeight: 1.4, color: '#172B4D' }}>{note.notas || 'Sin contenido.'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DIAGNÓSTICO Y PLAN</Text>
          <View style={{ marginBottom: 10 }}>
            <Text style={styles.label}>Dx</Text>
            <Text style={styles.value}>{note.dx || '---'}</Text>
          </View>
          <View>
            <Text style={styles.label}>Plan</Text>
            <Text style={styles.value}>{note.plan || '---'}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.signature}>Atentamente,</Text>
          <Text style={{ textAlign: 'center', marginTop: 10, fontWeight: 'bold' }}>{config.doctor_name || note.firma}</Text>
          <Text style={{ textAlign: 'center', color: '#666' }}>{config.doctor_specialty || note.especialidad}</Text>
          <Text style={{ textAlign: 'center', color: '#666' }}>Ced. Prof: {config.cedula_prof || note.cedula_prof} | Ced. Esp: {config.cedula_esp || note.cedula_especialidad}</Text>
        </View>
      </Page>
    </Document>
  );
};
