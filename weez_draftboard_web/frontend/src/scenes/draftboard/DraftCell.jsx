import React, { useMemo, useEffect, useState } from "react";
import { Box, Typography, IconButton, useTheme, Avatar } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import ArrowDirectionIcon from "./ArrowDirectionIcon"; // Adjust path as necessary
import EmptyDraftCell from "./EmptyDraftCell";

const positionColors = {
  RB: "rgba(143, 242, 202, 0.8)",
  WR: "rgba(86, 201, 248, 0.8)",
  QB: "rgba(239, 116, 161, 0.8)",
  TE: "rgba(254, 174, 88, 0.8)",
  K: "rgba(182, 185, 255, 0.8)",
  DEF: "rgba(191, 117, 93, 0.8)",
  // Add more positions as needed
};

function DraftCell({ playerData, draftedIds }) {
  const [isSelected, setIsSelected] = useState(false);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  //console.log("DraftCell playerData:", playerData);

  // Handle cases where playerData is null (empty pick)
  //if (!playerData) {
  //  return <EmptyDraftCell playerData={playerData} />;
  //}

  const {
    sleeper_id = "",
    first_name = "",
    last_name = "",
    team = "",
    position = "",
    round,
    draft_position,
    ovr_rank_ecr,
    pos_rank = "",
    pos_tier = "",
    adp_sort,
  } = playerData || {};

  //const isDrafted = draftedIds.includes(sleeper_id);
  //const originalColor = positionColors[position] || colors.primary[500];
  //const bgColor = isDrafted
  const isDraftedOrSelected = draftedIds.includes(sleeper_id) || isSelected;
  const originalColor = positionColors[position] || colors.primary[500];
  const bgColor = isDraftedOrSelected ? colors.grey[900] : originalColor;
  const textColor = isDraftedOrSelected ? originalColor : colors.primary[500];

  const handleClick = () => {
    setIsSelected(!isSelected);
  };

  const playerName =
    first_name && last_name ? `${first_name.charAt(0)}. ${last_name}` : "";

  return (
    <Box
      className="cell-container"
      onClick={handleClick}
      sx={{
        backgroundColor: bgColor,
        borderRadius: "8px",
        m: "1px",
        flexGrow: "1",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
      }}
    >
      <Box
        className="cell drafted"
        sx={{
          minWidth: "75px",
          minHeight: "50px",
          borderRadius: "8px",
          m: "0px 1px 2px 1px",
          boxSizing: "border-box",
          position: "relative",
          display: "flex",
          padding: "2px 0px 0px 1px",
          justifyContent: "flex-start",
        }}
      >
        <Grid container spacing={0.5}>
          <Grid
            item
            xs={12}
            container
            spacing={0.5}
            alignItems="center"
            justifyContent="left"
          >
            <Grid item xs={8}>
              <Typography //player name
                noWrap
                sx={{
                  ...theme.typography.draftCellPlayerName,
                  color: textColor,
                }}
              >
                {playerName}
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography
                sx={{ ...theme.typography.draftCellDetails, color: textColor }}
              >
                {round}.{draft_position}
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <ArrowDirectionIcon
                round={round}
                draft_position={draft_position}
              />
            </Grid>
            <Grid item xs={12}>
              {" "}
              <Typography //position - teak
                sx={{ ...theme.typography.draftCellDetails, color: textColor }}
              >
                {`${pos_rank} - ${team} - Tier ${pos_tier} `}
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs={12} sx={{ marginRight: "2px" }}>
            <Typography
              className="draft-pick"
              sx={{
                fontSize: "11px",
                fontWeight: "bold",
                letterSpacing: "0.1px",
                color: textColor,
                opacity: "0.6",
              }}
            >
              ECR {ovr_rank_ecr} | ADP {adp_sort}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default React.memo(DraftCell);
