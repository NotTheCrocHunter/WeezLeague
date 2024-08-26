import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";

const KeeperRoster = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);
  const [ filteredData, setFilteredData ] = useState([]);
  const { ownerId } = useParams();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    // Fetch the data from your API endpoint
    fetch('http://localhost:8000/api/keeper_values/')
      .then(response => response.json())
      .then(data => {
        setData(data);
        // Filter the data based on the owner_name
        const filtered = data.filter(item => item.owner_name === ownerId);
        setFilteredData(filtered);
        console.log('Filtered Data: ', filtered)
        console.log('data', data)
        console.log('owner', ownerId)
      });
  }, [ownerId]);

  useEffect(() => {
    document.title = 'WeezKeepers';
  }, []);

  const columns = [
    { field: "sleeper_id", headerName: "ID", flex: 0.5  },
    { field: "owner_name", headerName: "Owner Name" },
    {
      field: "player_display",
      headerName: "Player",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: currentYear + "_keeper_value",
      headerName: "Keeper Value",
      flex: 0.5, 
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
      headerName: "Keeper Round",
      flex: 0.5, 
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
      headerName: "Current ADP",
      sortable: true,
      flex: 0.5, 
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
      <Header title={ ownerId } subtitle= {currentYear + " Keeper Values" }/>
      <Box
        m="40px 0 0 0"
        height="80vh"
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
          rows={filteredData} 
          columns={columns} 
          getRowId={(row) => row.sleeper_id}
          components={{ Toolbar: GridToolbar }}
          initialState={{
            columns: {
              columnVisibilityModel: {
                // Hide columns for player ID, the other columns will remain visible
                sleeper_id: false,
                owner_name: false, 
                "2024_keeper_value": false,
              },
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default KeeperRoster;