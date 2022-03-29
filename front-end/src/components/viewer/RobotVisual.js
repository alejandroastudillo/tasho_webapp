import * as THREE from "three";
import React, { useRef } from "react";
import { useLoader, useThree, useFrame } from "@react-three/fiber";

import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import URDFLoader from "urdf-loader";

/*
Reference coordinate frames for THREE.js and ROS.
Both coordinate systems are right handed so the URDF is instantiated without
frame transforms. The resulting model can be rotated to rectify the proper up,
right, and forward directions

THREE.js
   Y
   |
   |
   .-----X
 ／
Z

   Z
   |   Y
   | ／
   .-----X

ROS URDf
       Z
       |   X
       | ／
 Y-----.

*/

const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

const toMouseCoord = (el, e, v) => {
  v.x = ((e.pageX - el.offsetLeft) / el.offsetWidth) * 2 - 1;
  v.y = -((e.pageY - el.offsetTop) / el.offsetHeight) * 2 + 1;
};

// Get which part of the robot is hit by the mouse click
const getCollisions = (camera, robot, mouse) => {
  if (!robot) return [];

  raycaster.setFromCamera(mouse, camera);

  const meshes = [];
  robot.traverse((c) => c.type === "Mesh" && meshes.push(c));

  return raycaster.intersectObjects(meshes);
};

const isJoint = (j) => {
  return j.isURDFJoint && j.jointType !== "fixed";
};

// Find the nearest parent that is a joint
const findNearestJoint = (m) => {
  let curr = m;
  while (curr) {
    if (isJoint(curr)) {
      break;
    }
    curr = curr.parent;
  }
  return curr;
};

