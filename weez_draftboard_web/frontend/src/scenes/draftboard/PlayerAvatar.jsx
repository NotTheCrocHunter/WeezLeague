import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import { Avatar } from "@mui/material";

function PlayerAvatarGridItemContainer({sleeper_id}) {

return (
<Grid
            item
            xs={4}
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "flex-end",
              marginRight: "2px"
            }}
            sm
            container
          >
            <Avatar
              src={`https://sleepercdn.com/content/nfl/players/${sleeper_id}.jpg`}
              alt={`${first_name} ${last_name}`}
              variant="rounded"
              sx={{
                width: "40px",
                height: "40px",
                marginBottom: "2px",
                marginRight: "2px",
              }}
            />
          </Grid>   
);  
}

export default PlayerAvatarGridItemContainer;
        