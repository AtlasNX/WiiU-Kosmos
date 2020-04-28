#version 150
#define float2 vec2
#define float3 vec3
#define float4 vec4










































uniform Push
{
   vec4 SourceSize;
   float SFX_RAA;
}params;


#pragma parameterSFX_RAA�2.00.010.00.05


layout(std140) uniform UBO
{
   mat4 MVP;
}global;


layout(location = 0) in vec2 vTexCoord;
layout(location = 0) out vec4 FragColor;
uniform sampler2D Source;
uniform sampler2D refpass;



vec4 loadCrn(vec4 x){
 return floor(mod(x * 80 + 0.5, 9));
}


vec4 loadMid(vec4 x){
 return floor(mod(x * 8.888888 + 0.055555, 9));
}

vec3 res2x(vec3 pre2, vec3 pre1, vec3 px, vec3 pos1, vec3 pos2)
{
 vec3 t, m;
 mat4x3 pre = mat4x3(pre2, pre1, px, pos1);
 mat4x3 pos = mat4x3(pre1, px, pos1, pos2);
 mat4x3 df = pos - pre;

 m = mix(px, 1 - px, step(px, vec3(0.5)));
 m = params . SFX_RAA * min(m, min(abs(df[1]), abs(df[2])));
 t =(7 *(df[1]+ df[2])- 3 *(df[0]+ df[3]))/ 16;
 t = clamp(t, - m, m);

 return t;
}


void main()
{










 vec4 E = texture(Source, vTexCoord);


 vec2 fc = fract(vTexCoord * params . SourceSize . xy);
 vec2 fp = floor(3.0 * fc);


 vec4 hn = texture(Source, vTexCoord + vec2(fp . x - 1, 0)/ params . SourceSize . xy);
 vec4 vn = texture(Source, vTexCoord + vec2(0, fp . y - 1)/ params . SourceSize . xy);


 vec4 crn = loadCrn(E), hc = loadCrn(hn), vc = loadCrn(vn);
 vec4 mid = loadMid(E), hm = loadMid(hn), vm = loadMid(vn);

 vec3 res = fp . y == 0 ?(fp . x == 0 ? vec3(crn . x, hc . y, vc . w): fp . x == 1 ? vec3(mid . x, 0, vm . z): vec3(crn . y, hc . x, vc . z)):(fp . y == 1 ?(fp . x == 0 ? vec3(mid . w, hm . y, 0): fp . x == 1 ? vec3(0): vec3(mid . y, hm . w, 0)):(fp . x == 0 ? vec3(crn . w, hc . z, vc . x): fp . x == 1 ? vec3(mid . z, 0, vm . x): vec3(crn . z, hc . w, vc . y)));





 vec3 E0 = textureOffset(refpass, vTexCoord, ivec2(0, 0)). rgb;
 vec3 B0 = textureOffset(refpass, vTexCoord, ivec2(0, - 1)). rgb, B1 = textureOffset(refpass, vTexCoord, ivec2(0, - 2)). rgb, H0 = textureOffset(refpass, vTexCoord, ivec2(0, 1)). rgb, H1 = textureOffset(refpass, vTexCoord, ivec2(0, 2)). rgb;
 vec3 D0 = textureOffset(refpass, vTexCoord, ivec2(- 1, 0)). rgb, D1 = textureOffset(refpass, vTexCoord, ivec2(- 2, 0)). rgb, F0 = textureOffset(refpass, vTexCoord, ivec2(1, 0)). rgb, F1 = textureOffset(refpass, vTexCoord, ivec2(2, 0)). rgb;


 vec3 sfx = res . x == 1. ? D0 : res . x == 2. ? D1 : res . x == 3. ? F0 : res . x == 4. ? F1 : res . x == 5. ? B0 : res . x == 6. ? B1 : res . x == 7. ? H0 : H1;


 vec2 w = 2. * fc - 1.;
 w . x = res . y == 0. ? w . x : 0.;
 w . y = res . z == 0. ? w . y : 0.;


 vec3 t1 = res2x(D1, D0, E0, F0, F1);
 vec3 t2 = res2x(B1, B0, E0, H0, H1);

 vec3 a = min(min(min(min(B0, D0), E0), F0), H0);
 vec3 b = max(max(max(max(B0, D0), E0), F0), H0);
 vec3 raa = clamp(E0 + w . x * t1 + w . y * t2, a, b);


 FragColor = vec4((res . x != 0.)? sfx : raa, 0.);
}
