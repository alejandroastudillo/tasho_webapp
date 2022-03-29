import React from 'react';
// import { useLoader } from "@react-three/fiber";
// import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
// import { STLLoader } from "three-stdlib/loaders/STLLoader.js";
// import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

import { useLoader } from "@react-three/fiber";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { GLTFLoader } from "three-stdlib/loaders/GLTFLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";

// import pickitCam from '../../assets/objects/pickit_M_L.stl';
// import pickitCam from '../../assets/objects/primer_bin.stl'


export const PickitCamera = () => {
    const gltf = useLoader(GLTFLoader, "./Poimandres.gltf");
    return (
        <>
            <primitive object={gltf.scene} scale={0.4} />
        </>
    );
};

// export const PickitCamera = () => {
//     const materials = useLoader(MTLLoader, "./Poimandres.mtl");
//     const obj = useLoader(OBJLoader, "./Poimandres.obj", (loader) => {
//         materials.preload();
//         loader.setMaterials(materials);
//       });

//     return (
//         <>
//             <primitive object={obj} scale={0.4} />;
//         </>
//     )
// }