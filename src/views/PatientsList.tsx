import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DynamicTable from "@atlaskit/dynamic-table";
import Button from "@atlaskit/button";
import { token } from "@atlaskit/tokens";
import styled from "styled-components";
import { api } from "../api";
import type { Patient } from "../types";

const PatientsList: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.listPatients();
      setPatients(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const rows = patients.map((p) => ({
    key: String(p.id),
    cells: [
      { key: "nombre", content: p.nombre },
      { key: "fecha_nac", content: p.fecha_nacimiento || "" },
      { key: "telefono", content: p.telefono || "" },
      {
        key: "actions",
        content: (
          <Button appearance="subtle" onClick={() => navigate(`/patient/${p.id}`)}>
            Abrir
          </Button>
        ),
      },
    ],
  }));

  return (
    <Container>
      <Header>
        <Title>Pacientes</Title>
        <div>
          <Button appearance="primary" onClick={() => navigate(`/patient/new`)}>
            Nuevo Paciente
          </Button>
        </div>
      </Header>

      <TableWrapper>
        <DynamicTable
          head={{ cells: [
            { key: 'nombre', content: 'Nombre' },
            { key: 'fecha_nac', content: 'F-nac' },
            { key: 'telefono', content: 'Teléfono' },
            { key: 'actions', content: 'Acciones' }
          ]}}
          rows={rows}
          rowsPerPage={10}
          defaultPage={1}
          isLoading={loading}
          emptyView={<div>No hay pacientes.</div>}
        />
      </TableWrapper>
    </Container>
  );
};

const Container = styled.div`
  display:flex; flex-direction:column; gap:20px;
`;
const Header = styled.div`
  display:flex; justify-content:space-between; align-items:center;
`;
const Title = styled.h2`
  margin:0; color: ${token('color.text', '#172B4D')};
`;
const TableWrapper = styled.div`
  background:white; border:1px solid ${token('color.border','#DFE1E6')}; padding:8px;
`;

export default PatientsList;
