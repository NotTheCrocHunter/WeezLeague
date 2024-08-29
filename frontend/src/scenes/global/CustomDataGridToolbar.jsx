import React from 'react';
import { GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import { tokens } from "../../theme";
import { useTheme} from "@mui/material";
function CustomDataGridToolbar() {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
  return (
    <GridToolbarContainer
    
    sx={{
        backgroundColor: colors.grey[300],
       
    }}
    >
      <GridToolbarExport sx={{"& .MuiDataGrid-cell":  {color: colors.primary[900],} }}/>
    </GridToolbarContainer>
  );
}

export default CustomDataGridToolbar; 
