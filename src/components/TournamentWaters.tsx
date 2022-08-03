import React, { useState } from "react";

interface Player {
  name: string
  id: number;
  eliminated: boolean;
}

interface Match {
  playerA: Player;
  playerB: Player;
  winner: number;
}

const TournamentWaters = () => {
  const [entrants, setEntrants] = useState<Player[]>([]);

  return(
    <div>
      <h1>Bracket</h1>
    </div>
  )
}

export default TournamentWaters;