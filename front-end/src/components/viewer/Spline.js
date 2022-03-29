import * as THREE from "three";
import React, { useRef, useState, useEffect } from "react";
import { useDrag } from '@use-gesture/react';
import { Canvas, useFrame, useThree } from "@react-three/fiber";

// https://spectrum.chat/react-three-fiber/general/how-to-detect-neighboring-points-on-spline~7a86c45e-52de-406e-a87b-65a6f67fb9f7
// https://codesandbox.io/s/spectrum1addpointtospline-1gjdw?from-embed=&file=/src/index.js:3906-3952

const Point = React.memo(({ uuid, color, points, movePoint }) => {
    const initialPosition = useRef(points[uuid]);
    const mesh = useRef();
    const position = useRef(initialPosition.current);
  
    useFrame(() => mesh.current.position.set(...position.current));

    useEffect(() => {
      position.current = points[uuid];
    }, [points]);
    
    // const bindDrag = useDrag(
    //   ({ offset: [mx, my], event }) => {
    //     if (event) event.stopPropagation();
    //     position.current = [
    //       initialPosition.current[0] + mx,
    //       initialPosition.current[1] - my,
    //       0
    //     ];
    //     movePoint(uuid, position.current);
    //   },
    //   { pointerEvents: true }
    // );
    const bindDrag = useDrag(
        ({ movement: [mx, my, mz], event }) => {
          if (event) event.stopPropagation();
          position.current = [
            initialPosition.current[0] - 0.001*mx,
            initialPosition.current[1] - 0.001*my,
            initialPosition.current[2]
          ];
          movePoint(uuid, position.current);
        },
        { pointerEvents: true }
      );
  
    return (
      <mesh ref={mesh} {...bindDrag()}>
        <sphereBufferGeometry args={[0.005, 20, 20]} />
        <meshStandardMaterial color={color} />
      </mesh>
    );
  });
  
  function makeLine(geometryRef, points) {
    var anchors = [];
    for (let key in points) {
      anchors.push(new THREE.Vector3(...points[key]));
    }
    const curve = new THREE.CatmullRomCurve3(anchors, false, "catmullrom");
    const pts = curve.getPoints(50);
    geometryRef.current.setFromPoints(pts);
  }
  
  const Line = React.memo(
    ({ color, points }) => {
      const geometryRef = useRef();
      const { mouse, viewport } = useThree();
  
      useEffect(() => {
        makeLine(geometryRef, points);
      }, [points]);
  
      return (
        <line>
          <bufferGeometry attach="geometry" ref={geometryRef} />
          <lineBasicMaterial attach="material" color={color} linewidth={3} />
        </line>
      );
    }
  );
  
  const Points = React.memo(({ color, points, length, movePoint }) => {
    const [objects, setObjects] = useState([]);
  
    useEffect(() => {
      var temp = [];
      for (let key in points) {
        temp.push(
          <Point
            key={key}
            uuid={key}
            color={color}
            points={points}
            movePoint={movePoint}
          />
        );
      }
      setObjects(temp);
    }, [length, points]);
  
    return objects.length !== 0 ? (
      <React.Fragment>{objects}</React.Fragment>
    ) : null;
  });
  
 export const Spline = React.memo(({ pColor, pPoints }) => {
    const [points, apiPoints] = useState(pPoints);
    const [idx, apiIdx] = useState(Object.keys(pPoints).length + 1);
    const [length, apiLength] = useState(Object.keys(pPoints).length);

    useEffect(() => {
      setPoints(pPoints);
    }, [pPoints]);
  
    const movePoint = (uuid, point) => {
      apiPoints(s => ({ ...s, [uuid]: point }));
    };
    const setPoints = points => {
      apiPoints(s => points);
    };
    const addIndex = () => {
      apiIdx(s => s + 1);
    };
    const plusLength = n => {
      apiLength(s => s + 1);
    };
  
    return (
      <>
        <Line
          color={pColor}
          points={points}
          idx={idx}
          addIndex={addIndex}
          plusLength={plusLength}
          setPoints={setPoints}
        />
        <Points
          color={pColor}
          points={points}
          length={length}
          movePoint={movePoint}
        />
      </>
    );
});


// --------------------------------------------------------------------

// import React, { useRef, useState, useEffect } from "react";
// import { Line } from "@react-three/drei";
// import { CatmullRomCurve3 } from "three";
// import { prototype } from "urdf-loader";
// import * as THREE from "three";
// import { useThree } from "@react-three/fiber";

// // https://threejs.org/docs/#api/en/geometries/TubeGeometry
// // https://codesandbox.io/s/confetti-forked-4335k?file=/src/index.js
// export function PathLine(props) {
//     const {linewidth, points} = props;
//     return (
//       <>
//         <Line
//           points={points}
//           color={'#d6ff37'}
//           lineWidth={linewidth}
//           dashed={false}
//         />
//       </>
//     )
//   }

// function makeLine(geometryRef, points) {
//     var anchors = [];
//     for (let key in points) {
//         anchors.push(new THREE.Vector3(...points[key]));
//     }
//     const curve = new THREE.CatmullRomCurve3(anchors, true, "catmullrom").getPoints(50);
//     geometryRef.current.setFromPoints(curve);
// }

// function Fatline({ curve, width, color }) {
//     const material = useRef()
//     // useFrame(() => (material.current.uniforms.dashOffset.value -= speed))
//     return (
//         <mesh>
//             <meshLine attach="geometry" vertices={curve} />
//             <meshLineMaterial attach="material" ref={material} transparent depthTest={false} lineWidth={width} color={color} dashArray={0.1} dashRatio={0.9} />
//         </mesh>
//     )
// }

// export function PathLine2(props) {
//     const {linewidth, points} = props;
//     const geometryRef = useRef();
    
//     useEffect(() => {
//         makeLine(geometryRef, points);
//     }, [points]);
  
//     return (
//         <>
//             <Line
//                 points={points}
//                 color={'#d6ff37'}
//                 lineWidth={linewidth}
//                 dashed={false}
//             />
//         </>
//     )
// }



// // export function BasicLine(props) {

// //     return (
// //       <mesh castShadow receiveShadow >
// //         <Line
// //             points={[[0, 0, 0], [1, 1, 1]]}       // Array of points
// //             color="black"                   // Default
// //             lineWidth={1}                   // In pixels (default)
// //             dashed={false}                  // Default
// //             vertexColors={[[0, 0, 0], [0, 0, 0]]} // Optional array of RGB values for each point
// //             // {...lineProps}                  // All THREE.Line2 props are valid
// //             // {...materialProps}              // All THREE.LineMaterial props are valid
// //         />
// //       </mesh>
// //     )
// //   }