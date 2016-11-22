//ADDITIVE SHADER
var additiveShader = {
    uniforms: {
        tDiffuse: { type: "t", value: 0, texture: null },
        tAdd: { type: "t", value: 1, texture: null },
        fCoeff: { type: "f", value: 1.0 }
    },

    vertexShader: [
        "varying vec2 vUv;",

        "void main() {",

            "vUv = uv;",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"
    ].join("\n"),

    fragmentShader: [
        "uniform sampler2D tDiffuse;",
        "uniform sampler2D tAdd;",
        "uniform float fCoeff;",

        "varying vec2 vUv;",

        "void main() {",

            "vec4 texel = texture2D( tDiffuse, vUv );",
            "vec4 add = texture2D( tAdd, vUv );",
            "gl_FragColor = texel + add * fCoeff;",

        "}"
    ].join("\n")
}

//CUSOM BLOOM SHADER
var bloomShader = {
    uniforms:{
        
    },

    vertexShader:[
        "uniform vec3 viewVector;",
        "uniform float scale;",
        "uniform float x0;",
        "float pi = 3.14159265358979323846;",
        "varying float intensity;",

        "void main() {",
        "vec3 vNormal = normalize( normalMatrix * normal );",
        "vec3 vCamera = normalize( normalMatrix * viewVector );",
        "intensity = (pi*scale) * pow(scale,2.0) / (pow((1.0-dot(vNormal, vCamera)) - x0, 2.0) + pow(scale,2.0)) - 0.4;",

        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }"
    ].join("\n"),

    fragmentShader: [
        "uniform vec3 glowColor;",
        "varying float intensity;",
        "void main() {",
        "vec3 glow = glowColor * intensity;",
        "gl_FragColor = vec4( glow, intensity ); }"
    ].join("\n")
}



/*<script id="vertexShader" type="x-shader/x-vertex">
    uniform vec3 viewVector;
    uniform float scale;
    uniform float x0;
    float pi = 3.14159265358979323846;
    varying float intensity;
    void main()
    {
      vec3 vNormal = normalize( normalMatrix * normal );
      vec3 vCamera = normalize( normalMatrix * viewVector );
      intensity =  1.0;// (pi*scale) * pow(scale,2.0) / (pow((1.0-dot(vNormal, vCamera)) - x0, 2.0) + pow(scale,2.0)) - 0.4; // Cauchy distribution


      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
    </script>

    <!-- fragment shader a.k.a. pixel shader -->
    <script id="fragmentShader" type="x-shader/x-vertex">
    uniform vec3 glowColor;
    varying float intensity;
    void main()
    {
      vec3 glow = glowColor * intensity;
        gl_FragColor = vec4( glow, intensity );
    }
    </script>*/
    