import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import {
  Box,
  useTheme,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Drawer,
  // SwipeableDrawer,
  // Divider,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DraftCell from "./DraftCell";
import { tokens } from "../../theme";
import PlayersTable from "../global/PlayersTable";
import CustomDataGridToolbar from "../global/CustomDataGridToolbar"; 

function Draftboard() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [playerPool, setPlayerPool] = useState([]);
  const [draftedIds, setDraftedIds] = useState([]);
  const [draftedPlayers, setDraftedPlayers] = useState([]);
  const [liveDraftboard, setLiveDraftboard] = useState([]);
  const [draftboardPlayers, setDraftboardPlayers] = useState([]);
  const [sortOption, setSortOption] = useState("ecr"); // State for sorting option
  const [draftStatus, setDraftStatus] = useState(null);
  // Initialize state with the value from localStorage or default if not set
  const [draftId, setDraftId] = useState(() => {
    return localStorage.getItem("draftId") || "";
  });

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };
  //console.log("sort option: ", sortOption);

  const connectLiveDraft = () => {
    const id = prompt("Please enter or paste your Sleeper Draft ID.");
    if (id) {
      //console.log("Sleeper Draft ID:", id);
      setDraftId(id); // Set the draft ID state
      localStorage.setItem("draftId", id); // Store the draft ID in localStorage
    }
  };

  // function to initialize the liveDraftboard when the site first loads
  useEffect(() => {
    const emptyDraftboard = Array(playerPool.length)
      .fill(null)
      .map((_, index) => ({
        pick_no: index + 1,
        round: Math.ceil((index + 1) / 12), // Example calculation assuming 12 picks per round
        draft_slot: (index % 12) + 1, // Draft slot within the round
        direction: Math.ceil((index + 1) / 12) % 2 === 0 ? "left" : "right", // Alternating direction
        player: null, // No player assigned yet
      }));

    setLiveDraftboard(emptyDraftboard);
    //console.log("Empty Draftboard: ", emptyDraftboard);
  }, [playerPool]);

  // Function to fetch player pool once on component mount
  useEffect(() => {
    // Fetch the data from your API endpoint to set the PlayerPool
    const fetchPlayerPool = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/draftboard_player_pool/"
        );
        const data = await response.json();
        setPlayerPool(data);
      } catch (error) {
        console.error("Error fetching player pool: ", error);
        setPlayerPool(liveDraftboard);
      }
    };

    fetchPlayerPool();
  }, [liveDraftboard]); // Empty dependecy array ensures this runs only once

  const fetchDraftStatus = async (id) => {
    try {
      //console.log(`Fetching draft status for draft ID: ${id}`);
      const response = await fetch(`https://api.sleeper.app/v1/draft/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      //console.log("Draft status data:", data);
      setDraftStatus(data.status);
      return data.status;
    } catch (error) {
      console.error("Error fetching draft status:", error);
      return null;
    }
  };

  const fetchDraftedPlayers = async (id) => {
    try {
      const response = await fetch(
        `https://api.sleeper.app/v1/draft/${id}/picks`
      );
      const data = await response.json();
      setDraftedPlayers(data);
      //console.log("Drafted Players", data);
      const ids = data.map((draft) => draft.player_id);
      setDraftedIds(ids);
    } catch (error) {
      console.error("Error fetching drafted players:", error);
    }
  };

  // Function to fetch drafted players every 3 seconds from sleeper's API for draftpicks
  useEffect(() => {
    if (!draftId) return; // Only run if draftId is set

    const handleIntervals = () => {
      let intervalDuration;

      if (draftStatus === "drafting" || draftStatus === "paused") {
          intervalDuration = 1000; // 1 second
      } else if (draftStatus === "pre_draft") {
          intervalDuration = 10000; // 10 seconds
      } else if (draftStatus === "complete") {
          clearInterval(statusInterval);
          clearInterval(playersInterval);
          return;
      }

      if (draftStatus !== "complete") {
          clearInterval(statusInterval);
          clearInterval(playersInterval);

          statusInterval = setInterval(() => fetchDraftStatus(draftId), intervalDuration);
          playersInterval = setInterval(() => fetchDraftedPlayers(draftId), 3000);
      }
  };

  let statusInterval = setInterval(() => fetchDraftStatus(draftId), 1000); // Start by checking status every 1 second
  let playersInterval = setInterval(() => fetchDraftedPlayers(draftId), 3000); // Fetch drafted players every 3 seconds initially

  fetchDraftStatus(draftId); // Initial fetch to set draftStatus

  handleIntervals(); // Adjust intervals based on initial status

  return () => {
      clearInterval(statusInterval);
      clearInterval(playersInterval);
  };
}, [draftId, draftStatus]); // Dependency on draftId ensures the effect runs when draftId is set

  // Hook/Function to insert the drafted players in the playerPool properly.
  useEffect(() => {
    if (playerPool.length > 0 && liveDraftboard.length > 0) {
      // Step 1: get empty draftboard
      let sortedData = [...liveDraftboard];
      console.log("sortedData:", sortedData);
      console.log("liveDraftboard:", liveDraftboard);
      // Step 2: Remove all drafted players from the original data
      const filteredData = playerPool.filter(
        (player) =>
          !draftedPlayers.some((draft) => draft.player_id === player.sleeper_id)
      );
      console.log("filtered_data:", filteredData);

      // Sort data based on the selected sort option
      //let sortedData;
      if (sortOption === "live") {
        sortedData = liveDraftboard; // Live sort
      } else if (sortOption === "adp") {
        sortedData = filteredData
          .slice()
          .sort((a, b) => a.adp_sort - b.adp_sort); // ADP sort
      } else if (sortOption === "ecr") {
        sortedData = filteredData
          .slice()
          .sort((a, b) => a.ovr_rank_ecr - b.ovr_rank_ecr); // ECR sort
      }
      console.log("sorted:", sortedData);

      // Step 3: Insert each drafted player at their new position based on pick_no
      draftedPlayers.forEach((draft) => {
        const draftedPlayer = playerPool.find(
          (player) => player.sleeper_id === draft.player_id
        );
        if (draftedPlayer) {
          sortedData.splice(draft.pick_no - 1, 0, draftedPlayer); // assuming pick_no is 1-based
        }
      });
      console.log("sorted with drafted:", sortedData);

      // Transform the data
      const transformedData = transformData(sortedData);
      console.log("transformedData: ", transformData);

      // use the Transformed Data and send to the draftboardPlayers
      setDraftboardPlayers(transformedData);
    }
  }, [draftedPlayers, playerPool, sortOption, liveDraftboard]);

  const transformData = (data) => {
    const transformed = [];
    console.log("transformData Start", data);
    for (let i = 0; i < data.length; i += 12) {
      const round = Math.ceil((i + 1) / 12);
      const roundData = { round_id: round };
      const roundPlayers = data.slice(i, i + 12);

      if (round % 2 === 0) {
        roundPlayers.reverse(); // Reverse the order for even rounds
      }

      roundPlayers.forEach((player, j) => {
        roundData[`team${j + 1}`] = player // && player.player
          ? { ...player, round, draft_position: j + 1 }
          : null;
      });

      transformed.push(roundData);
    }
    //console.log("transformed", transformed);
    return transformed;
  };

  const teams = Array.from({ length: 12 }, (_, i) => `team${i + 1}`);

  const columns = [
    {
      field: "round_id",
      headerName: "Rd.",
      width: 10,
      minWidth: 35,
      headerAlign: "center",
      align: "center",
      justifyContent: "center",
      renderCell: (params) => (
        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          {params.value}
        </Box>
      ),
    },
    ...teams.map((team, index) => ({
      field: team,
      headerName: `Team ${index + 1}`,
      width: 150,
      minWidth: 120,
      flex: 1,
      headerAlign: "center",
      renderCell: (params) => (
        <DraftCell playerData={params.row[team]} draftedIds={draftedIds} />
      ),
    })),
  ];
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };
  return (
    <Box
      m="20px"
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
      <Header title="Weezy Draftboard" subtitle="The Original WeezDraftboard" />
      <Box m={2}>
        {" "}
        {/* Radio Buttons */}
        <RadioGroup
          row
          value={sortOption}
          onChange={handleSortChange}
          color="secondary"
        >
          <FormControlLabel
            value="live"
            control={<Radio color="secondary" />}
            label="Live"
          />
          <FormControlLabel
            value="adp"
            control={<Radio color="secondary" />}
            label="ADP"
          />
          <FormControlLabel
            value="ecr"
            control={<Radio color="secondary" />}
            label="ECR"
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={connectLiveDraft}
          >
            Connect Live Draft
          </Button>
        </RadioGroup>
      </Box>
      <DataGrid
        rows={draftboardPlayers}
        columns={columns}
        getRowId={(row) => row.round_id}
        getRowHeight={() => "auto"}
        rowSelection="false"
        slots={{ toolbar: CustomDataGridToolbar, }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        sx={{
          "& .MuiDataGrid-cell": {
            padding: "1px", // Adjust padding if needed
            alignItems: "center",
          },
          "& .MuiDataGrid-row": {
            minHeight: "100px", // Minimum height to fit image and text
          },
        }}
      />
      <Button onClick={toggleDrawer(true)}>Open drawer</Button>
      <Drawer open={open} onClose={toggleDrawer(false)} anchor="bottom">
        <PlayersTable />
        <PlayersTable />
      </Drawer>
    </Box>
  );
}

export default Draftboard;
