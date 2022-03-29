import React, { useState, useEffect, useRef } from 'react';
import axios from "axios";
import Konva from "konva";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Fab, Action } from 'react-tiny-fab';
import 'react-tiny-fab/dist/styles.css';

import { FaBars, FaCode, FaPlay, FaStop, FaBullseye, FaEye } from 'react-icons/fa'; // https://react-icons.github.io/react-icons/
// import { BiHelpCircle } from "react-icons/bi";
import { IoMdHelp } from "react-icons/io";
// import { GrView } from "react-icons/gr";
import { css, jsx, Global } from "@emotion/react";

import { WorldViewer } from "../WorldViewer.js";
import { InputsPanel } from '../InputsPanel.js';
import { CodePanel } from "../CodePanel.js";
import { HelpModal } from "../HelpModal.js";

import '../../styles/controlComponent.css';
import '../../styles/inputsPanel.css';

const globalStyles = css`
  *, *::after, *::before {
    box-sizing: border-box;
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    font-smoothing: antialiased;
  }
`;

/* --------------------------------------------------------------------------------------------------- */
/* ---------------------------------------- Global variables ----------------------------------------- */
/* --------------------------------------------------------------------------------------------------- */

const craneRealWidth = 0.7;
const craneRealHeight = 1.3;

const cart_width = 100;

const trail_length = 100;

const SOLVER_INACTIVE = 0;
const SOLVER_WAIT = 1;
const SOLVER_ERROR = 2; // Transmission fail
const SOLVER_SUCCESS = 3;
const SOLVER_TIMEOUT = 4;
const SOLVER_INFEASIBLE = 5;
const SOLVER_FAIL = 6;

const lbx = 0;
const ubx = 0.5;
const lbh = 0.4;
const ubh = 1.1;

const v_offset = 0.0;

const A_start = [0.05,-1.1+v_offset];
const B_start = [0.44,-0.98+v_offset];

const C_start = [0.1442988204456094, -0.8+v_offset];
const D_start = [0.34089121887287027, -0.7284403669724768+v_offset];

const obs1_radius_start = 0.1;
const obs1_center_start = [ 0.2977064220183487,-0.7568807339449543+v_offset];

const solverLabel = {[SOLVER_INACTIVE]: "",
                     [SOLVER_WAIT]: "Solving",
                     [SOLVER_ERROR]: "Error",
                     [SOLVER_SUCCESS]: "Success",
                     [SOLVER_TIMEOUT]: "Timeout",
                     [SOLVER_INFEASIBLE]: "Infeasible",
                     [SOLVER_FAIL]: "Failed"};

const solverColor = {[SOLVER_INACTIVE]: "white",
                     [SOLVER_WAIT]: "gray", // #"#FFA500",
                     [SOLVER_ERROR]: "black",
                     [SOLVER_SUCCESS]: "green",
                     [SOLVER_TIMEOUT]: "red",
                     [SOLVER_INFEASIBLE]: "red",
                     [SOLVER_FAIL]: "red"};

                     
/* --------------------------------------------------------------------------------------------------------- */
/* --------------------------------------------- Main function --------------------------------------------- */
/* --------------------------------------------------------------------------------------------------------- */

