import React, {
    Suspense,
    createRef,
    createContext,
    useContext,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
  } from "react";

  import * as THREE from "three";
  
  import { extend } from "@react-three/fiber";
  
  import { Canvas, useLoader, useFrame, useThree } from "@react-three/fiber";
  
  import { useTexture } from "@react-three/drei";
  
  // import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
  import { OrbitControls } from "three-stdlib";
  import { GLTFLoader } from "three-stdlib/loaders/GLTFLoader";
  import {
    BoxGeometry,
    MeshLambertMaterial,
    Shape,
    geometry,
    ShapeGeometry,
    Mesh
  } from "three";
  import {
    Physics,
    useBox,
    useCompoundBody,
    useCylinder,
    useSphere,
    usePlane,
    useConeTwistConstraint,
    usePointToPointConstraint
  } from "@react-three/cannon";
  
  //// Example: https://codesandbox.io/s/ragdoll-physics-forked-bntr9?file=/src/index.js
  // export const Bin = (props) => {
  //   const mesh = useRef();
  //   const [state, setState] = useState({ isHovered: false, isActive: false });
  
  //   return (
  //     <mesh
  //       {...props}
  //       ref={mesh}
  //       scale={state.isHovered ? [1.3, 1.3, 1.3] : [1, 1, 1]}
  //       onClick={(e) => setState({ ...state, isActive: !state.isActive })}
  //       onPointerOver={(e) => setState({ ...state, isHovered: true })}
  //       onPointerOut={(e) => setState({ ...state, isHovered: false })}
  //     >
  //       <boxBufferGeometry args={props.size} openEnded />
  //       <meshStandardMaterial color={state.isActive ? "#820263" : "#D90368"} />
  //     </mesh>
  //   );
  // };
  
  // const Plane = React.forwardRef(
  //   (
  //     {
  //       children,
  //       transparent = false,
  //       opacity = 1,
  //       color = "white",
  //       args = [1, 1, 1],
  //       ...props
  //     },
  //     ref
  //   ) => {
  //     return (
  //       <mesh receiveShadow castShadow ref={ref} {...props}>
  //         <boxBufferGeometry args={args} />
  //         <meshStandardMaterial
  //           color={color}
  //           transparent={transparent}
  //           opacity={opacity}
  //         />
  //         {children}
  //       </mesh>
  //     );
  //   }
  // );

// function CompoundBody(props) {
//     const [ref] = useCompoundBody(() => ({
//       mass: 12,
//       position: [1, 1, 1],
//       ...props,
//       shapes: [
//         { type: 'Box', position: [0, 0, 0], rotation: [0, 0, 0], args: [0.5, 0.5, 0.5] },
//         { type: 'Sphere', position: [1, 0, 0], rotation: [0, 0, 0], args: [0.65] },
//       ],
//     }))
//     return (
//       <group ref={ref}>
//         <mesh castShadow>
//           <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
//           <meshNormalMaterial attach="material" />
//         </mesh>
//         <mesh castShadow position={[1, 0, 0]}>
//           <sphereBufferGeometry attach="geometry" args={[0.65, 16, 16]} />
//           <meshNormalMaterial attach="material" />
//         </mesh>
//       </group>
//     )
//   }

  // function CompoundBody(props) {
  //   const [ref] = useCompoundBody(() => ({
  //     mass: 10,
  //     position: [0, 0, 1],
  //     ...props,
  //     shapes: [
  //       { type: 'Box', position: [0, 0, 0], rotation: [0, 0, 0], args: [0.5, 0.5, 0.5] },
  //       { type: 'Box', position: [0, 0, 0], rotation: [0, 0, 0], args: [0.3, 0.23, 0.4] },
  //     ],
  //   }))
  //   return (
  //     <group ref={ref}>
  //       <mesh castShadow>
  //         <boxBufferGeometry attach="geometry" args={[0.1, 0.23, 0.4]} />
  //         <meshNormalMaterial attach="material" />
  //       </mesh>
  //       <mesh castShadow>
  //         <boxBufferGeometry attach="geometry" args={[0.23, 0.1, 0.4]} />
  //         <meshNormalMaterial attach="material" />
  //       </mesh>
        
  //     </group>
  //   )
  // }
  
  // export function OwnBin() {
  //   const [seat] = useBox(() => ({
  //     type: "Static",
  //     position: [9, -0.8, 0],
  //     args: [2.5, 0.25, 2.5]
  //   }));
  //   const [leg1] = useBox(() => ({
  //     type: "Static",
  //     position: [7.2, -3, 1.8],
  //     args: [0.25, 2, 0.25]
  //   }));
  //   const [leg2] = useBox(() => ({
  //     type: "Static",
  //     position: [10.8, -3, 1.8],
  //     args: [0.25, 2, 0.25]
  //   }));
  //   const [leg3] = useBox(() => ({
  //     type: "Static",
  //     position: [7.2, -3, -1.8],
  //     args: [0.25, 2, 0.25]
  //   }));
  //   const [leg4] = useBox(() => ({
  //     type: "Static",
  //     position: [1.8, -3, -1.8],
  //     args: [0.25, 2, 0.25]
  //   }));
  //   return (
  //     <mesh position={[0,0,0]}>
  //       <Plane scale={[5, 0.5, 5]} ref={seat} />
  //       <Plane scale={[0.5, 4, 0.5]} ref={leg1} />
  //       <Plane scale={[0.5, 4, 0.5]} ref={leg2} />
  //       <Plane scale={[0.5, 4, 0.5]} ref={leg3} />
  //       <Plane scale={[0.5, 4, 0.5]} ref={leg4} />
  //     </mesh>
  //   );
  // }
  
