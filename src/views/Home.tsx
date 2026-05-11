import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Button from "@atlaskit/button";
import { token } from "@atlaskit/tokens";
import { useEffect, useState } from "react";
import { api } from "../api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [logo, setLogo] = useState<string>('/src-tauri/icons/logo.jpg');

  useEffect(() => {
    api.getConfig().then((cfg: Record<string, string>) => {
      if (cfg.logo_data) setLogo(cfg.logo_data);
    }).catch(console.error);
  }, []);

  return (
    <Container>
      <img src={logo} alt="Logo" style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '20px' }} />
      <Hero>
        <Title>Bienvenido a GyneSoft</Title>
        <Subtitle>Sistema de Gestión Clínica y Visor de Colposcopia</Subtitle>
      </Hero>

      <Grid>
        <Card onClick={() => navigate("/patients")}>
          <IconWrapper>Pacientes</IconWrapper>
          <CardTitle>Gestión de Pacientes</CardTitle>
          <CardDescription>Cree y administre el historial clínico de sus pacientes.</CardDescription>
          <Button appearance="primary" shouldFitContainer>Entrar</Button>
        </Card>

        <Card onClick={() => navigate("/config")}>
          <IconWrapper>Configuración</IconWrapper>
          <CardTitle>Datos del Doctor</CardTitle>
          <CardDescription>Configure su información profesional, nombre de clínica y logo.</CardDescription>
          <Button appearance="subtle" shouldFitContainer>Configurar</Button>
        </Card>
      </Grid>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 60px;
  padding: 40px 0;
`;

const Hero = styled.div`
  text-align: center;
`;

const Title = styled.h1`
  font-size: 48px;
  margin: 0;
  color: ${token('color.text', '#172B4D')};
`;

const Subtitle = styled.p`
  font-size: 20px;
  color: ${token('color.text.subtle', '#6B778C')};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 350px);
  gap: 40px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    width: 100%;
    max-width: 420px;
  }
`;

const Card = styled.div`
  background: white;
  border: 1px solid ${token('color.border', '#DFE1E6')};
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
    border-color: ${token('color.border.bold', '#4C9AFF')};
  }
`;

const IconWrapper = styled.div`
  color: ${token('color.icon.brand', '#0052CC')};
  margin-bottom: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const CardTitle = styled.h3`
  font-size: 24px;
  margin: 0 0 10px 0;
`;

const CardDescription = styled.p`
  font-size: 14px;
  color: ${token('color.text.subtle', '#6B778C')};
  margin-bottom: 30px;
`;

export default Dashboard;
