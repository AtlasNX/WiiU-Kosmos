#version 150
#define float2 vec2
#define float3 vec3
#define float4 vec4






















uniform Push
{
   vec4 SourceSize;
   vec4 OriginalSize;
   vec4 OutputSize;
   uint FrameCount;
   float SPOT_WIDTH;
   float SPOT_HEIGHT;
   float COLOR_BOOST;
   float InputGamma;
   float OutputGamma;
}params;



#pragma parameterSPOT_WIDTH¡0.90.11.50.05
#pragma parameterSPOT_HEIGHT¡0.650.11.50.05

#pragma parameterCOLOR_BOOST¡1.451.02.00.05

#pragma parameterInputGamma¡2.40.05.00.1
#pragma parameterOutputGamma¡2.20.05.00.1

layout(std140) uniform UBO
{
   mat4 MVP;
}global;

layout(location = 0) in vec2 vTexCoord;
layout(location = 1) in vec2 onex;
layout(location = 2) in vec2 oney;
layout(location = 0) out vec4 FragColor;
uniform sampler2D Source;












void main()
{
   vec2 coords =(vTexCoord * params . SourceSize . xy);
   vec2 pixel_center = floor(coords)+ vec2(0.5, 0.5);
   vec2 texture_coords = pixel_center * params . SourceSize . zw;

   vec4 color = pow(texture(Source, texture_coords), vec4(params . InputGamma));

   float dx = coords . x - pixel_center . x;

   float h_weight_00 = dx / params . SPOT_WIDTH;
                       if(h_weight_00 > 1.0)h_weight_00 = 1.0;h_weight_00 = 1.0 - h_weight_00 * h_weight_00;h_weight_00 = h_weight_00 * h_weight_00;;

   color *= vec4(h_weight_00, h_weight_00, h_weight_00, h_weight_00);


   vec2 coords01;
   if(dx > 0.0){
      coords01 = onex;
      dx = 1.0 - dx;
   } else {
      coords01 = - onex;
      dx = 1.0 + dx;
   }
   vec4 colorNB = pow(texture(Source, texture_coords + coords01), vec4(params . InputGamma));

   float h_weight_01 = dx / params . SPOT_WIDTH;
                       if(h_weight_01 > 1.0)h_weight_01 = 1.0;h_weight_01 = 1.0 - h_weight_01 * h_weight_01;h_weight_01 = h_weight_01 * h_weight_01;;

   color = color + colorNB * vec4(h_weight_01);



   float dy = coords . y - pixel_center . y;
   float v_weight_00 = dy / params . SPOT_HEIGHT;
                       if(v_weight_00 > 1.0)v_weight_00 = 1.0;v_weight_00 = 1.0 - v_weight_00 * v_weight_00;v_weight_00 = v_weight_00 * v_weight_00;;
   color *= vec4(v_weight_00);


   vec2 coords10;
   if(dy > 0.0){
      coords10 = oney;
      dy = 1.0 - dy;
   } else {
      coords10 = - oney;
      dy = 1.0 + dy;
   }
   colorNB = pow(texture(Source, texture_coords + coords10), vec4(params . InputGamma));

   float v_weight_10 = dy / params . SPOT_HEIGHT;
                       if(v_weight_10 > 1.0)v_weight_10 = 1.0;v_weight_10 = 1.0 - v_weight_10 * v_weight_10;v_weight_10 = v_weight_10 * v_weight_10;;

   color = color + colorNB * vec4(v_weight_10 * h_weight_00, v_weight_10 * h_weight_00, v_weight_10 * h_weight_00, v_weight_10 * h_weight_00);

   colorNB = pow(texture(Source, texture_coords + coords01 + coords10), vec4(params . InputGamma));

   color = color + colorNB * vec4(v_weight_10 * h_weight_01, v_weight_10 * h_weight_01, v_weight_10 * h_weight_01, v_weight_10 * h_weight_01);

   color *= vec4(params . COLOR_BOOST);

   FragColor = clamp(pow(color, vec4(1.0 / params . OutputGamma)), 0.0, 1.0);
}
