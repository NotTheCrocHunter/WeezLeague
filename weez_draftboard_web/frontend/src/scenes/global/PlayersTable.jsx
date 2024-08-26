//vimport Header from "../../components/Header";
import DraftCell from "../draftboard/Draftboard";
import React, { useMemo, useEffect, useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";

function PlayersTable() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);
  const currentYear = new Date().getFullYear();
  const draftID = "1115707228444524544"

  useEffect(() => {
    // Fetch the data from your API endpoint
    fetch("http://localhost:8000/api/all_players")
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        console.log(data); // Log the data to ensure it's correct
        setData(data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const columns = [
    { field: "player_id", headerName: "ID" },
    {
      field: "full_name",
      headerName: "Player",
      cellClassName: "name-column--cell",
      width: 200,
      sortable: true
    },
   
    { field: "position", headerName: "Position" },
    { field: "team", headerName: "Team" },
    //{ field: "pts_ppr", headerName: "Points", sortable: true },
  ];

  return (
    <Box
      m="40px 0 0 0"
      height="75vh"
      sx={{
        "& .MuiDataGrid-root": {
          border: "none",
        },
        "& .MuiDataGrid-cell": {
          borderBottom: "none",
        },
        "& .name-column--cell": {
          color: colors.greenAccent[300],
        },
        "& .MuiDataGrid-columnHeaders": {
          backgroundColor: colors.blueAccent[700],
          borderBottom: "none",
        },
        "& .MuiDataGrid-virtualScroller": {
          backgroundColor: colors.primary[400],
        },
        "& .MuiDataGrid-footerContainer": {
          borderTop: "none",
          backgroundColor: colors.blueAccent[700],
        },
        "& .MuiCheckbox-root": {
          color: `${colors.greenAccent[200]} !important`,
        },
      }}
    >
      <DataGrid
        checkboxSelection
        rows={data}
        columns={columns}
        getRowId={(row) => row.player_id}
        
        initialState={{
          columns: {
            columnVisibilityModel: {
              // Hide columns for player ID, the other columns will remain visible
              player_id: true,
            },
          },
        }}
      />
    </Box>
  );
}

export default PlayersTable;
