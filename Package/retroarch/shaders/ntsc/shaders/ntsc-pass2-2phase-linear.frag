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

mat3 yiq2rgb_mat = mat3(
   1.0, 0.956, 0.6210,
   1.0, - 0.2720, - 0.6474,
   1.0, - 1.1060, 1.7046);

vec3 yiq2rgb(vec3 yiq)
{
   return yiq * yiq2rgb_mat;
}

mat3 yiq_mat = mat3(
      0.2989, 0.5870, 0.1140,
      0.5959, - 0.2744, - 0.3216,
      0.2115, - 0.5229, 0.3114
);

vec3 rgb2yiq(vec3 col)
{
   return col * yiq_mat;
}

float luma_filter[32 + 1]= float[32 + 1](
   - 0.000174844,
   - 0.000205844,
   - 0.000149453,
   - 0.000051693,
   0.000000000,
   - 0.000066171,
   - 0.000245058,
   - 0.000432928,
   - 0.000472644,
   - 0.000252236,
   0.000198929,
   0.000687058,
   0.000944112,
   0.000803467,
   0.000363199,
   0.000013422,
   0.000253402,
   0.001339461,
   0.002932972,
   0.003983485,
   0.003026683,
   - 0.001102056,
   - 0.008373026,
   - 0.016897700,
   - 0.022914480,
   - 0.021642347,
   - 0.008863273,
   0.017271957,
   0.054921920,
   0.098342579,
   0.139044281,
   0.168055832,
   0.178571429);

float chroma_filter[32 + 1]= float[32 + 1](
   0.001384762,
   0.001678312,
   0.002021715,
   0.002420562,
   0.002880460,
   0.003406879,
   0.004004985,
   0.004679445,
   0.005434218,
   0.006272332,
   0.007195654,
   0.008204665,
   0.009298238,
   0.010473450,
   0.011725413,
   0.013047155,
   0.014429548,
   0.015861306,
   0.017329037,
   0.018817382,
   0.020309220,
   0.021785952,
   0.023227857,
   0.024614500,
   0.025925203,
   0.027139546,
   0.028237893,
   0.029201910,
   0.030015081,
   0.030663170,
   0.031134640,
   0.031420995,
   0.031517031);






layout(location = 0) in vec2 vTexCoord;
layout(location = 0) out vec4 FragColor;
uniform sampler2D Source;

void main()
{
 float one_x = 1.0 / global . SourceSize . x;
vec3 signal = vec3(0.0);
for(int i = 0;i < 32;i ++)
{
   float offset = float(i);

   vec3 sums = texture(Source, vTexCoord + vec2((offset - float(32))*(one_x), 0.0)). xyz +
                                              texture(Source, vTexCoord + vec2((float(32)- offset)*(one_x), 0.0)). xyz;

   signal += sums * vec3(luma_filter[i], chroma_filter[i], chroma_filter[i]);
}
signal += texture(Source, vTexCoord). xyz *
   vec3(luma_filter[32], chroma_filter[32], chroma_filter[32]);
vec3 rgb = yiq2rgb(signal);
FragColor = vec4(pow(rgb, vec3(2.4)), 1.0);
}
