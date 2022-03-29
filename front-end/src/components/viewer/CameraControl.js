// import { useThree } from "@react-three/fiber";
import { useState } from 'react';
import { extend, useThree } from "@react-three/fiber";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import { OrbitControls } from "@react-three/drei";
import { OrbitControls } from "three-stdlib";
import React from "react";

extend({ OrbitControls });

export const CameraControl = (props) => {
  let { enable } = props;
  const { camera, gl } = useThree();

  return (
    <orbitControls
      enabled={enable}
      // enableZoom={false}
      // maxPolarAngle={Math.PI / 2 - 0.1}
      // minPolarAngle={Math.PI / 6}
      args={[camera, gl.domElement]}
    />
  );
};

// export default Controls;
