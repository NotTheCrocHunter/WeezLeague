import React, { useEffect, useState } from 'react';

function App() {
  const [projections, setProjections] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/projections_ppr/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched data:', data);
            setProjections(data);
        })
        .catch(error => console.error('Error fetching projections:', error));
  }, []);

  return (
    <div className="App">
      <h1>Draftboard</h1>
      <p>Total projections: {projections.length}</p>
      <dl>
        {projections.map((projection, index) => (
          <div key={index}>
            <dt>
              {projection.full_name ? projection.full_name : `${projection.first_name} ${projection.last_name}`}
              {projection.fantasy_positions && ` - ${projection.fantasy_positions.join(', ')}`}
            </dt>
            {Object.keys(projection).map((field, idx) =>
              !['full_name', 'first_name', 'last_name', 'fantasy_positions'].includes(field) && (
                <dd key={idx}>{`${field}: ${projection[field]}`}</dd>
              )
            )}
          </div>
        ))}
      </dl>
    </div>
  );
}

export default App;
