import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Button from '@atlaskit/button';
import { api } from '../api';

const Configuration: React.FC = () => {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);
  const [localConfig, setLocalConfig] = useState<Record<string, string>>({});

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const data = await api.getConfig();
      setConfig(data);
      setLocalConfig(data);
    } catch (err) {
      console.error("Error loading config:", err);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit file size to ~2MB to avoid DB bloat
    if (file.size > 2 * 1024 * 1024) {
      window.alert("El archivo es demasiado grande. Use una imagen de menos de 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        // Save base64 directly to database
        await api.setConfig('logo_data', base64);
        console.log("Logo saved as base64 in database");
        await load();
      } catch (err) {
        window.alert('Error al guardar logo: ' + err);
      }
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    try {
      for (const key in localConfig) {
        // Don't overwrite the logo_data during text edits unless changed
        if (localConfig[key] !== config[key] && key !== 'logo_data') {
          await api.setConfig(key, localConfig[key]);
        }
      }
      setEditing(false);
      load();
    } catch (err) {
      window.alert('Error al guardar configuración: ' + err);
    }
  };

  const fields = [
    { key: 'clinic_name', label: 'Nombre de la Clínica' },
    { key: 'doctor_name', label: 'Nombre del Doctor(a)' },
    { key: 'doctor_specialty', label: 'Especialidad' },
    { key: 'cedula_prof', label: 'Cédula Profesional' },
    { key: 'cedula_esp', label: 'Cédula de Especialidad' },
  ];

  const currentLogo = config.logo_data || '/src-tauri/icons/logo.jpg';

  return (
    <Wrapper>
      <Header>
        <h2>Configuración Médica</h2>
        {!editing ? (
          <Button appearance="primary" onClick={() => setEditing(true)}>Editar Información</Button>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button appearance="subtle" onClick={() => { setEditing(false); setLocalConfig(config); }}>Cancelar</Button>
            <Button appearance="primary" onClick={save}>Guardar Cambios</Button>
          </div>
        )}
      </Header>

      <Content>
        <LogoSection>
          <h3>Logo de la Clínica</h3>
          <LogoContainer>
             <img 
               src={currentLogo} 
               alt="Logo" 
               style={{ width: '100px', height: '100px', objectFit: 'contain' }} 
             />
          </LogoContainer>
          <input 
            type="file" 
            id="logo-input" 
            hidden 
            accept="image/*" 
            onChange={handleLogoUpload} 
          />
          <Button 
            appearance="subtle" 
            style={{ marginTop: '12px' }} 
            onClick={() => document.getElementById('logo-input')?.click()}
          >
            Subir Logo
          </Button>
          <p style={{ fontSize: '11px', color: '#666', marginTop: '8px', textAlign: 'center' }}>
            Se recomienda una imagen JPG o PNG.
          </p>
        </LogoSection>

        <FormSection>
          {fields.map(f => (
            <Field key={f.key}>
              <Label>{f.label}</Label>
              {editing ? (
                <Input 
                  value={localConfig[f.key] || ''} 
                  onChange={e => setLocalConfig({ ...localConfig, [f.key]: e.target.value })} 
                />
              ) : (
                <DisplayValue>{config[f.key] || '---'}</DisplayValue>
              )}
            </Field>
          ))}
        </FormSection>
      </Content>
    </Wrapper>
  );
};

const Wrapper = styled.div`padding: 24px; max-width: 800px;`;
const Header = styled.div`display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;`;
const Content = styled.div`display: grid; grid-template-columns: 200px 1fr; gap: 40px; background: #fff; padding: 32px; border-radius: 8px; border: 1px solid #DFE1E6;`;
const LogoSection = styled.div`display: flex; flex-direction: column; align-items: center;`;
const LogoContainer = styled.div`width: 120px; height: 120px; border: 1px solid #DFE1E6; display: flex; align-items: center; justify-content: center; border-radius: 8px; background: #f9f9f9; overflow: hidden;`;
const FormSection = styled.div`display: flex; flex-direction: column; gap: 20px;`;
const Field = styled.div`display: flex; flex-direction: column; gap: 6px;`;
const Label = styled.label`font-size: 12px; font-weight: 600; color: #6B778C;`;
const DisplayValue = styled.div`font-size: 16px; color: #172B4D; padding: 4px 0; border-bottom: 1px solid transparent;`;
const Input = styled.input`padding: 8px; border: 1px solid #DFE1E6; border-radius: 4px; font-size: 14px;`;

export default Configuration;
