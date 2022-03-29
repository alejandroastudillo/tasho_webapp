import { useEffect } from 'react';
import { Leva, useControls, button, useCreateStore, folder, LevaPanel, LevaInputs } from "leva";


export const InputsPanel = (props) => {
  const {
    selectedRobot, setSelectedRobot, 
    robotJointState, updateRobotState, 
    connectionSettingsRef, updateConnectionSettings, 
    taskSettingsRef, updateTaskSettings,
    obsStateRef, updateObstacleState,
    jointPositionLimitsRef, updateJointPositionLimits,
    jointVelocityLimitsRef, updateJointVelocityLimits,
    jointAccelerationLimitsRef, updateJointAccelerationLimits,
    jointTorqueLimitsRef, updateJointTorqueLimits,
    handleConnection
  } = props;

  const theme_leva = { // you can pass a custom theme (see: https://codesandbox.io/s/leva-theme-forked-dle9l?file=/src/App.jsx or https://github.com/pmndrs/leva/blob/master/packages/leva/src/styles/stitches.config.ts)
    sizes: {
      rootWidth: '340px',
      controlWidth: '260px',
      scrubberWidth: '6px',
      scrubberHeight: '16px',
      rowHeight: '24px',
      numberInputMinWidth: "54px",
      folderTitleHeight: '24px',
    },
    fontSizes: {
      root: '14px',
      toolTip: '14px',
    },
    fontWeights: {
      label: 'normal',
      folder: 'bold',
      button: 'normal',
    },
    space: {
      xs: '3px',
      sm: '6px',
      md: '10px',
      rowGap: '7px',
      colGap: '7px',
    },
  }

  const robotStore = useCreateStore();
  const taskStore = useCreateStore();

  const [{ robotSelection, connectionIP, connectionPort, q0, q1, q2, q3, q4, q5 }, setJointAngles] = useControls("Robot Settings", () => ({
    // robotSelection: {label: "Robot selection", value: "UR10", options: ["UR10"] },
    robotSelection: {label: "Robot selection", value: selectedRobot, options: ["UR10", "KinovaGen3"],
      onChange: (robotSelection) => {
        // handleUpdateJointPosLimits(lims_q0, 0)
        // setLimitsValues({q0: lims_q0})
        setSelectedRobot(robotSelection);
      }, 
    },
    // deploymentType: {label: "Deployment type", value: "Simulation", options: ["Simulation", "Real robot"] },
    "Connection": folder(
      {
        connectionIP: {value: connectionSettingsRef.current.ip_address, label: "IP address", hint: 'IP address of the robot', type: LevaInputs.STRING,
          onChange: (connectionIP) => {
            updateConnectionSettings(connectionIP,connectionSettingsRef.current.port)
          }, 
        },
        connectionPort: {value: connectionSettingsRef.current.port, label: "Port",
          onChange: (connectionPort) => {
            updateConnectionSettings(connectionSettingsRef.current.ip_address,connectionPort)
          }, 
        },
        Connect: button(() => handleConnection(connectionSettingsRef.current.ip_address, connectionSettingsRef.current.port))
      },
      { collapsed: true }
    ),
    "Joint positions": folder(
      {
        // readTime: { value: 10 * 1000, label: "Read Time (ms)" }, // Default to 10 seconds
        q0: { value: robotJointState.current.q[0], min: -360, max: 360, step: 0.1, label: "Joint 0",
          onChange: (q0) => {
            updateRobotState(q0,0);
          }, 
        },
        q1: { value: robotJointState.current.q[1], min: -360, max: 360, label: "Joint 1",
          onChange: (q1) => {
            updateRobotState(q1,1);
          }, 
        },
        q2: { value: robotJointState.current.q[2], min: -360, max: 360, label: "Joint 2",
          onChange: (q2) => {
            updateRobotState(q2,2);
          }, 
        },
        q3: { value: robotJointState.current.q[3], min: -360, max: 360, label: "Joint 3",
          onChange: (q3) => {
            updateRobotState(q3,3);
          }, 
        },
        q4: { value: robotJointState.current.q[4], min: -360, max: 360, label: "Joint 4",
          onChange: (q4) => {
            updateRobotState(q4,4);
          }, 
        },
        q5: { value: robotJointState.current.q[5], min: -360, max: 360, label: "Joint 5",
          onChange: (q5) => {
            updateRobotState(q5,5);
          }, 
        },
        "Reset Progress": button(() => setJointAngles({ q0: 0, q1: -60, q2: 60, q3: -90, q4: -90, q5: 0}))
      },
      { collapsed: true }
    )  
   
  }), { store: robotStore }
  );
  
  // taskSettingsRef, updateTaskSettings
  const [taskSettingValues, setTaskSettingValues] = useControls(() => ({
    "Task Settings": folder(
      {
        taskType: {label: "Task type", value: taskSettingsRef.current.type, options: ["Bin picking", "Contour-following"],
          onChange: (taskType) => {
            updateTaskSettings("type",taskType);
          }, 
        },
        approach: {label: "Approach", value: taskSettingsRef.current.approach, options: ["Naive", "Optimal time"],
          onChange: (approach) => {
            updateTaskSettings("approach",approach);
          }, 
        },
        approachDistance: { value: taskSettingsRef.current.approach_distance, min: 0, max: 0.3, step: 0.01, label: "Approach distance",
          onChange: (approachDistance) => {
            updateTaskSettings("approach_distance",approachDistance);
          }, 
        },
      }
    )
  }), { store: taskStore }
  );



  const [ obsValues, setObsValues ] = useControls(() => ({
    "Obstacle Avoidance": folder(
      {
        // readTime: { value: 10 * 1000, label: "Read Time (ms)" }, // Default to 10 seconds
        obstacleAvoidace: {value: obsStateRef.current.enabled, label: "Enable",
          onChange: (obstacleAvoidace) => {
            updateObstacleState("enabled",obstacleAvoidace);
          }, 
        },
        "Obstacle settings": folder({
          obs1_height: { value: obsStateRef.current.height, min: 0.1, max: 0.7, step: 0.01, label: "Height",
          onChange: (obs1_height) => {
            updateObstacleState("height",obs1_height);
          }, 
        },
          obs1_width: { value: obsStateRef.current.width, min: 0.01, max: 0.2, step: 0.01, label: "Width",
            onChange: (obs1_width) => {
              updateObstacleState("width",obs1_width);
            }, 
          },
          obs1_depth: { value: obsStateRef.current.depth, min: 0.05, max: 0.7, step: 0.01, label: "Depth",
            onChange: (obs1_depth) => {
              updateObstacleState("depth",obs1_depth);
            }, 
          },
          obs1_pos: {value: [obsStateRef.current.x, obsStateRef.current.z, obsStateRef.current.y], label: "Position",
            onChange: (obs1_pos) => {
              updateObstacleState("x",obs1_pos[0]);
              updateObstacleState("y",obs1_pos[2]);
              updateObstacleState("z",obs1_pos[1]);
            }, 
          },
        }, 
        { collapsed: true },
        // { render: (get) => get('Obstacles.obstacleAvoidace')}
        ),
      },
      { collapsed: true }
    )
  }), { store: taskStore }
  );

  // console.log(obsValues.obs1_height)
  // setObsValues({...obsValues, obs1_height: 30 })

  const [limitsValues, setLimitsValues ] = useControls(() => ({ 
    "Joint limits": folder(
      {

        "Position limits": folder(
          {
            // readTime: { value: 10 * 1000, label: "Read Time (ms)" }, // Default to 10 seconds
            enable_lims_q: {value: true, label: "Enable",
              onChange: (enable_lims_q) => {
                updateJointPositionLimits(enable_lims_q);
              }, 
            },
            lims_q0: { value: [jointPositionLimitsRef.current.lb[0], jointPositionLimitsRef.current.ub[0]], min: -360, max: 360, step: 1, label: "Joint 0",
              onChange: (lims_q0) => {
                updateJointPositionLimits(lims_q0, 0);
              }, 
            },
            lims_q1: { value: [jointPositionLimitsRef.current.lb[1], jointPositionLimitsRef.current.ub[1]], min: -360, max: 360, step: 1, label: "Joint 1",
              onChange: (lims_q1) => {
                updateJointPositionLimits(lims_q1, 1);
              }, 
            },
            lims_q2: { value: [jointPositionLimitsRef.current.lb[2], jointPositionLimitsRef.current.ub[2]], min: -360, max: 360, step: 1, label: "Joint 2",
              onChange: (lims_q2) => {
                updateJointPositionLimits(lims_q2, 2);
              }, 
            },
            lims_q3: { value: [jointPositionLimitsRef.current.lb[3], jointPositionLimitsRef.current.ub[3]], min: -360, max: 360, step: 1, label: "Joint 3",
              onChange: (lims_q3) => {
                updateJointPositionLimits(lims_q3, 3);
              }, 
            },
            lims_q4: { value: [jointPositionLimitsRef.current.lb[4], jointPositionLimitsRef.current.ub[4]], min: -360, max: 360, step: 1, label: "Joint 4",
              onChange: (lims_q4) => {
                updateJointPositionLimits(lims_q4, 4);
              }, 
            },
            lims_q5: { value: [jointPositionLimitsRef.current.lb[5], jointPositionLimitsRef.current.ub[5]], min: -360, max: 360, step: 1, label: "Joint 5",
              onChange: (lims_q5) => {
                updateJointPositionLimits(lims_q5, 5);
              }, 
            },
          },
          { collapsed: true }
        ),
        "Velocity limits": folder(
          {
            // readTime: { value: 10 * 1000, label: "Read Time (ms)" }, // Default to 10 seconds
            enable_lims_dq: {value: true, label: "Enable"},
            lims_dq0: { value: [jointVelocityLimitsRef.current.lb[0], jointVelocityLimitsRef.current.ub[0]], min: -30, max: 30, step: 1, label: "Joint 0",
              onChange: (lims_dq0) => {
                updateJointVelocityLimits(lims_dq0, 0);
              }, 
            },
            lims_dq1: { value: [jointVelocityLimitsRef.current.lb[1], jointVelocityLimitsRef.current.ub[1]], min: -30, max: 30, step: 1, label: "Joint 1",
              onChange: (lims_dq1) => {
                updateJointVelocityLimits(lims_dq1, 1);
              }, 
            },
            lims_dq2: { value: [jointVelocityLimitsRef.current.lb[2], jointVelocityLimitsRef.current.ub[2]], min: -30, max: 30, step: 1, label: "Joint 2",
              onChange: (lims_dq2) => {
                updateJointVelocityLimits(lims_dq2, 2);
              }, 
            },
            lims_dq3: { value: [jointVelocityLimitsRef.current.lb[3], jointVelocityLimitsRef.current.ub[3]], min: -30, max: 30, step: 1, label: "Joint 3",
              onChange: (lims_dq3) => {
                updateJointVelocityLimits(lims_dq3, 3);
              }, 
            },
            lims_dq4: { value: [jointVelocityLimitsRef.current.lb[4], jointVelocityLimitsRef.current.ub[4]], min: -30, max: 30, step: 1, label: "Joint 4",
              onChange: (lims_dq4) => {
                updateJointVelocityLimits(lims_dq4, 4);
              }, 
            },
            lims_dq5: { value: [jointVelocityLimitsRef.current.lb[5], jointVelocityLimitsRef.current.ub[5]], min: -30, max: 30, step: 1, label: "Joint 5",
              onChange: (lims_dq5) => {
                updateJointVelocityLimits(lims_dq5, 5);
              }, 
            },

          },
          { collapsed: true }
        ),
        "Acceleration limits": folder(
          {
            // readTime: { value: 10 * 1000, label: "Read Time (ms)" }, // Default to 10 seconds
            enable_lims_ddq: {value: true, label: "Enable"},
            lims_ddq0: { value: [jointAccelerationLimitsRef.current.lb[0], jointAccelerationLimitsRef.current.ub[0]], min: -200, max: 200, step: 1, label: "Joint 0",
              onChange: (lims_ddq0) => {
                updateJointAccelerationLimits(lims_ddq0, 0);
              }, 
            },
            lims_ddq1: { value: [jointAccelerationLimitsRef.current.lb[1], jointAccelerationLimitsRef.current.ub[1]], min: -200, max: 200, step: 1, label: "Joint 1",
              onChange: (lims_ddq1) => {
                updateJointAccelerationLimits(lims_ddq1, 1);
              }, 
            },
            lims_ddq2: { value: [jointAccelerationLimitsRef.current.lb[2], jointAccelerationLimitsRef.current.ub[2]], min: -200, max: 200, step: 1, label: "Joint 2",
              onChange: (lims_ddq2) => {
                updateJointAccelerationLimits(lims_ddq2, 2);
              }, 
            },
            lims_ddq3: { value: [jointAccelerationLimitsRef.current.lb[3], jointAccelerationLimitsRef.current.ub[3]], min: -200, max: 200, step: 1, label: "Joint 3",
              onChange: (lims_ddq3) => {
                updateJointAccelerationLimits(lims_ddq3, 3);
              }, 
            },
            lims_ddq4: { value: [jointAccelerationLimitsRef.current.lb[4], jointAccelerationLimitsRef.current.ub[4]], min: -200, max: 200, step: 1, label: "Joint 4",
              onChange: (lims_ddq4) => {
                updateJointAccelerationLimits(lims_ddq4, 4);
              }, 
            },
            lims_ddq5: { value: [jointAccelerationLimitsRef.current.lb[5], jointAccelerationLimitsRef.current.ub[5]], min: -200, max: 200, step: 1, label: "Joint 5",
              onChange: (lims_ddq5) => {
                updateJointAccelerationLimits(lims_ddq5, 5);
              }, 
            },
          },
          { collapsed: true }
        ),
        "Torque limits": folder(
          {
            // readTime: { value: 10 * 1000, label: "Read Time (ms)" }, // Default to 10 seconds
            enable_lims_tau: {value: true, label: "Enable"},
            lims_tau0: { value: [jointTorqueLimitsRef.current.lb[0], jointTorqueLimitsRef.current.ub[0]], min: -330, max: 330, step: 1, label: "Joint 0",
              onChange: (lims_tau0) => {
                updateJointTorqueLimits(lims_tau0, 0);
              }, 
            },
            lims_tau1: { value: [jointTorqueLimitsRef.current.lb[1], jointTorqueLimitsRef.current.ub[1]], min: -330, max: 330, step: 1, label: "Joint 1",
              onChange: (lims_tau1) => {
                updateJointTorqueLimits(lims_tau1, 1);
              }, 
            },
            lims_tau2: { value: [jointTorqueLimitsRef.current.lb[2], jointTorqueLimitsRef.current.ub[2]], min: -150, max: 150, step: 1, label: "Joint 2",
              onChange: (lims_tau2) => {
                updateJointTorqueLimits(lims_tau2, 2);
              }, 
            },
            lims_tau3: { value: [jointTorqueLimitsRef.current.lb[3], jointTorqueLimitsRef.current.ub[3]], min: -56, max: 56, step: 1, label: "Joint 3",
              onChange: (lims_tau3) => {
                updateJointTorqueLimits(lims_tau3, 3);
              }, 
            },
            lims_tau4: { value: [jointTorqueLimitsRef.current.lb[4], jointTorqueLimitsRef.current.ub[4]], min: -56, max: 56, step: 1, label: "Joint 4",
              onChange: (lims_tau4) => {
                updateJointTorqueLimits(lims_tau4, 4);
              }, 
            },
            lims_tau5: { value: [jointTorqueLimitsRef.current.lb[5], jointTorqueLimitsRef.current.ub[5]], min: -56, max: 56, step: 1, label: "Joint 5",
              onChange: (lims_tau5) => {
                updateJointTorqueLimits(lims_tau5, 5);
              }, 
            },
          },
          { collapsed: true }
        )

      }
      ,{ collapsed: false }
    )
       
  }), { store: taskStore }
  );

  useEffect(() => {
    setObsValues({...obsValues, obs1_pos: [obsStateRef.current.x, obsStateRef.current.z, obsStateRef.current.y] })
  }, [obsStateRef.current.x, obsStateRef.current.y, obsStateRef.current.z]);

  // function handleObsStateChange () {
  //   // setObsState(...obsState, )
  //   // {enabled: false, x: 0.75, y: 0.2, z: 0, height: 0.4, width: 0.05, depth: 0.3 }
  //   // setObsState({enabled: obsValues.obstacleAvoidace, x: obsValues.obs1_pos[0], y: obsValues.obs1_pos[2], z: obsValues.obs1_pos[1], height: obsValues.obs1_height, width: obsValues.obs1_width, depth: obsValues.obs1_depth})
  // }

  // useEffect(() => {
  //   // Update the document title using the browser API
  //   // handleObsStateChange()
  // }, [obsValues]);



  // // setLimitsValues({lims_q0: [10, 20], ...limitsValues})
  // console.log(limitsValues.lims_q0)
  // console.log(limitsValues.lims_q0)

  // const robotStore = useCreateStore()
  // // const store2 = useCreateStore()
  // useControls({
  //   // readTime: { value: 10 * 1000, label: "Read Time (ms)" }, // Default to 10 seconds
  //   q0: { value: 0, min: -360, max: 360, label: "Joint 0" },
  //   q1: { value: -60, min: -360, max: 360, label: "Joint 1" },
  //   q2: { value: 60, min: -360, max: 360, label: "Joint 2" },
  //   q3: { value: -90, min: -360, max: 360, label: "Joint 3" },
  //   q4: { value: -90, min: -360, max: 360, label: "Joint 4" },
  //   q5: { value: 0, min: -360, max: 360, label: "Joint 5" },
  //   // "Reset Progress": button(() => set({ q0: 0, q1: -60, q2: 60, q3: -90, q4: -90, q5: 0}))
  // }, { store: robotStore })
  // // useControls({ boolean: true }, { store: store2 })

  

  return (
    /* Made this in order to pass other variables (like setters) to parent */
    // setObsValues,
    // renderPanel:(
      <>
        <Leva fill flat titleBar={false} />

        <LevaPanel 
          store={robotStore}
          hideCopyButton={true}
          // oneLineLabels={true}
          // collapsed={false}
          titleBar={{ title: "Robot Settings", drag: false, filter: false }}
          fill 
          flat 
          // titleBar={false}
          theme={theme_leva}
        />

        <LevaPanel 
          store={taskStore}
          hideCopyButton={true}
          // oneLineLabels={true}
          // collapsed={false}
          titleBar={{ title: "Task Settings", drag: false, filter: false }}
          fill 
          flat 
          // titleBar={false}
          theme={theme_leva}
        />

      </>
    // )
  )

}