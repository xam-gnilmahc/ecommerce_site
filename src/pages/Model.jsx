import React, { useEffect, useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export function Model({ color, ...props }) {
  const { nodes, materials } = useGLTF("/iphone.glb");
  const modelRef = useRef();

  const [scale, setScale] = useState([1, 1, 1]);
  const [position, setPosition] = useState([0, 0, 0]);

  useEffect(() => {
    function updateScale() {
      const width = window.innerWidth;
  
      if (width < 600) {
        setScale([4.5, 4, 7]); // ⬅️ Reduced width (X) and height (Y)
        setPosition([0, -1, 0]);
      } else if (width >= 600 && width < 1200) {
        setScale([5.5, 4.5, 8]); // ⬅️ Adjusted X and Y
        setPosition([0, 0, 0]);
      } else {
        setScale([6.5, 5.5, 10]); // ⬅️ Reduced width and height for larger screens
        setPosition([0, 0, 0]);
      }
    }
  
    updateScale();
  
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);
  
useFrame(() => {
  if (modelRef.current) {
    modelRef.current.rotation.y += 0.01; // ✅ Horizontal rotation
  }
});


  useEffect(() => {
    Object.values(materials).forEach((material) => {
      material.color.set(color);
    });
  }, [color, materials]);

  // Log nodes to inspect the structure
  useEffect(() => {
    console.log("Loaded nodes:", nodes);
    console.log("Loaded materials:", materials);
  }, [nodes, materials]);

  return (
    <group
      ref={modelRef}
      {...props}
      dispose={null}
      position={position}
      scale={scale}
      rotation={[-Math.PI / -1, Math.PI, 0]} 
    >
      {/* Dynamically render all meshes */}
      {Object.entries(nodes).map(([key, node]) => {
        if (node.type === "Mesh") {
          return (
            <mesh
              key={key}
              geometry={node.geometry}
              material={node.material}
              position={[0, 0, 0]} // You can adjust the position if needed
              rotation={[Math.PI / 2, 0, 0]} // Adjust for vertical alignment
            />
          );
        }
        return null;
      })}
    </group>
  );
}

useGLTF.preload("/iphone.glb");
