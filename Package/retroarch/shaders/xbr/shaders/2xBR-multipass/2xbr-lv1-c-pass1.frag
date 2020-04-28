#version 150
#define float2 vec2
#define float3 vec3
#define float4 vec4

layout(std140) uniform UBO
{
   mat4 MVP;
   vec4 OutputSize;
   vec4 OriginalSize;
   vec4 SourceSize;
}global;

layout(location = 0) in vec2 vTexCoord;
layout(location = 1) in vec4 t1;
layout(location = 0) out vec4 FragColor;
uniform sampler2D Source;
uniform sampler2D Original;

mat4x2 sym_vectors = mat4x2(1, 1, 1, - 1, - 1, - 1, - 1, 1);

float remapFrom01(float v, float high)
{
   return(high * v + 0.5);
}

vec2 unpack_info(float i)
{
   vec2 info;
   info . x = round(modf(i / 2.0f, i));
   info . y = i;

   return info;
}

void main()
{

   vec2 OriginalCoord = floor(global . OriginalSize . xy * vTexCoord);
   OriginalCoord =(OriginalCoord + 0.5)* global . OriginalSize . zw;

   float px, edr;

   vec2 pos = fract(vTexCoord * global . SourceSize . xy)- vec2(0.5, 0.5);
   vec2 dir = sign(pos);

   vec2 g1 = dir * t1 . xy;
   vec2 g2 = dir * t1 . zw;

   vec3 F = texture(Original, OriginalCoord + g1). rgb;
   vec3 H = texture(Original, OriginalCoord + g2). rgb;
   vec3 E = texture(Original, OriginalCoord). rgb;

   vec4 icomp = round(clamp(dir * sym_vectors, vec4(0.0), vec4(1.0)));
   float info = remapFrom01(dot(texture(Source, vTexCoord), icomp), 255.0f);
   vec2 flags = unpack_info(info);

   edr = flags . x;
   px = flags . y;

   vec3 color = mix(E, mix(H, F, px), edr * 0.5);

   FragColor = vec4(color, 1.0);
}
