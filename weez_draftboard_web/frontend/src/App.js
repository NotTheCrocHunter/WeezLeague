import React, { useEffect, useState } from 'react';
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from './theme';
import { Routes, Route } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Dashboard from "./scenes/dashboard";
import Sidebar from "./scenes/global/Sidebar";
import KeeperValueTable, { KeeperRoster } from './scenes/keepers';
import Draftboard from './scenes/draftboard/Draftboard';
import PlayersTable from './scenes/players';

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const [ownerNames, setOwnerNames] = useState([]);

  useEffect(() => {
    document.title = 'WeezDraftboard';
  }, []);

  useEffect(() => {
    fetch('http://localhost:8000/api/owners')
      .then(response => response.json())
      .then(data => {
        setOwnerNames(data); // Assuming data is an object with owner names as values
        console.log('Owners: ', data)
      })
      .catch(error => {
        console.error('Error fetching owner names:', error);
      });
  }, []);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
        <Sidebar isSidebar={isSidebar} owners={ownerNames} />
          <main className='content'>
          <Topbar setIsSidebar={setIsSidebar} />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/keepers" element={<KeeperValueTable />} />
              <Route path="/owners/:ownerId" element={<KeeperRoster />} />
              <Route path="/draftboard" element={<Draftboard />} />
              <Route path="/players" element={<PlayersTable />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
 