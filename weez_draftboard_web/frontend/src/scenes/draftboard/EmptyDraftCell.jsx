import React, { useMemo, useEffect, useState } from "react";
import { Box, Typography, IconButton, useTheme, Avatar } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import ArrowDirectionIcon from "./ArrowDirectionIcon"; // Adjust path as necessary

function EmptyDraftCell({ playerData }) {
    const [isSelected, setIsSelected] = useState(false);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    
    //console.log('PlayerData EmptyDraft', playerData)
  return (
    <Box
      className="cell-container"
      sx={{
        backgroundColor: colors.grey[300],
        borderRadius: "8px",
        m: "1px",
        flexGrow: "1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50px",
      }}
    >
      <Typography
        sx={{
          ...theme.typography.draftCellPlayerName,
          color: colors.grey[700],
        }}
      >
        Empty Pick
      </Typography>
    </Box>
  );
};

export default EmptyDraftCell;
