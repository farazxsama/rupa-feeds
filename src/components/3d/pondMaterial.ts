import * as THREE from "three";

/**
 * GLOBAL POND UNIFORMS
 * Shared uniform objects: updating `.value` once per frame updates every
 * material that was patched with `patchPondMaterial`.
 */
export const pondUniforms = {
  uPondTime: { value: 0 },
  /** 0 = camera above water, 1 = camera underwater */
  uPondUnder: { value: 0 },
  /** Colour objects take on when seen from ABOVE through the water column. */
  uPondTint: { value: new THREE.Color("#12405c") },
  uCausticStrength: { value: 0.55 },
};

export const CAUSTIC_GLSL = /* glsl */ `
  // Cheap, art-directed caustic pattern: two warped sine lattices folded into
  // thin bright ridges. Far cheaper than a texture lookup chain or voronoi.
  float pondCaustic(vec2 p, float t) {
    p *= 0.85;
    vec2 q = p + vec2(sin(t * 0.31 + p.y * 0.7), cos(t * 0.27 + p.x * 0.63)) * 0.65;
    float c = sin(q.x * 2.1 + t * 0.9) * sin(q.y * 2.3 - t * 0.7);
    c += sin((q.x + q.y) * 1.7 - t * 1.1) * 0.6;
    c += sin((q.x - q.y) * 2.6 + t * 0.6) * 0.35;
    c = abs(c);
    return pow(1.0 - clamp(c * 0.75, 0.0, 1.0), 7.0);
  }
`;

interface PatchOptions {
  /** extra uniforms (merged into the shader) */
  uniforms?: Record<string, THREE.IUniform>;
  /** GLSL declarations for the vertex shader (attributes, uniforms, functions) */
  vertexHeader?: string;
  /** GLSL run after `begin_vertex` — mutate `transformed` here */
  vertexDeform?: string;
  caustics?: boolean;
}

/**
 * Patch a built-in MeshStandardMaterial with:
 *  - optional vertex deformation (fish swimming, plant sway…)
 *  - caustic light on up-facing surfaces below the waterline
 *  - depth-based absorption when the camera is ABOVE the water
 *    (underwater we rely on scene fog instead)
 * Keeping the PBR lighting of MeshStandardMaterial avoids re-writing lighting.
 */
export function patchPondMaterial<T extends THREE.MeshStandardMaterial>(mat: T, opts: PatchOptions = {}): T {
  const { uniforms = {}, vertexHeader = "", vertexDeform = "", caustics = true } = opts;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, pondUniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
         varying vec3 vPondWorld;
         uniform float uPondTime;
         ${vertexHeader}`
      )
      .replace("#include <begin_vertex>", `#include <begin_vertex>\n${vertexDeform}`)
      .replace(
        "#include <project_vertex>",
        `#include <project_vertex>
         vec4 pondWP = vec4(transformed, 1.0);
         #ifdef USE_INSTANCING
           pondWP = instanceMatrix * pondWP;
         #endif
         vPondWorld = (modelMatrix * pondWP).xyz;`
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
         varying vec3 vPondWorld;
         uniform float uPondTime;
         uniform float uPondUnder;
         uniform vec3 uPondTint;
         uniform float uCausticStrength;
         ${CAUSTIC_GLSL}`
      )
      .replace(
        "#include <opaque_fragment>",
        `
        float pondDepth = max(-vPondWorld.y, 0.0);
        ${
          caustics
            ? `
        vec3 nW = normalize(inverseTransformDirection(normal, viewMatrix));
        float up = clamp(nW.y * 0.7 + 0.3, 0.0, 1.0);
        float cst = pondCaustic(vPondWorld.xz, uPondTime);
        outgoingLight += diffuseColor.rgb * cst * up * uCausticStrength * exp(-pondDepth * 0.11) * step(0.04, pondDepth);`
            : ""
        }
        // seen from above: the water column absorbs + tints what is below it
        float absorb = 1.0 - exp(-pondDepth * 0.42);
        vec3 aboveView = mix(outgoingLight, uPondTint * (0.35 + 0.65 * exp(-pondDepth * 0.15)), absorb);
        outgoingLight = mix(aboveView, outgoingLight, uPondUnder);
        #include <opaque_fragment>`
      );
  };
  // Ensure different patch configs don't share a cached program.
  mat.customProgramCacheKey = () => `pond-${caustics}-${vertexDeform.length}-${vertexHeader.length}`;
  return mat;
}
