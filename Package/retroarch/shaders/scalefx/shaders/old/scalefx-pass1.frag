#version 150
#define float2 vec2
#define float3 vec3
#define float4 vec4










































#pragma namesfxp1
#pragma parameterSFX_CLR�0.350.01.000.01







float THR = 1.0 - 0.35;


layout(std140) uniform UBO
{
   mat4 MVP;
   vec4 SourceSize;
};


layout(location = 0) in vec2 vTexCoord;
layout(location = 0) out vec4 FragColor;
uniform sampler2D Source;










vec4 str(vec4 crn, vec4 ort){

 return(1.0 - step(crn, vec4(THR)))* max(2.0 * crn -(ort + ort . wxyz), vec4(0.0));
}


vec4 dom(vec3 strx, vec3 stry, vec3 strz, vec3 strw){
 vec4 res;
 res . x = max(2.0 * strx . y -(strx . x + strx . z), 0.0);
 res . y = max(2.0 * stry . y -(stry . x + stry . z), 0.0);
 res . z = max(2.0 * strz . y -(strz . x + strz . z), 0.0);
 res . w = max(2.0 * strw . y -(strw . x + strw . z), 0.0);
 return res;
}


float clear(vec2 crn, vec4 ort){

 vec4 res = step(crn . xyxy, vec4(THR))+ step(crn . xyxy, ort)+ step(crn . xyxy, ort . wxyz);
 return min(res . x * res . y * res . z * res . w, 1.0);
}


