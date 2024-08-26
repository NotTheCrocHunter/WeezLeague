import Header from "../../components/Header";
import PlayersTable from "../global/PlayersTable";
import React, { useMemo, useEffect, useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";

function Players() {
  
  return (
    <Box m="20px">
      <Header title="PLAYERS" subtitle="Players Table" />
      <PlayersTable />
    </Box>
  );
}

export default Players;