export const RobotVisual = (props) => {
  // const {robotJointState, clickedRobot, setClickedRobot} = props;
  const {robotJointState} = props;
  var filepath =
    // "https://raw.githubusercontent.com/gkjohnson/urdf-loaders/master/urdf/T12/urdf/T12.URDF";
    "https://raw.githubusercontent.com/alejandroastudillo/robot_descriptions/main/Universal_Robots/ur10/ur10.urdf";
  // "https://raw.githubusercontent.com/alejandroastudillo/robot_descriptions/3b735343d3b8d1c87100255052aa4a7d7da951b5/Universal_Robots/ur10/ur10.urdf"
  // "https://raw.githubusercontent.com/alejandroastudillo/robot_descriptions/main/Kinova/Gen3/JACO3_URDF_V11.urdf";
  // "../public/urdf/open_manipulator2.URDF";
  // "./robot_descriptions/Universal_Robots/ur10/ur10.urdf";
  // "https://raw.githubusercontent.com/nakano16180/robot-web-viewer/master/public/urdf/open_manipulator.URDF";

  const [hovered, setHovered] = React.useState(null);
  const { camera, gl } = useThree();

  // loading robot model from urdf
  // https://raw.githubusercontent.com/{username}/{repo_name}/{branch}/{filepath}
  const ref = useRef();
  const robot = useLoader(URDFLoader, filepath, (loader) => {
    loader.loadMeshFunc = (path, manager, done) => {
      new STLLoader(manager).load(
        path,
        (result) => {
          const material = new THREE.MeshPhongMaterial();
          const mesh = new THREE.Mesh(result, material);
          done(mesh);
        },
        null,
        (err) => done(null, err)
      );
    };
    loader.fetchOptions = {
      headers: { Accept: "application/vnd.github.v3.raw" }
    };
  });

  // robot.joints["shoulder_pan_joint"].setJointValue(THREE.MathUtils.degToRad(robotState.q[0]));
  // robot.joints["shoulder_lift_joint"].setJointValue(THREE.MathUtils.degToRad(robotState.q[1]));
  // robot.joints["elbow_joint"].setJointValue(THREE.MathUtils.degToRad(robotState.q[2]));
  // robot.joints["wrist_1_joint"].setJointValue(THREE.MathUtils.degToRad(robotState.q[3]));
  // robot.joints["wrist_2_joint"].setJointValue(THREE.MathUtils.degToRad(robotState.q[4]));
  // robot.joints["wrist_3_joint"].setJointValue(THREE.MathUtils.degToRad(robotState.q[5]));
  // const robot = useLoader(URDFLoader, robot_urdf);

  // Subscribe this component to the render-loop, rotate the mesh every frame
  // useFrame((state, delta) => (mesh.current.rotation.x += 0.01))
  useFrame((state, delta) => {
    // mesh.current.rotation.y += 0.02 * timeMod;
    // if (isActiveRef.current) {
    //  time.current += 0.03;
    //  mesh.current.position.y = position[1] + Math.sin(time.current) * 0.4;
    // }
    // console.log(delta)
    robot.joints["shoulder_pan_joint"].setJointValue(THREE.MathUtils.degToRad(robotJointState.current.q[0]));
    robot.joints["shoulder_lift_joint"].setJointValue(THREE.MathUtils.degToRad(robotJointState.current.q[1]));
    robot.joints["elbow_joint"].setJointValue(THREE.MathUtils.degToRad(robotJointState.current.q[2]));
    robot.joints["wrist_1_joint"].setJointValue(THREE.MathUtils.degToRad(robotJointState.current.q[3]));
    robot.joints["wrist_2_joint"].setJointValue(THREE.MathUtils.degToRad(robotJointState.current.q[4]));
    robot.joints["wrist_3_joint"].setJointValue(THREE.MathUtils.degToRad(robotJointState.current.q[5]));
   });

  // The highlight material
  const highlightMaterial = new THREE.MeshPhongMaterial({
    shininess: 10,
    color: "#FFFFFF",
    emissive: "#FFFFFF",
    emissiveIntensity: 0.25
  });

  // Highlight the link geometry under a joint
  const highlightLinkGeometry = (m, revert) => {
    const traverse = (c) => {
      // Set or revert the highlight color
      if (c.type === "Mesh") {
        if (revert) {
          c.material = c.__origMaterial;
          delete c.__origMaterial;
        } else {
          c.__origMaterial = c.material;
          c.material = highlightMaterial;
        }
      }

      // Look into the children and stop if the next child is
      // another joint
      if (c === m || !isJoint(c)) {
        for (let i = 0; i < c.children.length; i++) {
          traverse(c.children[i]);
        }
      }
    };
    traverse(m);
  };

  const onMouseMove = (event) => {
    toMouseCoord(gl.domElement, event, mouse);
    const collision = getCollisions(camera, robot, mouse).shift() || null;
    const joint = collision && findNearestJoint(collision.object);

    if (joint !== hovered) {
      if (hovered) {
        console.log("pointer out");
        highlightLinkGeometry(hovered, true);
        setHovered(null);
        // console.log(robot.joints);
      }
      if (joint) {
        console.log("pointer over");
        highlightLinkGeometry(joint, false);
        setHovered(joint);
      }
    }
  };

  const handleClickOnRobot = () => {
    // alert("Robot click");
      // if(!clickedRobot) {
        console.log("Robot click");
        // setClickedRobot(true);
      // }
  }

  return (
    <mesh
      position={[0, 0, 0]}
      // rotation={[-0.5 * Math.PI, 0, Math.PI]}
      rotation={[-0.5 * Math.PI, 0, 0]}
      scale={[1, 1, 1]}
      // onClick={(e) => handleClickOnRobot(e)}
      // onPointerOver={() => console.log('Pointer over')}
      onPointerDown={() => handleClickOnRobot()}
      // onPointerMove={onMouseMove}
      // onPointerOut={() => {
      //   if (hovered) {
      //     highlightLinkGeometry(hovered, true);
      //     setHovered(null);
      //   }
      // }}
    >
      <primitive
        ref={ref}
        object={robot}
        position={[0, 0, 0]}
        dispose={null}
      />
    </mesh>
  );
};
