import React, { useEffect, useState } from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import type { ClinicalHistory, Patient } from '../types';
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
  gridItemHalf: { width: '50%', marginBottom: 6, paddingRight: 10 },
  label: { fontSize: 7.5, fontWeight: 'bold', color: '#6B778C', marginBottom: 1, textTransform: 'uppercase' },
  value: { fontSize: 9, color: '#172B4D' },
  textArea: { marginTop: 2, padding: 4, borderLeftWidth: 2, borderLeftColor: '#DFE1E6', fontSize: 9, lineHeight: 1.3 },
});

interface Props {
  patient: Patient | null;
  history: ClinicalHistory;
}

const InfoField = ({ label, value }: { label: string, value?: string | null }) => (
  <View style={styles.gridItem}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || '---'}</Text>
  </View>
);

const InfoFieldHalf = ({ label, value }: { label: string, value?: string | null }) => (
  <View style={styles.gridItemHalf}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || '---'}</Text>
  </View>
);

export const ClinicalHistoryPDF: React.FC<Props> = ({ patient, history }) => {
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
            <Text style={styles.subtitle}>{config.doctor_name || 'Expediente Clínico'}</Text>
            <Text style={styles.subtitle}>{config.doctor_specialty || ''}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. DATOS DE IDENTIFICACIÓN</Text>
          <View style={styles.grid}>
            <InfoField label="Nombre" value={patient?.nombre} />
            <InfoField label="Fecha de Registro" value={history.fecha} />
            <InfoField label="Edad" value={patient?.edad} />
            <InfoField label="Sexo" value={patient?.sexo} />
            <InfoField label="Fecha Nacimiento" value={patient?.fecha_nacimiento} />
            <InfoField label="Estado Civil" value={patient?.estado_civil} />
            <InfoField label="Escolaridad" value={patient?.escolaridad} />
            <InfoField label="Ocupación" value={patient?.ocupacion} />
            <InfoField label="Teléfono" value={patient?.telefono} />
            <View style={{ width: '100%' }}>
              <Text style={styles.label}>Dirección</Text>
              <Text style={styles.value}>{patient?.direccion || '---'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. ANTECEDENTES HEREDOFAMILIARES Y PERSONALES</Text>
          <View style={styles.grid}>
            <InfoField label="Diabetes" value={history.diabetes} />
            <InfoField label="Hipertensión" value={history.hipertension} />
            <InfoField label="Cáncer" value={history.cancer} />
            <InfoField label="Otros Heredofam." value={history.otros_heredo} />
            <InfoField label="Higiene Personal" value={history.higiene_personal} />
            <InfoField label="Alimentación" value={history.calidad_alimentacion} />
            <InfoField label="Tabaquismo" value={history.tabaquismo} />
            <InfoField label="Alcoholismo" value={history.alcoholismo} />
            <InfoField label="Grupo RH" value={history.grupo_sanguineo_rh} />
            <InfoField label="Alergias" value={history.alergias} />
            <InfoField label="Quirúrgicos" value={history.quirurgicos} />
            <InfoField label="Traumáticos" value={history.traumaticos} />
            <InfoField label="Médicos" value={history.medicos} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. ANTECEDENTES GINECO-OBSTÉTRICOS</Text>
          <View style={styles.grid}>
            <InfoField label="Menarca" value={history.menarca} />
            <InfoField label="Telarca" value={history.telarca} />
            <InfoField label="Pubarca" value={history.pubarca} />
            <InfoField label="Ritmo" value={history.ritmo} />
            <InfoField label="Dismenorrea" value={history.dismenorrea} />
            <InfoField label="IVSA" value={history.ivsa} />
            <InfoField label="Parejas" value={history.numero_parejas} />
            <InfoField label="Gesta" value={history.gesta} />
            <InfoField label="Para" value={history.para} />
            <InfoField label="Cesáreas" value={history.cesareas} />
            <InfoField label="Abortos" value={history.abortos} />
            <InfoField label="Método Anticonc." value={history.metodo_anticonceptivo} />
            <InfoField label="F.U.P." value={history.fup} />
            <InfoField label="D.O.C." value={history.doc} />
            <InfoField label="F.U.R." value={history.fur} />
            <InfoField label="F.P.P." value={history.fpp} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. EXPLORACIÓN FÍSICA Y SIGNOS VITALES</Text>
          <View style={styles.grid}>
            <InfoField label="Peso" value={history.peso ? `${history.peso} kg` : null} />
            <InfoField label="Talla" value={history.talla ? `${history.talla} cm` : null} />
            <InfoField label="IMC" value={history.imc} />
            <InfoField label="T/A" value={history.ta} />
            <InfoField label="F.C." value={history.fc} />
            <InfoField label="F.R." value={history.fr} />
            <InfoField label="Temp" value={history.temp ? `${history.temp} °C` : null} />
            <InfoField label="SO2" value={history.so2 ? `${history.so2} %` : null} />
          </View>
          <View style={{ marginTop: 6 }}>
            <Text style={styles.label}>Padecimiento Actual</Text>
            <Text style={styles.textArea}>{history.padecimiento_actual || 'Sin observaciones.'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. REVISIÓN POR SISTEMAS</Text>
          <View style={styles.grid}>
            <InfoField label="Habitus Exterior" value={history.habitus_exterior} />
            <InfoField label="Cabeza" value={history.cabeza} />
            <InfoField label="Tórax" value={history.torax} />
            <InfoField label="Abdomen" value={history.abdomen} />
            <InfoField label="Genitales" value={history.genitales} />
            <InfoField label="Extremidades" value={history.extremidades} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. CONCLUSIÓN MÉDICA</Text>
          <InfoFieldHalf label="Diagnóstico" value={history.diagnostico} />
          <InfoFieldHalf label="Tratamiento" value={history.tratamiento} />
          <View style={{ width: '100%', marginTop: 4 }}>
            <Text style={styles.label}>Comentarios</Text>
            <Text style={styles.textArea}>{history.comentarios || '---'}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