const ControlPanel = () => {

  // Variables for enabling the camera control in the world viewer
    const cameraControlKey = "Control"; //CTRL:17, C:67, SHIFT:16, ALT:18, LWIN:91
    const [enableCameraControls, setEnableCameraControls] = useState(false);

  /* --------------------------------------------------------------------------------------- */
  /* -------------------------------- States for help modal -------------------------------- */
  /* --------------------------------------------------------------------------------------- */
    const [showHelpModal, setShowHelpModal] = useState(false);

  /* --------------------------------------------------------------------------------------- */
  /* ------------------------------- Functions for help modal ------------------------------ */
  /* --------------------------------------------------------------------------------------- */
    function handleChangeShowModal(show) {
      setShowHelpModal(show);
    }

  /* --------------------------------------------------------------------------------------- */
  /* ------------------------ States and references for inputs panel ----------------------- */
  /* --------------------------------------------------------------------------------------- */

    const [selectedRobot, setSelectedRobot] = useState("UR10");

    // useEffect(() => {
    //   console.log(selectedRobot);
    // }, [selectedRobot]);

    const [connectionSettings, setConnectionSettings] = useState({ip_address:"192.168.0.15", port:1000});
    const connectionSettingsRef = useRef({ip_address:"192.168.0.15", port:1000});

    // const [robotState, setRobotState] = useState({q1: 0, q2: -60, q3: 60, q4: -90, q5: -90, q6: 0})
    const [robotState, setRobotState] = useState({q: [0, -60, 60, -90, -90, 0]});
    const robotJointState = useRef({"q": robotState.q});

    // const [clicked, setClicked] = useState("world");

    const [taskSettings, setTaskSettings] = useState({type:"Bin picking", approach:"Optimal time", approach_distance: 0.05});
    const taskSettingsRef = useRef({type:"Bin picking", approach:"Optimal time", approach_distance: 0.05});

    const [ obsState, setObsState ] = useState({enabled: false, x: 0.75, y: 0, z: 0, height: 0.4, width: 0.05, depth: 0.3 });
    const obsStateRef = useRef({enabled: false, x: 0.75, y: 0, z: 0, height: 0.4, width: 0.05, depth: 0.3 });

    const [ jointPositionLimits, setJointPositionLimits ] = useState({enabled: true, lb: [-180, -180, -180, -180, -180, -180], ub: [180, 180, 180, 180, 180, 180]});
    const [ jointVelocityLimits, setJointVelocityLimits ] = useState({enabled: true, lb: [-30, -30, -30, -30, -30, -30], ub: [30, 30, 30, 30, 30, 30]});
    const [ jointAccelerationLimits, setJointAccelerationLimits ] = useState({enabled: true, lb: [-200, -200, -200, -200, -200, -200], ub: [200, 200, 200, 200, 200, 200]});
    const [ jointTorqueLimits, setJointTorqueLimits ] = useState({enabled: true, lb: [-330, -330, -150, -56, -56, -56], ub: [330, 330, 150, 56, 56, 56]});
    const jointPositionLimitsRef = useRef({enabled: jointPositionLimits.enabled, lb: jointPositionLimits.lb, ub: jointPositionLimits.ub});
    const jointVelocityLimitsRef = useRef({enabled: jointVelocityLimits.enabled, lb: jointVelocityLimits.lb, ub: jointVelocityLimits.ub});
    const jointAccelerationLimitsRef = useRef({enabled: jointAccelerationLimits.enabled, lb: jointAccelerationLimits.lb, ub: jointAccelerationLimits.ub});
    const jointTorqueLimitsRef = useRef({enabled: jointTorqueLimits.enabled, lb: jointTorqueLimits.lb, ub: jointTorqueLimits.ub});

  /* --------------------------------------------------------------------------------------- */
  /* ------------------------------ Functions for inputs panel ----------------------------- */
  /* --------------------------------------------------------------------------------------- */

    function updateConnectionSettings(ip_address, port) {
      connectionSettingsRef.current = {ip_address:ip_address, port:port};
      setConnectionSettings({ip_address:ip_address, port:port});
    }
    function handleConnection (ip_address, port) {
      // Using react-toastify
      toast.success("Connected to " + ip_address + ":" + port, {
        position: toast.POSITION.BOTTOM_RIGHT,
        theme: "dark",
        // delay: 1000, // 1 sec
        // icon: "🚀"
      });
    }

    // useEffect(() => {
    //   console.log(connectionSettings);
    // }, [connectionSettings]);

    
    function updateRobotState(value, joint) {

      if (arguments.length == 1) { // If only the first argument is passed to the function
        robotJointState.current.q = value;
        setRobotState({...robotState, q:robotJointState.current.q})
      } else if (arguments.length == 2) { // If two arguments are passed to the function
        // Set only one joint 
        robotJointState.current.q[joint] = value;
        setRobotState({...robotState, q:robotJointState.current.q})
        // console.log(robotState.q[2])
      }
    }

    function updateTaskSettings(property, value) {
      if (property == "type") {
        taskSettingsRef.current.type = value;
        setTaskSettings({...taskSettings, type:value});
      } else if (property == "approach") {
        taskSettingsRef.current.approach = value;
        setTaskSettings({...taskSettings, approach:value});
      } else if (property == "approach_distance") {
        taskSettingsRef.current.approach_distance = value;
        setTaskSettings({...taskSettings, approach_distance:value});
      }
    }

    function updateObstacleState(property, value) {

      if (property == "enabled") {
        obsStateRef.current.enabled = value;
        setObsState({...obsState, enabled:value});
      } else if (property == "x") {
        obsStateRef.current.x = value;
        setObsState({...obsState, x:value});
      } else if (property == "y") {
        obsStateRef.current.y = value;
        setObsState({...obsState, y:value});
      } else if (property == "z") {
        obsStateRef.current.z = value;
        setObsState({...obsState, z:value});
      } else if (property == "height") {
        obsStateRef.current.height = value;
        // obsStateRef.current.y = value/2; 
        setObsState({...obsState, height:value});
      } else if (property == "width") {
        obsStateRef.current.width = value;
        setObsState({...obsState, width:value});
      } else if (property == "depth") {
        obsStateRef.current.depth = value;
        setObsState({...obsState, depth:value});
      }

    }

    function updateJointPositionLimits(value, joint) {
      if (arguments.length == 1) {
        jointPositionLimitsRef.current.enabled = value;
        setJointPositionLimits({...jointPositionLimits, enabled: value});
      } else if (arguments.length == 2) {
        jointPositionLimitsRef.current.lb[joint] = value[0];
        jointPositionLimitsRef.current.ub[joint] = value[1];
        setJointPositionLimits({
          ...jointPositionLimits,
          lb: {...jointPositionLimits.lb, [joint]: value[0]}, 
          ub: {...jointPositionLimits.ub, [joint]: value[1]}, 
        });
        // console.log(jointPositionLimitsRef.current.lb[joint] + " - " + jointPositionLimitsRef.current.ub[joint]);
      }
    }

    function updateJointVelocityLimits(value, joint) {
      if (arguments.length == 1) {
        jointVelocityLimitsRef.current.enabled = value;
        setJointVelocityLimits({...jointVelocityLimits, enabled: value});
      } else if (arguments.length == 2) {
        jointVelocityLimitsRef.current.lb[joint] = value[0];
        jointVelocityLimitsRef.current.ub[joint] = value[1];
        setJointVelocityLimits({
          ...jointVelocityLimits,
          lb: {...jointVelocityLimits.lb, [joint]: value[0]}, 
          ub: {...jointVelocityLimits.ub, [joint]: value[1]}, 
        });
        // console.log(jointPositionLimitsRef.current.lb[joint] + " - " + jointPositionLimitsRef.current.ub[joint]);
      }
    }

    function updateJointAccelerationLimits(value, joint) {
      if (arguments.length == 1) {
        jointAccelerationLimitsRef.current.enabled = value;
        setJointAccelerationLimits({...jointAccelerationLimits, enabled: value});
      } else if (arguments.length == 2) {
        jointAccelerationLimitsRef.current.lb[joint] = value[0];
        jointAccelerationLimitsRef.current.ub[joint] = value[1];
        setJointAccelerationLimits({
          ...jointAccelerationLimits,
          lb: {...jointAccelerationLimits.lb, [joint]: value[0]}, 
          ub: {...jointAccelerationLimits.ub, [joint]: value[1]}, 
        });
        // console.log(jointPositionLimitsRef.current.lb[joint] + " - " + jointPositionLimitsRef.current.ub[joint]);
      }
    }

    function updateJointTorqueLimits(value, joint) {
      if (arguments.length == 1) {
        jointTorqueLimitsRef.current.enabled = value;
        setJointTorqueLimits({...jointTorqueLimits, enabled: value});
      } else if (arguments.length == 2) {
        jointTorqueLimitsRef.current.lb[joint] = value[0];
        jointTorqueLimitsRef.current.ub[joint] = value[1];
        setJointTorqueLimits({
          ...jointTorqueLimits,
          lb: {...jointTorqueLimits.lb, [joint]: value[0]}, 
          ub: {...jointTorqueLimits.ub, [joint]: value[1]}, 
        });
        // console.log(jointPositionLimitsRef.current.lb[joint] + " - " + jointPositionLimitsRef.current.ub[joint]);
      }
    }

    // useEffect(() => {
    //   console.log(jointVelocityLimits.lb[5] + " - " + jointVelocityLimits.ub[5]);
    //   // console.log(jointPositionLimits.enabled);
    // }, [jointVelocityLimits]);

    // useEffect(() => {
    //   console.log(jointTorqueLimits.lb[5] + " - " + jointTorqueLimits.ub[5]);
    //   // console.log(jointPositionLimits.enabled);
    // }, [jointTorqueLimits]);

    function checkRobotLimits() {
      robotJointState.current.q.forEach((e, idx) => {
        robotJointState.current.q[idx] = Math.min(Math.max(robotJointState.current.q[idx], -360), 360)
        // robotJointState.current.q[idx] = robotJointState.current.q[idx] > 360 ? 360 : robotJointState.current.q[idx] < -360 ? -360 : robotJointState.current.q[idx];
      })
      // robotJointState.current.q[0] = robotJointState.current.q[0] > 360 ? 360 : robotJointState.current.q[0] < -360 ? -360 : robotJointState.current.q[0];
      // robotJointState.current.q[1] = robotJointState.current.q[1] > 360 ? 360 : robotJointState.current.q[1] < -360 ? -360 : robotJointState.current.q[1];
      // robotJointState.current.q[2] = robotJointState.current.q[2] > 360 ? 360 : robotJointState.current.q[2] < -360 ? -360 : robotJointState.current.q[2];
      // robotJointState.current.q[3] = robotJointState.current.q[3] > 360 ? 360 : robotJointState.current.q[3] < -360 ? -360 : robotJointState.current.q[3];
      // robotJointState.current.q[4] = robotJointState.current.q[4] > 360 ? 360 : robotJointState.current.q[4] < -360 ? -360 : robotJointState.current.q[4];
      // robotJointState.current.q[5] = robotJointState.current.q[5] > 360 ? 360 : robotJointState.current.q[5] < -360 ? -360 : robotJointState.current.q[5];
    }

  /* --------------------------------------------------------------------------------------- */
  /* ---------------------------- States and references for bins --------------------------- */
  /* --------------------------------------------------------------------------------------- */
    const [ bin1, setBin1 ] = useState({position: [0.75, 0, -0.35], rotation: [0, 0, 0]});
    const [ bin2, setBin2 ] = useState({position: [0.75, 0, 0.35], rotation: [0, 0, 0]});
    const binSettings1Ref = useRef(bin1);
    const binSettings2Ref = useRef(bin2);

  /* --------------------------------------------------------------------------------------- */
  /* ---------------------------------- Functions for bins --------------------------------- */
  /* --------------------------------------------------------------------------------------- */

  function handleUpdateBinState(bin_index, property, value) {

    if (property == "x") {
      obsStateRef.current.x = value;
      setObsState({...obsState, x:value});
    } else if (property == "y") {
      obsStateRef.current.y = value;
      setObsState({...obsState, y:value});
    } else if (property == "z") {
      obsStateRef.current.z = value;
      setObsState({...obsState, z:value});
    } else if (property == "rot_x") {
      obsStateRef.current.height = value;
      // obsStateRef.current.y = value/2; 
      setObsState({...obsState, height:value});
    } else if (property == "rot_y") {
      obsStateRef.current.width = value;
      setObsState({...obsState, width:value});
    } else if (property == "rot_z") {
      obsStateRef.current.depth = value;
      setObsState({...obsState, depth:value});
    }

  }

  /* --------------------------------------------------------------------------------------- */
  /* ------------------------- States and references for deployment ------------------------ */
  /* --------------------------------------------------------------------------------------- */
    const [playState, setPlayState] = useState("stop");
    const playStateRef = useRef(playState);

  /* --------------------------------------------------------------------------------------- */
  /* ------------------------------- Functions for deployment ------------------------------ */
  /* --------------------------------------------------------------------------------------- */
    function handlePlayStopPressed () {
      if (playStateRef.current == "stop") { // If currently stopped

        // Change the button state to show the stop icon
        playStateRef.current = "play";
        setPlayState("play");

        // Execute the deployment method
        // test_move_robot();
        get_ocp_result();

      } else if (playStateRef.current == "play") { // If currently play

        // Change the button state to show the play icon
        playStateRef.current = "stop";
        setPlayState("stop");

      }
      
    }

  /* --------------------------------------------------------------------------------------- */
  /* ----------- States and references for communication with Python server ---------------- */
  /* --------------------------------------------------------------------------------------- */
    const currentOcpStateRef = useRef(true);
    const solvedOcpStateRef = useRef(false);

    const [ worldSensed, setWorldSensed ] = useState(false);

  /* --------------------------------------------------------------------------------------- */
  /* ------------------- Functions to communicate with Python server ----------------------- */
  /* --------------------------------------------------------------------------------------- */
    function isUptoDate () {
      return JSON.stringify(currentOcpStateRef.current) === JSON.stringify(solvedOcpStateRef.current);
    }

    function getOcpState () {

      return {
        selectedRobot : selectedRobot,
        robotJointState : robotJointState.current,
        taskSettings: taskSettingsRef.current,
        obstacleSettings: obsStateRef.current,
        jointPositionLimits: jointPositionLimitsRef.current,
        jointVelocityLimits: jointVelocityLimitsRef.current,
        jointAccelerationLimits: jointAccelerationLimitsRef.current,
        jointTorqueLimits: jointTorqueLimitsRef.current,
        binSettings1: binSettings1Ref.current,
        binSettings2: binSettings2Ref.current,
      };
    }

    async function get_sense_world() {
        console.log('Sensing');

        axios.post("get_sense_world", { } )
        .then(res => {
  
          let result = res.data;

          // -----------------------------------------------
          // Add logic to check that the data is ok
          // and to set the world (balls, bins) accordingly
          // -----------------------------------------------

          console.log(result)

          setWorldSensed(true);
          
          // We can also use a toast that changes state (loading -> success)
          toast.success("The world has been sensed", {
            position: toast.POSITION.BOTTOM_RIGHT,
            theme: "dark",
          });
  
        })
        .catch((error) => {
          console.log(error);
        });

    }

    async function get_ocp_result() {
      currentOcpStateRef.current = getOcpState();

      axios.post("get_ocp_result", currentOcpStateRef.current)
      .then(res => {

        let result = res.data;

        console.log(res)

      })
      .catch((error) => {
        console.log(error);
      });
    
  }

    async function test_move_robot() {
      
      console.log("Simulating OCP")


      updateRobotState(robotJointState.current.q[4]+1, 4)
      updateRobotState(robotJointState.current.q[5]+1, 5)

      checkRobotLimits();

      // robotJointState.current.q = [10, -60, 60, -90, -90, 0];
      // robotJointState.current.q[4] += 1
      // setRobotState({...robotState, q: robotJointState.current.q})

      if (playStateRef.current == "play") {
        // Wait for 30 ms before executing get_ocp_result again
        window.setTimeout(test_move_robot,30);

      }
    }
  

  /* --------------------------------------------------------------------------------------- */
  /* ------------------------- States and references for code panel ------------------------ */
  /* --------------------------------------------------------------------------------------- */
    const [checkedShowCode, setCheckedShowCode] = useState(false);

    const [pythonCode, setPythonCode] = useState("");


  /* --------------------------------------------------------------------------------------- */
  /* ------------------------------- Functions for code panel ------------------------------ */
  /* --------------------------------------------------------------------------------------- */
    const handleShowHideCode = () => {
      setCheckedShowCode(!checkedShowCode);
    }

    const handleCloseCode = () => {
      setCheckedShowCode(false);
    }

    useEffect (() => {
      fetch('/hello_world.py')
      .then((r) => r.text())
      .then(text  => {
        setPythonCode(text);
      }) 
    }, []);

    
  /* --------------------------------------------------------------------------------------- */
  /* --------------------------------- Helper functions ------------------------------------ */
  /* --------------------------------------------------------------------------------------- */
    function handleSenseWorld () {
      get_sense_world();
    }


    useEffect (() => {
      // checkSize();

      // fetch('/poll').then(response => {
      //   var reader = response.body.getReader();
      //   const decoder = new TextDecoder();

      //   return pump();

      //   function pump() {
      //     return reader.read().then(consume);
      //   }
      //   function consume(result) {
      //       if (result.value != null){

      //         // let data = new Float64Array(result.value.buffer);
      //         let data_0 = new DataView(result.value.buffer, 0);
      //         let data = data_0.getFloat64();
      //         // let data = Array.prototype.slice.call(result.value.buffer, 0);
      //         // If consumption is too slow, data length will become a multiple of 3
      //         let h = data[data.length-3];
      //         let x = data[data.length-2];
      //         let alpha = data[data.length-1];

      //         let p = convertCoordinatesToDOM(x+h*Math.sin(alpha), -h*Math.cos(alpha));

      //         ringAppend(loadTrailRef.current,p);

      //       }
      //       return pump();
      //   }
      // });

      // window.addEventListener('keydown', e => {if  (e.which===cameraControlKey) setEnableCameraControls(true);});
      // window.addEventListener('keyup',  e => {if  (e.which===cameraControlKey) setEnableCameraControls(false);});
      
      // console.log(`Key: ${event.key} with keycode ${event} has been pressed`);
      document.addEventListener('keydown', function(event){ if  (event.key===cameraControlKey) setEnableCameraControls(true); });
      document.addEventListener('keyup', function(event){ if  (event.key===cameraControlKey) setEnableCameraControls(false); });

    }, []);


  // ------------------------------------------------------------------------------------------------------------------------------------

    const [ enableObstacleAvoidance, setEnableObstacleAvoidance ] = useState(false);

  // Variables for crane size
    const [craneArea, setCraneArea] = useState({x: 0, y: 0, width: 750, height: 700, borderX: 17, borderY: 18 });

    const [mainArea, setMainArea] = useState({x: 0, y: 0, width: 750, height: 700});

  // Variables for stage size
    const [stageSize, setStageSize] = useState({width: 1000, height: 750});

  // Variable to manage trajectory line
    const [line, setLine] = useState({points: [100, 1685, 470, 1685]});
    const [lineTunnel, setLineTunnel] = useState({points: [100, 1685, 470, 1885]});
    const [lineTraj, setLineTraj] = useState({points: [100, 1685, 470, 1685]});

    const [solverState, setSolverState] = useState(SOLVER_INACTIVE);

  // Variables to manage obstacles position and visibility
    const [obs1, setObs1] = useState({x: 285, y: 685, radius: obs1_radius_start, isVisible: false});
    const [obs2, setObs2] = useState({x: 350, y: 685, radius: obs1_radius_start, isVisible: false});

    const [boundaries, setBoundaries] = useState([-100,-100,0]);

  // Variable for slider
    const [ maxAngle, setMaxAngle ] = useState(0.75);

    const [ init, setInit ] = useState(0.4);

  // console log

    const [ problemMode, setProblemMode ] = useState('optimal');

    const [ trackingMode, setTrackingMode ] = useState('none');
    const [ trackingWeight, setTrackingWeight ] = useState(1);

  // Switches
    const [ enableNoSwing, setEnableNoSwing ] = useState(true);

  // Tunnel state
    const [ tunnel, setTunnel ] = useState({
      radius: 0.05
    });

    // Points
    const [ A, setA ] = useState(convertCoordinatesToDOM(A_start[0],A_start[1]));
    const [ B, setB ] = useState(convertCoordinatesToDOM(B_start[0],B_start[1]));
    const [ C, setC ] = useState(convertCoordinatesToDOM(C_start[0],C_start[1]));
    const [ D, setD ] = useState(convertCoordinatesToDOM(D_start[0],D_start[1]));

    const loadTrailRef = useRef({"data": new Array(trail_length), "index": 0});

    const anim_part1 = useRef(true);
    const anim_part2 = useRef(true);
    const animationRef = useRef(true);
    const anim_tail = useRef(true);

    const measLoadRef = useRef(true);

  
    useEffect (() => {
      currentOcpStateRef.current = getOcpState();
      if (!isUptoDate()) {
        if (solverState!==SOLVER_INACTIVE) setSolverState(SOLVER_WAIT);
      }
    }, [tunnel,A,B,C,D,enableNoSwing,enableObstacleAvoidance,obs1,obs2,trackingMode,trackingWeight,maxAngle,init,problemMode]);

  // ---------------------------------------------------------------------------
  // Helper methods ------------------------------------------------------------
  // ---------------------------------------------------------------------------
  
    function convertCoordinatesFromDOM(x,y) {
      y = -(y-craneArea.borderY-craneArea.y)*craneRealHeight/stageSize.height;
      x = (x-craneArea.borderX-craneArea.x)*craneRealWidth/(stageSize.height*craneRealWidth/craneRealHeight);
      return [x, y]
    }

    function convertCoordinatesToDOM(x,y) {
      // x = x*craneRealWidth/stageSize.width;
      x = (x*(stageSize.height*craneRealWidth/craneRealHeight)/craneRealWidth)+craneArea.x+craneArea.borderX;
      y = (-y*stageSize.height/craneRealHeight)+craneArea.y+craneArea.borderY;
      return [x, y]
    }

    const updateReference = (reference) => {
      let referenceDOM = [];
      for(var i=0; i<reference.length; i=i+2){
        let p = convertCoordinatesToDOM(reference[i],reference[i+1])
        referenceDOM.push(p[0]);
        referenceDOM.push(p[1]);
      }
      setLine({points : referenceDOM});
      setLineTunnel({points : referenceDOM});
    }

    const updateTrajectory = (traj) => {
      let trajDOM = [];
      for(var i=0; i<traj.length; i=i+2){
        let p = convertCoordinatesToDOM(traj[i],traj[i+1])
        trajDOM.push(p[0]);
        trajDOM.push(p[1]);
      }
      setLineTraj({points : trajDOM});
    }

    const updateCanvasElements = (res, currentSolvedOCP) => {
      if (currentSolvedOCP.problemMode==='optimal' && currentSolvedOCP.trackingMode!=='none') {
        updateReference(res.data.reference);
      }
      
      updateTrajectory(res.data.traj);

    }

    const ringTail = (d,n) => {
      let N = d.data.length;
      let stop = d.index;
      let start = (stop-n+N) % N;
      if (start<stop) {
        return d.data.slice(start,stop);
      } else {
        return d.data.slice(start, N).concat(d.data.slice(0, stop));
      }
    };

  // ---------------------------------------------------------------------------
  // For responsiveness --------------------------------------------------------
  // ---------------------------------------------------------------------------

  useEffect (() => {
    updateDOMcoordinates();
  }, [craneArea]);

  const updateDOMcoordinates = () => {
    setA(convertCoordinatesToDOM(A_start[0],A_start[1]));
    setB(convertCoordinatesToDOM(B_start[0],B_start[1]));
    setC(convertCoordinatesToDOM(C_start[0],C_start[1]));
    setD(convertCoordinatesToDOM(D_start[0],D_start[1]));
    let obs_pos = convertCoordinatesToDOM(obs1_center_start[0],obs1_center_start[1]);
    setObs1({x: obs_pos[0], y: obs_pos[1], radius: obs1_radius_start, isVisible: false});

    let left = convertCoordinatesToDOM(lbx,0);
    let right = convertCoordinatesToDOM(ubx,0);
    setBoundaries([left[0],right[0],right[1]]);

    left = convertCoordinatesToDOM(lbx,-lbh);
    right = convertCoordinatesToDOM(ubx,-ubh);
    let area = {x: left[0], y: left[1], width: Math.abs(right[0]-left[0]), height: Math.abs(right[1]-left[1])};
    console.log(area)
    setMainArea(area);
  }

  // ---------------------------------------------------------------------------
  // Communication with Cherrypy server ----------------------------------------
  // ---------------------------------------------------------------------------

  const swap_AB = () => {
    setA(B);
    setB(A);
    setC(D);
    setD(C);
  }

  async function trigger_run(label, args) {
    axios.post("trigger_run" , {})

    window.setTimeout(swap_AB,5000);
  }


  async function get_ocp_result_rockit() {
    if (!isUptoDate()) {
      solvedOcpStateRef.current = currentOcpStateRef.current;

      axios.post("get_ocp_result_rockit", solvedOcpStateRef.current)
      .then(res => {

        let result = res.data;

        let state;
        if (result.success) {
          updateCanvasElements(res, solvedOcpStateRef.current);

          // https://github.com/konvajs/react-konva/issues/243

          animationRef.current = new Konva.Animation(frame => {
            let t_start = 0.01;
            let t_stop = 1;
            let t = (frame.time/1000) % (result.T[0]+t_start+t_stop);
            let N = result.traj.length/2;
            let index = (t-t_start)/result.T[0]*N;
            index = Math.round(Math.max(Math.min(index,N-1),0));
            let p_load = convertCoordinatesToDOM(result.traj[2*index], result.traj[2*index+1]);
            let p_top = convertCoordinatesToDOM(result.trajcart[2*index], result.trajcart[2*index+1]);
            anim_part1.current.points([p_load[0],p_load[1],p_top[0],p_top[1]]);
            anim_part2.current.x(p_top[0]-cart_width/2);
            anim_part2.current.y(p_top[1]-10);
            let opacity = (Math.min(t/t_start,1)-Math.max((t-(result.T[0]+t_start))/t_stop,0));
            anim_part1.current.opacity(opacity);
            anim_part2.current.opacity(opacity);

            // let p = ringTail(loadTrailRef.current,2);
            // if (p[0]!=undefined) {
            //   measLoadRef.current.x(p[0]);
            //   measLoadRef.current.y(p[1]);
            // }
            // anim_tail.current.points(ringFlat(loadTrailRef.current));

            let p = ringTail(loadTrailRef.current,trail_length);
            if (p[0]!==undefined) {
              measLoadRef.current.x(p[p.length-2]);
              measLoadRef.current.y(p[p.length-1]);
              anim_tail.current.points(p);
            }

          }, anim_part1.current.getLayer());

          animationRef.current.start();
          // setIndicators({cpu_time: result.cpu_time, transit_time: result.T});

          state = SOLVER_SUCCESS;
        } else {
           if (result.status==="Maximum_CpuTime_Exceeded") {
             state = SOLVER_TIMEOUT;
           } else if (result.status==="Infeasible_Problem_Detected") {
             state = SOLVER_INFEASIBLE;
           } else {
             state = SOLVER_FAIL;
           }
        }

        setPythonCode(result.code);

        if (isUptoDate()) {
          setSolverState(state);
        }

        window.setTimeout(get_ocp_result_rockit,30);
      })
      .catch((error) => {
        console.log(error);
        if (isUptoDate()) {
          setSolverState(SOLVER_ERROR);
        }
        window.setTimeout(get_ocp_result_rockit,30);

      });
    } else {
      // Wait for 30 ms before executing get_ocp_result_rockit again
      window.setTimeout(get_ocp_result_rockit,30);
    }
  }
   
  /* --------------------------------------------------------------------------------------- */
  /* ---------------------------------------- Render --------------------------------------- */
  /* --------------------------------------------------------------------------------------- */
  return (

    <div>

      <div className="wrapper">
                
        <div className="panel resize horizontal wrap">
        {/* <div className="panel"> */}
          <InputsPanel 
            selectedRobot={selectedRobot} setSelectedRobot={setSelectedRobot} 
            robotJointState={robotJointState} updateRobotState={updateRobotState} 
            connectionSettingsRef={connectionSettingsRef} updateConnectionSettings={updateConnectionSettings}
            taskSettingsRef={taskSettingsRef} updateTaskSettings={updateTaskSettings}
            obsStateRef={obsStateRef} updateObstacleState={updateObstacleState} 
            jointPositionLimitsRef={jointPositionLimitsRef} updateJointPositionLimits={updateJointPositionLimits}
            jointVelocityLimitsRef={jointVelocityLimitsRef} updateJointVelocityLimits={updateJointVelocityLimits}
            jointAccelerationLimitsRef={jointAccelerationLimitsRef} updateJointAccelerationLimits={updateJointAccelerationLimits}
            jointTorqueLimitsRef={jointTorqueLimitsRef} updateJointTorqueLimits={updateJointTorqueLimits}
            handleConnection={handleConnection}
          />

          {/* <Fab
            mainButtonStyles={{ backgroundColor: '#05a9FF' }}
            icon={<FaPlay />}
            // style={{bottom: '24px', left: 'calc(50%)', zIndex: 2000}}
            onClick={() => console.log('Play')}
            event={'click'}
            className="pull-right me-2"
          /> */}

        </div>   

        <div className="canvas">
          {/* <Global styles={globalStyles} /> */}
          <WorldViewer 
            worldSensed={worldSensed}
            cameraControlKey={enableCameraControls} 
            robotJointState={robotJointState} 
            obsStateRef={obsStateRef} updateObstacleState={updateObstacleState}
            binSettings1Ref={binSettings1Ref} handleUpdateBinState={handleUpdateBinState}
            binSettings2Ref={binSettings2Ref} 
          />
        </div>

        <ToastContainer // Using react-toastify - Docs:  https://fkhadra.github.io/react-toastify/
          position="bottom-right" closeOnClick={false}
          // hideProgressBar={false} autoClose={false} newestOnTop={true} draggable={false} rtl={false} icon={false} limit={3}
        />

        <Fab // Using react-tiny-fab - Docs: https://dericcain.github.io/react-tiny-fab/, Example: https://github.com/dericcain/react-tiny-fab/blob/master/example/index.html 
          mainButtonStyles={{ backgroundColor: '#0099a9' }}
          actionButtonStyles={{ backgroundColor: '#FFa085' }}
          icon={<FaBars />}
          // event={event}  style={{top: "7vh", right: 0}} alwaysShowTitle={true} onClick={someFunctionForTheMainButton}
        >
          <Action style={{backgroundColor: '#1F1B24'}} text={!checkedShowCode ? "Show code" : "Hide code"} onClick={handleShowHideCode} >
            <FaCode />
          </Action>

          <Action style={{backgroundColor: '#1F1B24'}} text="Help" onClick={() => handleChangeShowModal(true)} >
            <IoMdHelp />
          </Action>

        </Fab>

        <Fab
          mainButtonStyles={{ backgroundColor: playStateRef.current == 'stop' ? '#05a95c' : '#cf142b' }}
          icon={playStateRef.current == 'stop' ? <FaPlay /> : <FaStop />}
          style={{bottom: '24px', right: '100px'}}
          onClick={handlePlayStopPressed}
          event={'click'}
        />

        <Fab
          mainButtonStyles={{ backgroundColor: '#0099a9' }}
          icon={<FaEye />}
          style={{bottom: '24px', right: '176px'}}
          onClick={handleSenseWorld}
          event={'click'}
        />

        {/* <Fab
          mainButtonStyles={{ backgroundColor: '#cf142b' }}
          icon={<FaStop />}
          style={{top: '7vh', left: 'calc(25vw + 75px)'}}
          onClick={() => console.log('Stop')}
          event={'click'}
        /> */}
      </div> {/* End of wrapper */}

      
      { checkedShowCode && // Show CodePanel only if checkedShowCode is true
        <CodePanel pythonCode={pythonCode} handleCloseCode={handleCloseCode} />
      }

      <HelpModal showHelpModal={showHelpModal} handleChangeShowModal={handleChangeShowModal} />

    </ div>
  );
};

export default ControlPanel;
