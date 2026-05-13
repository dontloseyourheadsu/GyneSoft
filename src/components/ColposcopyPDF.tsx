import React, { useEffect, useState } from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import type { ColposcopyEntry, Patient } from '../types';
import { api } from '../api';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 8, fontFamily: 'Helvetica', color: '#1a1a1a' },
  
  // Header
  headerContainer: { alignItems: 'center', marginBottom: 15 },
  clinicName: { fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 },
  doctorName: { fontSize: 12, fontWeight: 'bold', marginBottom: 2 },
  specialty: { fontSize: 8, color: '#444', marginBottom: 1 },
  university: { fontSize: 7, color: '#666' },

  // Study Title Box
  titleBox: { border: '1pt solid #000', flexDirection: 'row', marginTop: 10 },
  titleText: { fontSize: 11, fontWeight: 'bold', padding: 4, flex: 1, borderRight: '1pt solid #000' },
  dateBox: { width: 140, padding: 4, flexDirection: 'row' },
  dateLabel: { fontWeight: 'bold', marginRight: 4 },

  // Info Sections
  section: { border: '1pt solid #000', borderTop: 0 },
  sectionHeader: { backgroundColor: '#f0f0f0', padding: 3, borderBottom: '1pt solid #000', fontWeight: 'bold' },
  row: { flexDirection: 'row', borderBottom: '0.5pt solid #eee' },
  cell: { padding: 4, flex: 1 },
  cellLabel: { fontWeight: 'bold', fontSize: 7, color: '#444', marginBottom: 1 },
  cellValue: { fontSize: 8.5 },
  
  // Grid layout for G-O data
  goGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  goItem: { width: '10%', padding: 3, borderRight: '0.5pt solid #ccc' },

  // Colposcopy findings table
  findingsRow: { flexDirection: 'row', borderBottom: '0.5pt solid #000' },
  findingsCell: { width: '33.33%', padding: 4, borderRight: '0.5pt solid #000' },
  
  // Observaciones area
  obsGrid: { flexDirection: 'row', flexWrap: 'wrap', borderBottom: '1pt solid #000' },
  obsItem: { width: '50%', padding: 4, borderRight: '0.5pt solid #ccc' },

  // Text areas
  textArea: { padding: 6, minHeight: 30, borderBottom: '1pt solid #000' },
  
  // Visual Section
  visualSection: { marginTop: 10 },
  visualTitle: { fontWeight: 'bold', marginBottom: 6, fontSize: 9 },
  visualGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  visualBox: { width: '31%', marginBottom: 10, alignItems: 'center' },
  visualImg: { width: '100%', height: 100, objectFit: 'contain', border: '0.5pt solid #eee' },
  visualLabel: { fontSize: 7, marginTop: 2, color: '#666' },

  // Signature
  signatureContainer: { marginTop: 20, width: 150 },
  signatureLine: { borderTop: '1pt solid #000', marginTop: 30, paddingTop: 4 },
  
  // Footer
  footer: { position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', fontSize: 7, color: '#666' }
});

interface Props {
  patient: Patient | null;
  study: ColposcopyEntry;
}

const DataRow = ({ label, value }: { label: string, value?: string | null }) => (
  <View style={styles.cell}>
    <Text style={styles.cellLabel}>{label}:</Text>
    <Text style={styles.cellValue}>{value || '---'}</Text>
  </View>
);

const GOField = ({ label, value }: { label: string, value?: string | null }) => (
  <View style={styles.goItem}>
    <Text style={styles.cellLabel}>{label}</Text>
    <Text style={styles.cellValue}>{value || '-'}</Text>
  </View>
);

