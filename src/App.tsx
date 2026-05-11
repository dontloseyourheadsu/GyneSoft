import { Routes, Route, useNavigate } from "react-router-dom";
import { PageLayout, Content, Main } from "@atlaskit/page-layout";
import Button from "@atlaskit/button";
import { token } from "@atlaskit/tokens";
import styled from "styled-components";
import Home from "./views/Home";
import NotesList from "./views/NotesList";
import PatientsList from "./views/PatientsList";
import PatientDashboard from "./views/PatientDashboard";
import NoteEditor from "./views/NoteEditor";
import Colposcopy from "./views/Colposcopy";

const AppHeader = () => {
  const navigate = useNavigate();

  return (
    <HeaderContainer>
          <HeaderLeft>
        <BrandTitle>GyneSoft</BrandTitle>
        <NavGroup>
          <Button appearance="subtle" onClick={() => navigate("/")}>
            Inicio
          </Button>
          <Button appearance="subtle" onClick={() => navigate("/patients")}> 
            Pacientes
          </Button>
        </NavGroup>
      </HeaderLeft>
      <VersionText>Sistema clínico en español</VersionText>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 28px;
  height: 64px;
  background: linear-gradient(90deg, #ffffff 0%, #f8fafc 70%, #f4f7ff 100%);
  border-bottom: 1px solid ${token("color.border", "#DFE1E6")};
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const BrandTitle = styled.h2`
  margin: 0;
  color: ${token("color.text.brand", "#0052CC")};
  letter-spacing: 0.4px;
`;

const NavGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const VersionText = styled.span`
  color: ${token("color.text.subtle", "#6B778C")};
  font-size: 12px;
`;

const PageBody = styled.div`
  padding: 28px;
`;

function App() {
  return (
    <PageLayout>
      <Content>
        <Main>
          <AppHeader />
          <PageBody>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/notes" element={<NotesList />} />
              <Route path="/patients" element={<PatientsList />} />
              <Route path="/patient/:id" element={<PatientDashboard />} />
              <Route path="/patient/:id/colposcopy" element={<Colposcopy />} />
              <Route path="/edit" element={<NoteEditor />} />
            </Routes>
          </PageBody>
        </Main>
      </Content>
    </PageLayout>
  );
}

export default App;
