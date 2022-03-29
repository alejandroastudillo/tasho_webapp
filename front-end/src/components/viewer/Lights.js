export const Lights = () => {

    return (
        <>
            <hemisphereLight
            skyColor={"#455A64"}
            groundColor={"#000"}
            intensity={0.5}
            position={[0, 1, 0]}
            />
            <directionalLight
            color={0xffffff}
            position={[4, 10, 1]}
            shadowMapWidth={2048}
            shadowMapHeight={2048}
            castShadow
            />
        </>
    )
}