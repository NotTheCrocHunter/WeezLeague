import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";

function EmptyDraftCell({ playerData }) {
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
