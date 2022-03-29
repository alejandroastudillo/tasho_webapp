import React, { useRef, useEffect } from "react";
import { useSphere } from '@react-three/cannon';
import { useGesture } from '@use-gesture/react';
import { useFrame } from "@react-three/fiber";

export function Ball(props) {
  const { updateSelectedBallPos, worldSensed } = props;

  const radius = 0.0335;
  const mass = 0.057;
  // const mass = 0.57;

  const [ref, api] = useSphere(() => ({
    args: [radius],
    mass: mass,
    type: worldSensed ? 'Static' : 'Dynamic',
    position: props.position,
    // ...props,
  }))

  const position = useRef(props.position)
  useEffect(() => {
    const unsubscribe = api.position.subscribe((p) => (position.current = p))
    return unsubscribe
  }, [])

  // useFrame(() => ref.current.position.set(api.position.current));

  const gestureBinds = useGesture(
    {
      onClick: e => {
        // updateSelectedBallPos([position.current]);
        updateSelectedBallPos([[position.current[0], position.current[1]+0.05, position.current[2]]]);
      }
    }
  );


  return (
    // <mesh castShadow receiveShadow ref={ref}>
    <mesh castShadow receiveShadow ref={ref} {...gestureBinds()}> 
      <sphereBufferGeometry args={[radius, 24, 24]} />
      <meshStandardMaterial color={"#dfff4f"} />
    </mesh>
  )
}

// //<Ball position={[-0.9, 0.0335, 0]} scale={[1, 1, 1]} />
// export const Ball = (props) => {
//   const mesh = useRef()
//   const radius = 0.0335;
//   return (
//     <mesh
//     {...props}
//     ref={mesh}
//     >
//       {/* <sphereBufferGeometry args={[5, 24, 24]} /> */}
//       <sphereBufferGeometry args={[radius, 24, 24]} />
//       <meshStandardMaterial color={"#dfff4f"} />
//     </mesh>
//   );
// };
  
