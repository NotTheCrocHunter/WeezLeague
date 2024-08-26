import React, { useEffect, useState } from 'react';

const DraftboardComponent = () => {
  const [playerPool, setPlayerPool] = useState([]);
  const [draftedPlayers, setDraftedPlayers] = useState([]);
  const [draftboardPlayers, setDraftboardPlayers] = useState([]);

  // Function to fetch player pool once on component mount
  useEffect(() => {
    const fetchPlayerPool = async () => {
      try {
        const response = await fetch('http://localhost:3000/draftboard');
        const data = await response.json();
        setPlayerPool(data);
      } catch (error) {
        console.error('Error fetching player pool:', error);
      }
    };

    fetchPlayerPool();
  }, []); // Empty dependency array ensures this runs only once

  // Function to fetch drafted players every 5 seconds
  useEffect(() => {
    const fetchDraftedPlayers = async () => {
      try {
        const response = await fetch('https://sleeper.com/picks');
        const data = await response.json();
        setDraftedPlayers(data);
      } catch (error) {
        console.error('Error fetching drafted players:', error);
      }
    };

    fetchDraftedPlayers();
    const interval = setInterval(fetchDraftedPlayers, 5000); // Fetch every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []); // Empty dependency array ensures the interval is set only once

  // Function to transform draftedPlayers data
  const transformData = (draftedPlayers) => {
    // Your transformation logic here
    return draftedPlayers.map(player => ({
      ...player,
      transformed: true, // Example transformation
    }));
  };

  // Update draftboardPlayers whenever draftedPlayers changes
  useEffect(() => {
    const transformedData = transformData(draftedPlayers);
    setDraftboardPlayers(transformedData);
  }, [draftedPlayers]); // Dependency array ensures this runs whenever draftedPlayers updates

  return (
    <div>
      <h1>Draftboard</h1>
      <div>
        <h2>Player Pool</h2>
        <pre>{JSON.stringify(playerPool, null, 2)}</pre>
      </div>
      <div>
        <h2>Draftboard Players</h2>
        <pre>{JSON.stringify(draftboardPlayers, null, 2)}</pre>
      </div>
    </div>
  );
};

export default DraftboardComponent;