void main()
{














 vec4 A = textureOffset(Source, vTexCoord, ivec2(- 1, - 1)), B = textureOffset(Source, vTexCoord, ivec2(0, - 1)), C = textureOffset(Source, vTexCoord, ivec2(1, - 1));
 vec4 D = textureOffset(Source, vTexCoord, ivec2(- 1, 0)), E = textureOffset(Source, vTexCoord, ivec2(0, 0)), F = textureOffset(Source, vTexCoord, ivec2(1, 0));
 vec4 G = textureOffset(Source, vTexCoord, ivec2(- 1, 1)), H = textureOffset(Source, vTexCoord, ivec2(0, 1)), I = textureOffset(Source, vTexCoord, ivec2(1, 1));
 vec4 J = textureOffset(Source, vTexCoord, ivec2(- 1, 2)), K = textureOffset(Source, vTexCoord, ivec2(0, 2)), L = textureOffset(Source, vTexCoord, ivec2(1, 2));
 vec4 M = textureOffset(Source, vTexCoord, ivec2(- 2, - 1)), N = textureOffset(Source, vTexCoord, ivec2(- 2, 0)), O = textureOffset(Source, vTexCoord, ivec2(- 2, 1));
 vec4 P = textureOffset(Source, vTexCoord, ivec2(2, - 1)), Q = textureOffset(Source, vTexCoord, ivec2(2, 0)), R = textureOffset(Source, vTexCoord, ivec2(2, 1));



 vec4 As = str(vec4(M . z, B . x, D . zx), vec4(A . yw, D . y, M . w));
 vec4 Bs = str(vec4(A . z, C . x, E . zx), vec4(B . yw, E . y, A . w));
 vec4 Cs = str(vec4(B . z, P . x, F . zx), vec4(C . yw, F . y, B . w));
 vec4 Ds = str(vec4(N . z, E . x, G . zx), vec4(D . yw, G . y, N . w));
 vec4 Es = str(vec4(D . z, F . x, H . zx), vec4(E . yw, H . y, D . w));
 vec4 Fs = str(vec4(E . z, Q . x, I . zx), vec4(F . yw, I . y, E . w));
 vec4 Gs = str(vec4(O . z, H . x, J . zx), vec4(G . yw, J . y, O . w));
 vec4 Hs = str(vec4(G . z, I . x, K . zx), vec4(H . yw, K . y, G . w));
 vec4 Is = str(vec4(H . z, R . x, L . zx), vec4(I . yw, L . y, H . w));


 vec4 jSx = vec4(As . z, Bs . w, Es . x, Ds . y), jDx = dom(As . yzw, Bs . zwx, Es . wxy, Ds . xyz);
 vec4 jSy = vec4(Bs . z, Cs . w, Fs . x, Es . y), jDy = dom(Bs . yzw, Cs . zwx, Fs . wxy, Es . xyz);
 vec4 jSz = vec4(Es . z, Fs . w, Is . x, Hs . y), jDz = dom(Es . yzw, Fs . zwx, Is . wxy, Hs . xyz);
 vec4 jSw = vec4(Ds . z, Es . w, Hs . x, Gs . y), jDw = dom(Ds . yzw, Es . zwx, Hs . wxy, Gs . xyz);








 vec4 jx =(1.0 - step(jDx, vec4(0.0)))*(1.0 - step(jDx + jDx . zwxy, jDx . yzwx + jDx . wxyz));
 vec4 jy =(1.0 - step(jDy, vec4(0.0)))*(1.0 - step(jDy + jDy . zwxy, jDy . yzwx + jDy . wxyz));
 vec4 jz =(1.0 - step(jDz, vec4(0.0)))*(1.0 - step(jDz + jDz . zwxy, jDz . yzwx + jDz . wxyz));
 vec4 jw =(1.0 - step(jDw, vec4(0.0)))*(1.0 - step(jDw + jDw . zwxy, jDw . yzwx + jDw . wxyz));








 vec4 res;
 res . x = min(jx . z +((1.0 -(jx . y))*(1.0 -(jx . w)))*((1.0 - step(jSx . z, 0.0))*(jx . x +(1.0 - step(jSx . x + jSx . z, jSx . y + jSx . w)))), 1.0);
 res . y = min(jy . w +((1.0 -(jy . z))*(1.0 -(jy . x)))*((1.0 - step(jSy . w, 0.0))*(jy . y +(1.0 - step(jSy . y + jSy . w, jSy . x + jSy . z)))), 1.0);
 res . z = min(jz . x +((1.0 -(jz . w))*(1.0 -(jz . y)))*((1.0 - step(jSz . x, 0.0))*(jz . z +(1.0 - step(jSz . x + jSz . z, jSz . y + jSz . w)))), 1.0);
 res . w = min(jw . y +((1.0 -(jw . x))*(1.0 -(jw . z)))*((1.0 - step(jSw . y, 0.0))*(jw . w +(1.0 - step(jSw . y + jSw . w, jSw . x + jSw . z)))), 1.0);




 res = min(res *(vec4(jx . z, jy . w, jz . x, jw . y)+(1.0 -(res . wxyz * res . yzwx))), vec4(1.0));




 vec4 clr;
 clr . x = clear(vec2(D . z, E . x), vec4(A . w, E . y, D . wy));
 clr . y = clear(vec2(E . z, F . x), vec4(B . w, F . y, E . wy));
 clr . z = clear(vec2(H . z, I . x), vec4(E . w, I . y, H . wy));
 clr . w = clear(vec2(G . z, H . x), vec4(D . w, H . y, G . wy));

 vec4 low = max(vec4(E . yw, H . y, D . w), vec4(THR));

 vec4 hori = vec4(low . x < max(D . w, A . w), low . x < max(E . w, B . w), low . z < max(E . w, H . w), low . z < max(D . w, G . w))* clr;
 vec4 vert = vec4(low . w < max(E . y, D . y), low . y < max(E . y, F . y), low . y < max(H . y, I . y), low . w < max(H . y, G . y))* clr;
 vec4 orie = vec4(A . w < D . y, B . w <= F . y, H . w < I . y, G . w <= G . y);

 FragColor =(res + 2.0 * hori + 4.0 * vert + 8.0 * orie)/ 15.0;
}