export const ColposcopyPDF: React.FC<Props> = ({ patient, study }) => {
  const [config, setConfig] = useState<Record<string, string>>({});

  useEffect(() => {
    api.getConfig().then(setConfig).catch(console.error);
  }, []);

  // Recolectar todas las capturas (ahora soportamos hasta 10 si es necesario)
  const captures = [
    study.figura1_path,
    study.figura2_path,
    study.figura3_path,
    study.figura4_path,
    (study as any).figura5_path,
    (study as any).figura6_path,
    (study as any).figura7_path,
    (study as any).figura8_path,
    (study as any).figura9_path,
    (study as any).figura10_path,
  ].filter(Boolean) as string[];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.clinicName}>{config.clinic_name || 'ATENCION INTEGRAL A LA MUJER'}</Text>
          <Text style={styles.doctorName}>{config.doctor_name || 'Dr. Eric Alvarez Campos'}</Text>
          <Text style={styles.specialty}>GINECOLOGIA - OBSTETRICIA - COLPOSCOPIA</Text>
          <Text style={styles.specialty}>ULTRASONIDO - CIRUGIA GINECOLOGICA</Text>
          <Text style={styles.university}>BENEMERITA UNIVERSIDAD AUTONOMA DE PUEBLA</Text>
        </View>

        {/* Title Box */}
        <View style={styles.titleBox}>
          <Text style={styles.titleText}>ESTUDIO DE COLPOSCOPIA.</Text>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>FECHA ESTUDIO:</Text>
            <Text>{study.fecha_hora?.split('T')[0]}</Text>
          </View>
        </View>

        {/* Patient Data */}
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={{ flex: 2, padding: 4 }}>
              <Text style={styles.cellLabel}>PACIENTE:</Text>
              <Text style={styles.cellValue}>{patient?.nombre}</Text>
            </View>
            <View style={{ flex: 0.5, padding: 4, borderLeft: '1pt solid #000' }}>
              <Text style={styles.cellLabel}>EDAD:</Text>
              <Text style={styles.cellValue}>{patient?.edad} Años</Text>
            </View>
            <View style={{ flex: 1, padding: 4, borderLeft: '1pt solid #000' }}>
              <Text style={styles.cellLabel}>ENVIO:</Text>
              <Text style={styles.cellValue}>{study.envio || 'NINGUNO'}</Text>
            </View>
          </View>
        </View>

        {/* GO Data */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>DATOS GINECO-OBSTETRICOS:</Text>
          <View style={styles.goGrid}>
            <GOField label="MENARCA" value={study.menarca} />
            <GOField label="RITMO" value={study.ritmo} />
            <GOField label="MPF" value={study.mpf} />
            <GOField label="IVSA" value={study.ivsa} />
            <GOField label="G" value={study.gestas} />
            <GOField label="P" value={study.partos} />
            <GOField label="A" value={study.abortos} />
            <GOField label="C" value={study.cesareas} />
            <GOField label="FUM" value={study.fum} />
            <GOField label="ULT. PAP" value={study.ultimo_pap} />
          </View>
        </View>

        {/* Colposcopy Findings */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>DATOS COLPOSCOPICOS:</Text>
          <View style={styles.row}>
            <DataRow label="VULVA Y VAGINA" value={study.vulva_vagina} />
          </View>
          
          <View style={styles.findingsRow}>
            <View style={styles.findingsCell}><DataRow label="COLPOSCOPIA" value={study.colposcopia_tipo} /></View>
            <View style={styles.findingsCell}><DataRow label="CERVIX" value={study.cervix} /></View>
            <View style={{...styles.findingsCell, borderRight: 0}}><DataRow label="ZONA TRANSFORMACION" value={study.zona_transformacion} /></View>
          </View>

          <View style={styles.findingsRow}>
            <View style={styles.findingsCell}><DataRow label="SUPERFICIE" value={study.superficie} /></View>
            <View style={styles.findingsCell}><DataRow label="BORDES" value={study.bordes} /></View>
            <View style={{...styles.findingsCell, borderRight: 0}}><DataRow label="EPITELIO ACETOBLANCO" value={study.epitelio_acetoblanco} /></View>
          </View>

          <View style={styles.row}>
             <DataRow label="PRUEBA DE SHILLER" value={study.prueba_schiller} />
          </View>
        </View>

        {/* Observations */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>OBSERVACIONES:</Text>
          <View style={styles.obsGrid}>
            <View style={styles.obsItem}><DataRow label="PATRON VASCULAR VELLOSO" value={study.patron_vascular_velloso} /></View>
            <View style={styles.obsItem}><DataRow label="VASOS ATIPICOS" value={study.vasos_atipicos} /></View>
            <View style={styles.obsItem}><DataRow label="PUNTILLEO" value={study.puntilleo} /></View>
            <View style={styles.obsItem}><DataRow label="MOSAICO" value={study.mosaico} /></View>
          </View>
        </View>

        {/* Conclusion areas */}
        <View style={styles.section}>
           <Text style={styles.sectionHeader}>DIAGNOSTICO COLPOSCOPICO:</Text>
           <View style={styles.textArea}><Text>{study.diagnostico_colposcopico || 'SIN ALTERACIONES'}</Text></View>
        </View>

        <View style={styles.section}>
           <Text style={styles.sectionHeader}>OTRAS:</Text>
           <View style={styles.textArea}><Text>{study.otras_observaciones || 'NINGUNA'}</Text></View>
        </View>

        <View style={styles.section}>
           <Text style={styles.sectionHeader}>PLAN DE TRATAMIENTO:</Text>
           <View style={styles.textArea}><Text>{study.plan_tratamiento || '---'}</Text></View>
        </View>

        {/* Visual Support */}
        <View style={styles.visualSection}>
          <Text style={styles.visualTitle}>{'==>'} Diagramas de Apoyo y Capturas:</Text>
          <View style={styles.visualGrid}>
            {study.diagrama_genitales_path && (
               <View style={styles.visualBox}>
                 <Image src={study.diagrama_genitales_path} style={styles.visualImg} />
                 <Text style={styles.visualLabel}>Genitales Externos</Text>
               </View>
            )}
            {study.diagrama_cuadrantes_path && (
               <View style={styles.visualBox}>
                 <Image src={study.diagrama_cuadrantes_path} style={styles.visualImg} />
                 <Text style={styles.visualLabel}>Cuadrantes Cervicales</Text>
               </View>
            )}
            {captures.map((cap, i) => (
              <View style={styles.visualBox} key={i}>
                <Image src={cap} style={styles.visualImg} />
                <Text style={styles.visualLabel}>Captura {i+1}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Signature */}
        <View style={styles.signatureContainer}>
          <Text style={{fontWeight: 'bold'}}>ATENTAMENTE:</Text>
          <View style={styles.signatureLine}>
             <Text style={{fontWeight: 'bold'}}>{config.doctor_name || 'Dr. Eric Alvarez Campos'}</Text>
             <Text>Ced. Prof.: {config.cedula_prof}</Text>
             <Text>Ced. Esp.: {config.cedula_esp}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>{config.clinic_address || 'Av. Independencia No. 405, Col. Chapultepec, Puebla, Pue.'}</Text>
          <Text>Tel. {config.clinic_phone || '253 02 70 Cel. 044 22 22 38 50 56'}</Text>
        </View>

      </Page>
    </Document>
  );
};
