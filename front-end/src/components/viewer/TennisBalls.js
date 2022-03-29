import React, { useState } from "react";
import { Ball } from "./Ball.js";

export function TennisBalls(props){
    let { pointsTraj, updatePointsTraj, worldSensed } = props;
    const [selectedBallPos, setSelectedBallPos] = useState([-0.75, 0.1, 0.35])

    const handleUpdateFinalPoint = (coord) => {
      // console.log(coord)
      setSelectedBallPos(coord);
      updatePointsTraj(pointsTraj.slice(0,-1).concat( coord ));
      // console.log(pointsTraj.slice(0,-1).concat( coord ));
    }
    
    return (
        <>
          <Ball position={[0.67, 0.53, -0.2]} updateSelectedBallPos={handleUpdateFinalPoint} worldSensed={worldSensed}/>
          <Ball position={[0.70, 0.33, -0.25]} updateSelectedBallPos={handleUpdateFinalPoint} worldSensed={worldSensed}/>
          <Ball position={[0.75, 0.53, -0.2]} updateSelectedBallPos={handleUpdateFinalPoint} worldSensed={worldSensed}/>
          <Ball position={[0.67, 0.33, -0.3]} updateSelectedBallPos={handleUpdateFinalPoint} worldSensed={worldSensed}/>
          <Ball position={[0.70, 0.53, -0.35]} updateSelectedBallPos={handleUpdateFinalPoint} worldSensed={worldSensed}/>
          <Ball position={[0.75, 0.33, -0.4]} updateSelectedBallPos={handleUpdateFinalPoint} worldSensed={worldSensed}/>
          <Ball position={[0.75, 0.33, -0.45]} updateSelectedBallPos={handleUpdateFinalPoint} worldSensed={worldSensed}/>
          <Ball position={[0.75, 0.23, -0.4]} updateSelectedBallPos={handleUpdateFinalPoint} worldSensed={worldSensed}/>
          <Ball position={[0.75, 0.13, -0.45]} updateSelectedBallPos={handleUpdateFinalPoint} worldSensed={worldSensed}/>
        </>
    )
}