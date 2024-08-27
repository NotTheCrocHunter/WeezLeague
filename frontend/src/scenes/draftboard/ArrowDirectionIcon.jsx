// ArrowDirectionIcon.js
import React from "react";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import ArrowDownwardOutlinedIcon from "@mui/icons-material/ArrowDownwardOutlined";
import { useTheme } from "@mui/material";

const ArrowDirectionIcon = ({ round, draft_position }) => {
  const theme = useTheme();
  const colors = theme.palette;
  // Common styles for all arrows
  const arrowParams = {
    fontSize: ".5em",
    sx: { color: colors.grey[600] },
  };
  const isOdd = round % 2 !== 0;
  if ((draft_position === 1 && round !== 1 && !isOdd) || (draft_position === 12 && isOdd)) {
    return <ArrowDownwardOutlinedIcon {...arrowParams} />;
  }

  

  return isOdd ? (
    <ArrowForwardOutlinedIcon {...arrowParams} />
  ) : (
    <ArrowBackOutlinedIcon {...arrowParams} />
  );
};

export default ArrowDirectionIcon;
