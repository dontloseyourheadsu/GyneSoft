import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import DynamicTable from "@atlaskit/dynamic-table";
import Button, { ButtonGroup } from "@atlaskit/button";
import { token } from "@atlaskit/tokens";
import styled from "styled-components";

interface PatientNote {
  id: number;
  name: string;
  date: string;
}

const NotesList = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<PatientNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const result = await invoke<PatientNote[]>("get_all_notes");
      setNotes(result);
    } catch (err) {
      console.error("Failed to load notes", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: number) => {
    if (window.confirm("¿Está seguro de eliminar esta nota?")) {
      try {
        await invoke("delete_note", { id });
        loadNotes();
      } catch (err) {
        console.error("Failed to delete note", err);
      }
    }
  };

  const head = {
    cells: [
      { key: "id", content: "ID", isSortable: true, width: 10 },
      { key: "name", content: "Nombre de la Paciente", isSortable: true },
      { key: "date", content: "Fecha", isSortable: true },
      { key: "actions", content: "Acciones", width: 20 },
    ],
  };

  const rows = notes.map((note) => ({
    
    key: note.id.toString(),
    cells: [
      { key: "id", content: note.id },
      { key: "name", content: note.name },
      {
        key: "date",
        content: Number.isNaN(new Date(note.date).getTime())
          ? note.date
          : new Date(note.date).toLocaleString("es-MX", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }),
      },
      {
        key: "actions",
        content: (
          <ButtonGroup>
            <Button
              onClick={() => navigate(`/edit?id=${note.id}`)}
              appearance="subtle"
            >
              Editar
            </Button>
            <Button
              onClick={() => deleteNote(note.id)}
              appearance="subtle"
            >
              Eliminar
            </Button>
          </ButtonGroup>
        ),
      },
    ],
  }));

  return (
    <Container>
      <Header>
        <Title>Registro de Pacientes</Title>
        <Button
          appearance="primary"
          onClick={() => navigate("/edit")}
        >
          Nueva Nota
        </Button>
      </Header>

      <TableWrapper>
        <DynamicTable
          head={head}
          rows={rows}
          rowsPerPage={10}
          defaultPage={1}
          isLoading={loading}
          emptyView={<div>No hay registros encontrados.</div>}
        />
      </TableWrapper>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  margin: 0;
  color: ${token('color.text', '#172B4D')};
`;

const TableWrapper = styled.div`
  background: white;
  border: 1px solid ${token('color.border', '#DFE1E6')};
`;

export default NotesList;
