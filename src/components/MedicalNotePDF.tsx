import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import type { MedicalNote, Patient } from '../types';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica' },
  header: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#000', paddingBottom: 10 },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  subtitle: { fontSize: 12, textAlign: 'center', color: '#666' },
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

export const MedicalNotePDF: React.FC<Props> = ({ patient, note }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>NOTA MÉDICA</Text>
        <Text style={styles.subtitle}>GyneSoft - Sistema de Gestión Clínica</Text>
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
        <Text style={{ textAlign: 'center', marginTop: 10, fontWeight: 'bold' }}>{note.firma}</Text>
        <Text style={{ textAlign: 'center', color: '#666' }}>{note.especialidad}</Text>
        <Text style={{ textAlign: 'center', color: '#666' }}>Ced. Prof: {note.cedula_prof} | Ced. Esp: {note.cedula_especialidad}</Text>
      </View>
    </Page>
  </Document>
);
