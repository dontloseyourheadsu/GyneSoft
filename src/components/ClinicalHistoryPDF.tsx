import React, { useEffect, useState } from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import type { ClinicalHistory, Patient } from '../types';
import { api } from '../api';

const styles = StyleSheet.create({
  page: { padding: 40, paddingBottom: 70, fontSize: 9, fontFamily: 'Helvetica', color: '#1a1a1a', lineHeight: 1.4 },
  header: { marginBottom: 20, borderBottom: '1.5pt solid #0052CC', paddingBottom: 10, flexDirection: 'row', alignItems: 'center' },
  logo: { width: 60, height: 60, marginRight: 15, objectFit: 'contain' },
  headerText: { flex: 1 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#0052CC', marginBottom: 2 },
  subtitle: { fontSize: 11, color: '#444' },
  
  section: { marginBottom: 15 },
  sectionSmallGap: { marginBottom: 10 },
  sectionHeaderBlock: { marginBottom: 8 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', backgroundColor: '#0052CC', color: '#fff', padding: 4, marginBottom: 8, borderRadius: 2 },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: '100%' },
  gridRow: { flexDirection: 'row', marginBottom: 6 },
  gridItem: { width: '33%', marginBottom: 8, paddingRight: 10, minHeight: 26 },
  emptyCell: { width: '33%', paddingRight: 10 },
  label: { fontSize: 8, fontWeight: 'bold', color: '#6B778C', marginBottom: 2, textTransform: 'uppercase', lineHeight: 1.2 },
  value: { fontSize: 10, color: '#172B4D', lineHeight: 1.3 },
  
  textAreaContainer: { marginTop: 4, marginBottom: 8, padding: 8, backgroundColor: '#fafbfc', border: '0.5pt solid #DFE1E6', borderRadius: 4 },
  textArea: { fontSize: 9, color: '#172B4D', lineHeight: 1.3 },
  
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTop: '0.5pt solid #DFE1E6', paddingTop: 10, textAlign: 'center', fontSize: 8, color: '#6B778C' }
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

export const ClinicalHistoryPDF: React.FC<Props> = ({ patient, history }) => {
  const [config, setConfig] = useState<Record<string, string>>({});

  useEffect(() => {
    api.getConfig().then(setConfig).catch(console.error);
  }, []);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          {(config.logo_data || config.logo_path) && <Image src={config.logo_data || config.logo_path} style={styles.logo} />}
          <View style={styles.headerText}>
            <Text style={styles.title}>{config.clinic_name || 'GYNESOFT'}</Text>
            <Text style={styles.subtitle}>HISTORIA CLÍNICA - {config.doctor_name || ''}</Text>
            <Text style={styles.subtitle}>{config.doctor_specialty || ''}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. DATOS DE IDENTIFICACIÓN</Text>
          <View style={styles.grid}>
            <InfoField label="Nombre" value={patient?.nombre} />
            <InfoField label="Fecha" value={history.fecha} />
            <InfoField label="Edad" value={patient?.edad} />
            <InfoField label="Sexo" value={patient?.sexo} />
            <InfoField label="Nacimiento" value={patient?.fecha_nacimiento} />
            <InfoField label="Edo. Civil" value={patient?.estado_civil} />
            <InfoField label="Escolaridad" value={patient?.escolaridad} />
            <InfoField label="Ocupación" value={patient?.ocupacion} />
            <InfoField label="Teléfono" value={patient?.telefono} />
          </View>
          <View style={{ marginTop: 5 }}>
            <Text style={styles.label}>Dirección</Text>
            <Text style={styles.value}>{patient?.direccion || '---'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. ANTECEDENTES HEREDOFAMILIARES</Text>
          <View style={styles.grid}>
            <InfoField label="Diabetes" value={history.diabetes} />
            <InfoField label="Hipertensión" value={history.hipertension} />
            <InfoField label="Cáncer" value={history.cancer} />
            <View style={{ width: '100%' }}>
               <Text style={styles.label}>Otros Heredo.</Text>
               <Text style={styles.value}>{history.otros_heredo || 'Ninguno'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. PERSONALES NO PATOLÓGICOS</Text>
          <View style={styles.grid}>
            <InfoField label="Higiene" value={history.higiene_personal} />
            <InfoField label="Alimentación" value={history.calidad_alimentacion} />
            <InfoField label="Tabaquismo" value={history.tabaquismo} />
            <InfoField label="Alcoholismo" value={history.alcoholismo} />
            <InfoField label="Grupo RH" value={history.grupo_sanguineo_rh} />
            <View style={{ width: '100%' }}>
              <Text style={styles.label}>Otros</Text>
              <Text style={styles.value}>{history.otros_no_patologicos || '---'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. PERSONALES PATOLÓGICOS</Text>
          <View style={styles.grid}>
            <InfoField label="Alergias" value={history.alergias} />
            <InfoField label="Quirúrgicos" value={history.quirurgicos} />
            <InfoField label="Traumáticos" value={history.traumaticos} />
            <InfoField label="Transfusionales" value={history.transfusionales} />
            <InfoField label="Médicos" value={history.medicos} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. ANTECEDENTES GINECO-OBSTÉTRICOS</Text>
          <View style={styles.gridRow} wrap={false}>
            <InfoField label="Menarca" value={history.menarca} />
            <InfoField label="Telarca" value={history.telarca} />
            <InfoField label="Pubarca" value={history.pubarca} />
          </View>
          <View style={styles.gridRow} wrap={false}>
            <InfoField label="Ritmo" value={history.ritmo} />
            <InfoField label="Dismenorrea" value={history.dismenorrea} />
            <InfoField label="IVSA" value={history.ivsa} />
          </View>
          <View style={styles.gridRow} wrap={false}>
            <InfoField label="Parejas" value={history.numero_parejas} />
            <InfoField label="Método ACO" value={history.metodo_anticonceptivo} />
            <InfoField label="Gesta" value={history.gesta} />
          </View>
          <View style={styles.gridRow} wrap={false}>
            <InfoField label="Para" value={history.para} />
            <InfoField label="Cesáreas" value={history.cesareas} />
            <InfoField label="Abortos" value={history.abortos} />
          </View>
          <View style={styles.gridRow} wrap={false}>
            <InfoField label="Productos" value={history.productos} />
            <InfoField label="FUP" value={history.fup} />
            <InfoField label="DOC" value={history.doc} />
          </View>
          <View style={styles.gridRow} wrap={false}>
            <InfoField label="FUR" value={history.fur} />
            <InfoField label="FPP" value={history.fpp} />
            <View style={styles.emptyCell} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. SIGNOS VITALES</Text>
          <View style={styles.grid}>
            <InfoField label="Peso" value={history.peso ? `${history.peso} kg` : null} />
            <InfoField label="Talla" value={history.talla ? `${history.talla} cm` : null} />
            <InfoField label="IMC" value={history.imc} />
            <InfoField label="T/A" value={history.ta} />
            <InfoField label="F.C." value={history.fc} />
            <InfoField label="F.R." value={history.fr} />
            <InfoField label="Temp" value={history.temp ? `${history.temp} °C` : null} />
            <InfoField label="SO2" value={history.so2} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderBlock} wrap={false}>
            <Text style={styles.sectionTitle}>7. PADECIMIENTO ACTUAL</Text>
            <View style={styles.textAreaContainer}>
              <Text style={styles.textArea}>{history.padecimiento_actual || 'Sin observaciones.'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderBlock} wrap={false}>
            <Text style={styles.sectionTitle}>8. EXPLORACIÓN FÍSICA</Text>
            <View style={styles.textAreaContainer}>
              <Text style={styles.label}>Habitus Exterior</Text>
              <Text style={styles.textArea}>{history.habitus_exterior || '---'}</Text>
            </View>
          </View>
          <View style={styles.textAreaContainer}>
            <Text style={styles.label}>Cabeza</Text>
            <Text style={styles.textArea}>{history.cabeza || '---'}</Text>
          </View>
          <View style={styles.textAreaContainer}>
            <Text style={styles.label}>Tórax</Text>
            <Text style={styles.textArea}>{history.torax || '---'}</Text>
          </View>
          <View style={styles.textAreaContainer}>
            <Text style={styles.label}>Abdomen</Text>
            <Text style={styles.textArea}>{history.abdomen || '---'}</Text>
          </View>
          <View style={styles.textAreaContainer}>
            <Text style={styles.label}>Genitales</Text>
            <Text style={styles.textArea}>{history.genitales || '---'}</Text>
          </View>
          <View style={styles.textAreaContainer}>
            <Text style={styles.label}>Extremidades</Text>
            <Text style={styles.textArea}>{history.extremidades || '---'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderBlock} wrap={false}>
            <Text style={styles.sectionTitle}>9. CONCLUSIÓN Y TRATAMIENTO</Text>
            <View style={styles.sectionSmallGap}>
              <Text style={styles.label}>Estudios de Laboratorio y Gabinete</Text>
              <Text style={styles.value}>{history.estudios_lab || '---'}</Text>
            </View>
          </View>
          <View style={{ marginBottom: 10 }}>
            <Text style={styles.label}>Diagnóstico</Text>
            <Text style={styles.value}>{history.diagnostico || '---'}</Text>
          </View>
          <View style={{ marginBottom: 10 }}>
            <Text style={styles.label}>Tratamiento</Text>
            <Text style={styles.value}>{history.tratamiento || '---'}</Text>
          </View>
          <View>
            <Text style={styles.label}>Comentarios</Text>
            <View style={styles.textAreaContainer}>
              <Text style={styles.textArea}>{history.comentarios || '---'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>{config.clinic_address || 'Dirección de la Clínica'}</Text>
          <Text>Tel: {config.clinic_phone || 'Teléfono'}</Text>
        </View>
      </Page>
    </Document>
  );
};
