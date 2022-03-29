import React, { useRef, useState, useEffect } from "react";
// import * as THREE from "three";
// import { useLoader } from "@react-three/fiber";
// import { TextureLoader } from 'three/src/loaders/TextureLoader.js';
// import { useTexture } from "@react-three/drei";

// import texture_image from "../../assets/images/wall-1.jpg";

// export const Obstacle = (props) => {
//   const mesh = useRef()
//   const [state, setState] = useState({isHovered: false, isActive: false})

//   return (
//     <mesh
//       {...props}
//       ref={mesh}
//       scale={[1, 1, 1]}
//       onClick={(e) => setState({...state, isActive: !state.isActive, })}
//       onPointerOver={(e) => setState({...state, isHovered: true})}
//       onPointerOut={(e) => setState({...state, isHovered: false})}>
//       <boxBufferGeometry args={props.size} openEnded/>
//       <meshStandardMaterial color={state.isActive ? '#820263' : '#D90368'} />
//     </mesh>
//   )
// }
//https://codesandbox.io/s/react-three-fiber-gestures-hc8gm?file=/src/index.js:1821-1829


import {
  MeshDistortMaterial,
  MeshWobbleMaterial,
  Sphere,
  TransformControls
} from "@react-three/drei";
import { extend, useFrame, useThree } from '@react-three/fiber';


function Box({ active, setActive, size }) {
  return (
    <mesh
      onClick={() => {
        setActive(!active)
      }}>
      {/* <boxGeometry />
      <meshNormalMaterial /> */}
      <boxBufferGeometry args={size}/>
      <meshPhongMaterial color={'#049ef4'} emissive={'#563f3f'} specular={'#111111'} shininess={49} refractionRatio={0.97} reflectivity={1}/>
    </mesh>
  )
}

//https://codesandbox.io/s/mixing-controls-forked-uzmy8?file=/src/App.js
export const Obstacle = ({ obsStateRef, updateObstacleState }) => {

  const transform = useRef()
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (transform.current) {
      const { current: controls } = transform
      const callback = (event) => {
        // orbit.current.enabled = !event.value
        // console.log(transform.current.worldPosition)
        updateObstacleState("x",transform.current.worldPosition.x);
        updateObstacleState("y",transform.current.worldPosition.y-obsStateRef.current.height/2);
        updateObstacleState("z",transform.current.worldPosition.z);
      }
      transform.current.addEventListener('dragging-changed', callback)
      return () => controls.removeEventListener('dragging-changed', callback)
    }
  })

  return (
    <TransformControls
      showX={active ? true : false}
      showZ={active ? true : false}
      showY={false}
      position={[obsStateRef.current.x, obsStateRef.current.y+obsStateRef.current.height/2, obsStateRef.current.z]}
      ref={transform}
      mode="translate"
      >
      <Box active={active} setActive={setActive} size={[obsStateRef.current.depth,obsStateRef.current.height,obsStateRef.current.width]} />
    </TransformControls>
  )

}


  // export const Obstacle = (props) => {
  //   const mesh = useRef()
  //   const [state, setState] = useState({isHovered: false, isActive: false})

  //   // const base = useTexture('../../assets/images/wall-1.jpg')
  //   // const base = useLoader(TextureLoader, '../../assets/images/wall-1.jpg');

  //   // const base = new THREE.TextureLoader().load(texture_image);

  //   return (
  //     <mesh
  //       {...props}
  //       ref={mesh}
  //       scale={[1, 1, 1]}
  //       onClick={(e) => setState({...state, isActive: !state.isActive, })}
  //       onPointerOver={(e) => setState({...state, isHovered: true})}
  //       onPointerOut={(e) => setState({...state, isHovered: false})}
  //       >

  //       <boxBufferGeometry args={props.size}/>
  //       {/* <meshStandardMaterial color={state.isActive ? '#820263' : '#D90368'} /> */}
  //       {/* <meshBasicMaterial attach="material" color={"lightblue"} map={base} /> */}
  //       <meshPhongMaterial color={'#049ef4'} emissive={'#563f3f'} specular={'#111111'} shininess={49} refractionRatio={0.97} reflectivity={1}/>
  //       {/* <meshStandardMaterial map={texture} /> */}
  //       {/* <MeshWobbleMaterial
  //         attach="material"
  //         color="#EB1E99"
  //         factor={0.1} // Strength, 0 disables the effect (default=1)
  //         speed={2} // Speed (default=1)
  //         roughness={0}
  //       /> */}
  //       {/* <MeshDistortMaterial
  //         color="#00A38D"
  //         attach="material"
  //         distort={0.1} // Strength, 0 disables the effect (default=1)
  //         speed={2} // Speed (default=1)
  //         roughness={0}
  //       /> */}
  //     </mesh>
  //   )
  // }