// export function Bin2 () {
//   const height = 0.23;
//   // const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radiusSegments, heightSegments, openEnded)
//   return (
//     <mesh position={[-1.2, height/2, 0.5]}>
//       <cylinderBufferGeometry attach="geometry" args={[0.3, 0.3, height, 4, 10, true]} />
//       <meshNormalMaterial attach="material" />
//     </mesh>
//   )
// }

import { TransformControls } from "@react-three/drei";

function CompoundBin(props) {
  // const {position, height, width, depth, thickness} = props;
  // const { propOne, propTwo, children, ...props } = props;
  // const {height, width, depth, thickness, position, color, opacity} = props;

  const [ref] = useCompoundBody(() => ({
    mass: 100,
    type: 'Static',
    // position: [props.position[0],0,0],
    position: props.position,
    color: props.color,
    opacity: props.opacity,
    // ...props,
    shapes: [
      { type: 'Box', position: [0, 0, 0], rotation: [0, 0, 0], args: [props.height, props.thickness, props.width] },
      { type: 'Box', position: [0, (props.depth)/2, (props.width)/2], rotation: [-Math.PI/2, 0, 0], args: [props.height, props.thickness, props.depth] },
      { type: 'Box', position: [0, (props.depth)/2, -1*(props.width)/2], rotation: [-Math.PI/2, 0, 0], args: [props.height, props.thickness, props.depth] },
      { type: 'Box', position: [(props.height)/2, (props.depth)/2, 0], rotation: [-Math.PI/2, 0, -Math.PI/2], args: [props.width, props.thickness, props.depth] },
      { type: 'Box', position: [-1*(props.height)/2, (props.depth)/2, 0], rotation: [-Math.PI/2, 0, -Math.PI/2], args: [props.width, props.thickness, props.depth] },
    ],
  }))
  return (
    <group ref={ref}>
      <mesh castShadow position={[0, 0, 0]}>
        <boxBufferGeometry attach="geometry" args={[props.height, props.thickness, props.width]} />
        {/* <meshNormalMaterial attach="material" /> */}
        <meshStandardMaterial attach="material" color={props.color} opacity={props.opacity} transparent />
      </mesh>
      <mesh castShadow rotation={[-Math.PI/2, 0, 0]} position={[0, (props.depth)/2, (props.width)/2]}>
        <boxBufferGeometry attach="geometry" args={[props.height, props.thickness, props.depth]} />
        <meshStandardMaterial attach="material" color={props.color} opacity={props.opacity} transparent />
      </mesh>
      <mesh castShadow rotation={[-Math.PI/2, 0, 0]} position={[0, (props.depth)/2, -1*(props.width)/2]}>
        <boxBufferGeometry attach="geometry" args={[props.height, props.thickness, props.depth]} />
        <meshStandardMaterial attach="material" color={props.color} opacity={props.opacity} transparent />
      </mesh>
      <mesh castShadow rotation={[-Math.PI/2, 0, -Math.PI/2]} position={[(props.height)/2, (props.depth)/2, 0]}>
        <boxBufferGeometry attach="geometry" args={[props.width, props.thickness, props.depth]} />
        <meshStandardMaterial attach="material" color={props.color} opacity={props.opacity} transparent />
      </mesh>
      <mesh castShadow rotation={[-Math.PI/2, 0, -Math.PI/2]} position={[-1*(props.height)/2, (props.depth)/2, 0]}>
        <boxBufferGeometry attach="geometry" args={[props.width, props.thickness, props.depth]} />
        <meshStandardMaterial attach="material" color={props.color} opacity={props.opacity} transparent />
      </mesh>
    </group>
  )
}


export const Bin = (props) => {
    const { index, position, color, opacity, handleUpdateBinState } = props;
    // const transparent = false;
    // const opacity = 1;
    const depth = 0.20;
    const width = 0.40;
    const height = 0.30;
    const thickness = 0.02;
    // const {height, depth, width} = props.size;

    return (
      // <CompoundBin position={props.position} height={height} width={width} depth={depth} thickness={thickness} />
      // <CompoundBin height={height} width={width} depth={depth} thickness={thickness} {...props} />
      <CompoundBin height={height} width={width} depth={depth} thickness={thickness} position={position} color={color} opacity={opacity} />
    );
  }
  