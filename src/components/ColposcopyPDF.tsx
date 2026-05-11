import React, { useEffect, useState } from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import type { ColposcopyEntry, Patient } from '../types';
import { api } from '../api';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 9, fontFamily: 'Helvetica' },
  header: { marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#172B4D', paddingBottom: 10, flexDirection: 'row', alignItems: 'center' },
  logo: { width: 60, height: 60, marginRight: 15, objectFit: 'contain' },
  headerText: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 2, color: '#172B4D' },
  subtitle: { fontSize: 10, color: '#6B778C' },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', backgroundColor: '#f4f5f7', padding: 4, marginBottom: 6, color: '#172B4D' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: '100%' },
  gridItem: { width: '33%', marginBottom: 6, paddingRight: 10 },
  label: { fontSize: 7.5, fontWeight: 'bold', color: '#6B778C', marginBottom: 1, textTransform: 'uppercase' },
  value: { fontSize: 9, color: '#172B4D' },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  imageBox: { width: '48%', marginBottom: 10 },
  imageLabel: { fontSize: 8, textAlign: 'center', marginTop: 4, color: '#666' },
  photo: { width: '100%', height: 120, objectFit: 'contain', backgroundColor: '#f9f9f9', borderRadius: 4 },
  diagram: { width: '100%', height: 100, objectFit: 'contain' }
});

interface Props {
  patient: Patient | null;
  study: ColposcopyEntry;
}

const InfoField = ({ label, value }: { label: string, value?: string | null }) => (
  <View style={styles.gridItem}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || '---'}</Text>
  </View>
);

export const ColposcopyPDF: React.FC<Props> = ({ patient, study }) => {
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
            <Text style={styles.subtitle}>Reporte de Estudio Colposcópico</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. DATOS GENERALES</Text>
          <View style={styles.grid}>
            <InfoField label="Paciente" value={patient?.nombre} />
            <InfoField label="Edad" value={patient?.edad} />
            <InfoField label="Fecha Estudio" value={study.fecha_hora?.split('T')[0]} />
            <InfoField label="Envío" value={study.envio} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. DATOS GINECO-OBSTÉTRICOS</Text>
          <View style={styles.grid}>
            <InfoField label="Menarca" value={study.menarca} />
            <InfoField label="Ritmo" value={study.ritmo} />
            <InfoField label="MPF" value={study.mpf} />
            <InfoField label="IVSA" value={study.ivsa} />
            <InfoField label="G" value={study.gestas} />
            <InfoField label="P" value={study.partos} />
            <InfoField label="A" value={study.abortos} />
            <InfoField label="C" value={study.cesareas} />
            <InfoField label="FUM" value={study.fum} />
            <InfoField label="Último PAP" value={study.ultimo_pap} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. HALLAZGOS COLPOSCÓPICOS</Text>
          <View style={styles.grid}>
            <InfoField label="Vulva y Vagina" value={study.vulva_vagina} />
            <InfoField label="Colposcopia" value={study.colposcopia_tipo} />
            <InfoField label="Cérvix" value={study.cervix} />
            <InfoField label="Zona Transformación" value={study.zona_transformacion} />
            <InfoField label="Superficie" value={study.superficie} />
            <InfoField label="Bordes" value={study.bordes} />
            <InfoField label="Epit. Acetoblanco" value={study.epitelio_acetoblanco} />
            <InfoField label="Prueba Schiller" value={study.prueba_schiller} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. DIAGNÓSTICO Y PLAN</Text>
          <Text style={styles.label}>Diagnóstico Colposcópico</Text>
          <Text style={[styles.value, { marginBottom: 6 }]}>{study.diagnostico_colposcopico || '---'}</Text>
          <Text style={styles.label}>Tratamiento / Plan</Text>
          <Text style={styles.value}>{study.plan_tratamiento || '---'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. MATERIAL VISUAL</Text>
          <View style={styles.imageGrid}>
            <View style={styles.imageBox}>
               {/* Diagrama Genitales Placeholder */}
               <Text style={styles.imageLabel}>Diagrama Genitales</Text>
            </View>
            <View style={styles.imageBox}>
               {/* Diagrama Cuadrantes Placeholder */}
               <Text style={styles.imageLabel}>Diagrama Cuadrantes</Text>
            </View>
            <View style={styles.imageBox}>
               <Text style={styles.imageLabel}>Figura 1</Text>
            </View>
            <View style={styles.imageBox}>
               <Text style={styles.imageLabel}>Figura 2</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 20, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10, textAlign: 'center' }}>
          <Text style={{ fontWeight: 'bold' }}>{config.doctor_name}</Text>
          <Text style={{ color: '#666' }}>{config.doctor_specialty}</Text>
          <Text style={{ color: '#666' }}>Ced. Prof: {config.cedula_prof} | Ced. Esp: {config.cedula_esp}</Text>
        </View>
      </Page>
    </Document>
  );
};
