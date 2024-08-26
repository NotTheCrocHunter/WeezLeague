import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import Header from "../../components/Header";
import React, { useMemo, useEffect, useState } from 'react';


const KeeperValueTable = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    // Fetch the data from your API endpoint
    fetch('http://localhost:8000/api/keeper_values/')
      .then(response => response.json())
      .then(data => setData(data));
  }, []); 

  const columns = [
    { field: "sleeper_id", headerName: "ID" },
    { field: "owner_name", headerName: "Owner Name" },
    {
      field: "player_display",
      headerName: "Player",
      flex: 1,
      cellClassName: "name-column--cell",
    },    
    {
      field: currentYear + "_keeper_value",
      headerName: currentYear + " Keeper Value",
      sortable: true,
      sortComparator: (v1, v2, cellParams1, cellParams2, order) => {
        const parseValue = (value) => {
          const parsed = parseInt(value, 10);
          return isNaN(parsed) ? (order === 'asc' ? Infinity : -Infinity) : parsed;
        };

        const parsedV1 = parseValue(v1);
        const parsedV2 = parseValue(v2);

        return parsedV1 - parsedV2;
      }
    },
    {
      field: currentYear + "_keeper_round",
      headerName: currentYear + " Keeper Round",
      sortable: true,
      sortComparator: (v1, v2, cellParams1, cellParams2, order) => {
        const parseValue = (value) => {
          const parsed = parseInt(value, 10);
          return isNaN(parsed) ? (order === 'asc' ? Infinity : -Infinity) : parsed;
        };

        const parsedV1 = parseValue(v1);
        const parsedV2 = parseValue(v2);

        return parsedV1 - parsedV2;
      }
    },
    {
      field: currentYear + "_adp_ppr_round",
      headerName: currentYear + " ADP Round",
      sortable: true,
      sortComparator: (v1, v2, cellParams1, cellParams2, order) => {
        const parseValue = (value) => {
          const parsed = parseInt(value, 10);
          return isNaN(parsed) ? (order === 'asc' ? Infinity : -Infinity) : parsed;
        };

        const parsedV1 = parseValue(v1);
        const parsedV2 = parseValue(v2);

        return parsedV1 - parsedV2;
      }
    },
    {
      field: "keeper_note", 
      headerName: "Keeper Note",
      flex: 1,
    },
  ];

  return (
    <Box m="20px">
      <Header title="KEEPERS" subtitle="Keeper Value Table" />
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
          getRowId={(row) => row.sleeper_id}
          initialState={{
            columns: {
              columnVisibilityModel: {
                // Hide columns for player ID, the other columns will remain visible
                sleeper_id: false,
              },
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default KeeperValueTable;