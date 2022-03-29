/** @jsxRuntime classic */
/** @jsx jsx */

import { Suspense, useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { css, jsx } from "@emotion/react";
import { Physics, Debug } from '@react-three/cannon';
import { Loader } from '@react-three/drei';
// import { SettingInputs } from './SettingInputs.js';
// import { Leva, useControls, button, useCreateStore, folder, LevaPanel } from "leva";
// import { useControls, useStoreContext, useCreateStore, LevaPanel, LevaStoreProvider } from 'leva'

import {
  RobotVisual,
  Box,
  Bin,
  TennisBalls,
  Plane,
  PlanePhysics,
  CameraControl,
  Lights,
  Spline,
  Obstacle,
  PickitCamera,
} from "./viewer";

import "../styles/worldViewer.css";

export const WorldViewer = (props) => {
  
  // const [pointsTraj, setPointsTraj] = useState([[-0.993999, 0.56511, 0.163941], [-0.8,0.45,0.30], [-0.70, 0.1, 0.35]])
  // const [pointsTraj2, setPointsTraj2] = useState([[-0.70, 0.1, -0.35], [-0.8,0.3,-0.2], [-0.8,0.3,0.2], [-0.70, 0.1, 0.35]])
  const [pointsTraj, setPointsTraj] = useState([[0.993999, 0.56511, -0.163941], [0.8,0.45,-0.30], [0.70, 0.1, -0.35]])
  // const [pointsTraj2, setPointsTraj2] = useState([[0.70, 0.1, 0.35], [0.8,0.3,0.2], [0.8,0.3,-0.2], [0.70, 0.1, -0.35]])

  const handleUpdatePointsTraj = (points) => {
    // console.log(pointsTraj);
    setPointsTraj(points);
  }

  return (
    <div className="viewer-theme">

      {/* <SettingInputs /> */}

      {/* <Canvas camera={{ position: [-1.7, 0.8, 1.0], fov: 50}}> */}
      <Canvas camera={{ position: [1.7, 0.8, -1.0], fov: 50}}>
        {/* ----------- Utils ----------- */}
        
        <Lights />
        <CameraControl enable={props.cameraControlKey}/>
        <gridHelper args={[20, 10]} />
        {/* <axesHelper args={[0.3]} /> */}

        {/* <Suspense fallback={null}>
          <PickitCamera />
        </Suspense> */}

        {/* ------------- Planned Trajectory ------------- */}
        <Spline pColor={"#66ff01"} pPoints={pointsTraj} />
        {/* <Spline pColor={"#66ff01"} pPoints={pointsTraj2} /> */}
        {/* <PathLine linewidth={1} points={points_traj}/> */}
        {/* ---------------------------------------------- */}

        {/* ----------- Robot ----------- */}
        <Suspense fallback={null}>
            {/* https://codesandbox.io/s/r3f-character-interaction-voef7?file=/src/Character.jsx:671-678 */}
            {/* https://codesandbox.io/s/lesson16-model-and-drag-yu6wi */}
          {/* <RobotVisual robotJointState={props.robotJointState} clickedRobot={props.clickedRobot} setClickedRobot={props.setClickedRobot}/> */}
          <RobotVisual robotJointState={props.robotJointState} />
          
        </Suspense>
        {/* ----------------------------- */}

        {props.obsStateRef.current.enabled && 
          <Suspense fallback={null}>
            <Obstacle obsStateRef={props.obsStateRef} updateObstacleState={props.updateObstacleState}/>
          </Suspense>
        }

        <Physics>
        {/* <Debug color="black" scale={1.01}> */}
          {/* <Bin position={props.bin1State.position} color="#FF2444" opacity={0.7}/> */}
          {/* <Bin position={props.bin2State.position} color="#22AA44" opacity={0.7}/> */}
          <Bin index={1} position={props.binSettings1Ref.current.position} color="#f0fafa" opacity={0.7} handleUpdateBinState={props.handleUpdateBinState} />
          <Bin index={2} position={props.binSettings2Ref.current.position} color="#0099a9" opacity={0.7} handleUpdateBinState={props.handleUpdateBinState} />
          
        {/* </Debug> */}

          <TennisBalls pointsTraj={pointsTraj} updatePointsTraj={handleUpdatePointsTraj} worldSensed={props.worldSensed} />

          <PlanePhysics />

        </Physics>

      </Canvas>
      {/* <Loader/> */}


    </div>
  );
};
