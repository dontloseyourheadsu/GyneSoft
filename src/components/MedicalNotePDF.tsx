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
  row: { flexDirection: 'row', marginBottom: 5 },
  label: { width: 140, fontWeight: 'bold', color: '#333' },
  value: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: { width: '50%', marginBottom: 5, flexDirection: 'row' },
  gridLabel: { width: 80, fontWeight: 'bold' },
  footer: { marginTop: 40, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
  signature: { marginTop: 20, textAlign: 'center', fontStyle: 'italic' }
});

interface Props {
  patient: Patient | null;
  note: MedicalNote;
}

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
            <View style={styles.gridItem}><Text style={styles.gridLabel}>Nombre:</Text><Text>{patient?.nombre}</Text></View>
            <View style={styles.gridItem}><Text style={styles.gridLabel}>Fecha/Hora:</Text><Text>{note.fecha_hora?.replace('T', ' ')}</Text></View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SIGNOS VITALES</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}><Text style={styles.gridLabel}>Peso:</Text><Text>{note.peso} kg</Text></View>
            <View style={styles.gridItem}><Text style={styles.gridLabel}>Talla:</Text><Text>{note.talla} cm</Text></View>
            <View style={styles.gridItem}><Text style={styles.gridLabel}>T/A:</Text><Text>{note.ta}</Text></View>
            <View style={styles.gridItem}><Text style={styles.gridLabel}>F.C.:</Text><Text>{note.fc} lpm</Text></View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTAS DE EVOLUCIÓN</Text>
          <Text style={styles.value}>{note.notas || 'Sin contenido.'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DIAGNÓSTICO Y PLAN</Text>
          <View style={styles.row}><Text style={styles.label}>Dx:</Text><Text style={styles.value}>{note.dx}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Plan:</Text><Text style={styles.value}>{note.plan}</Text></View>
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
