import React from "react";
import { usePlane } from '@react-three/cannon'

export const Plane = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
    <planeBufferGeometry attach="geometry" args={[20, 20]} />
    <meshBasicMaterial attach="material" color="#082444" />
  </mesh>
);

// export function Plane(props) {
//   const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], ...props }))
//   return (
//     <mesh ref={ref}>
//       <planeBufferGeometry args={[100, 100]} />
//     </mesh>
//   )
// }

export function PlanePhysics(props) {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], position: [0, 0, 0], ...props }))
  return (
    <mesh receiveShadow ref={ref}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial attach="material" color="#082444" />
      {/* <meshStandardMaterial attach="material" /> */}
    </mesh>
  )
}

// Geometry
// function GroundPlane() {
//   return (
//     <mesh receiveShadow rotation={[-1.57079632, 0, 0]} position={[0, 0, 0]}>
//       <planeBufferGeometry attach="geometry" args={[500, 500]} />
//       <meshStandardMaterial attach="material" color="#AAAAAA" />
//     </mesh>
//   );
// }

// export default Plane;