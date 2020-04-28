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
   float minimum;
   float maximum;
}params;

#pragma parameterminimumí0.050.01.00.01
#pragma parametermaximumí0.080.01.00.01

layout(std140) uniform UBO
{
   mat4 MVP;
}global;









vec4 Ai = vec4(1.0, - 1.0, - 1.0, 1.0);
vec4 B45 = vec4(1.0, 1.0, - 1.0, - 1.0);
vec4 C45 = vec4(1.5, 0.5, - 0.5, 0.5);
vec4 B30 = vec4(0.5, 2.0, - 0.5, - 2.0);
vec4 C30 = vec4(1.0, 1.0, - 0.5, 0.0);
vec4 B60 = vec4(2.0, 0.5, - 2.0, - 0.5);
vec4 C60 = vec4(2.0, 0.0, - 1.0, 0.5);

vec4 M45 = vec4(0.4, 0.4, 0.4, 0.4);
vec4 M30 = vec4(0.2, 0.4, 0.2, 0.4);
vec4 M60 = M30 . yxwz;
vec4 Mshift = vec4(0.2);


float coef = 2.0;

vec4 threshold = vec4(0.32);


vec3 lum = vec3(0.21, 0.72, 0.07);


bvec4 _and_(bvec4 A, bvec4 B){
 return bvec4(A . x && B . x, A . y && B . y, A . z && B . z, A . w && B . w);
}


bvec4 _or_(bvec4 A, bvec4 B){
 return bvec4(A . x || B . x, A . y || B . y, A . z || B . z, A . w || B . w);
}


vec4 lum_to(vec3 v0, vec3 v1, vec3 v2, vec3 v3){
 return vec4(dot(lum, v0), dot(lum, v1), dot(lum, v2), dot(lum, v3));
}


vec4 lum_df(vec4 A, vec4 B){
 return abs(A - B);
}


bvec4 lum_eq(vec4 A, vec4 B){
 return lessThan(lum_df(A, B), threshold);
}

vec4 lum_wd(vec4 a, vec4 b, vec4 c, vec4 d, vec4 e, vec4 f, vec4 g, vec4 h){
 return lum_df(a, b)+ lum_df(a, c)+ lum_df(d, e)+ lum_df(d, f)+ 4.0 * lum_df(g, h);
}


float c_df(vec3 c1, vec3 c2){
 vec3 df = abs(c1 - c2);
 return df . r + df . g + df . b;
}


float thresh(float thr1, float thr2, float val){
 val =(val < thr1)? 0.0 : val;
 val =(val > thr2)? 1.0 : val;
 return val;
}


float avg_intensity(vec4 pix){
 return dot(pix . rgb, vec3(0.2126, 0.7152, 0.0722));
}

vec4 get_pixel(sampler2D tex, vec2 coords, float dx, float dy){
 return texture(tex, coords + vec2(dx, dy));
}


float IsEdge(sampler2D tex, vec2 coords){
  float dxtex = params . SourceSize . z;
  float dytex = params . SourceSize . w;
  int k = - 1;
  float delta;

  float pix[9];

  for(int i = - 1;i < 2;i ++){
   for(int j = - 1;j < 2;j ++){
    k ++;
    pix[k]= avg_intensity(get_pixel(tex, coords, float(i)* dxtex,
                                          float(j)* dytex));
   }
  }


  float delta_lum =(abs(pix[1]- pix[7])+
          abs(pix[5]- pix[3])+
          abs(pix[0]- pix[8])+
          abs(pix[2]- pix[6])
           )/ 4.;


































  return thresh(params . minimum, params . maximum, clamp(delta_lum, 0.0, 1.0));
}

float normpdf(in float x, in float sigma)
{
 return 0.39894 * exp(- 0.5 * x * x /(sigma * sigma))/ sigma;
}

layout(location = 0) in vec2 tc;
layout(location = 1) in vec4 xyp_1_2_3;
layout(location = 2) in vec4 xyp_5_10_15;
layout(location = 3) in vec4 xyp_6_7_8;
layout(location = 4) in vec4 xyp_9_14_9;
layout(location = 5) in vec4 xyp_11_12_13;
layout(location = 6) in vec4 xyp_16_17_18;
layout(location = 7) in vec4 xyp_21_22_23;
layout(location = 0) out vec4 FragColor;
uniform sampler2D Source;

vec4 Sharp(sampler2D tex, vec2 tc, vec4 xyp_1_2_3, vec4 xyp_5_10_15, vec4 xyp_6_7_8, vec4 xyp_9_14_9, vec4 xyp_11_12_13, vec4 xyp_16_17_18, vec4 xyp_21_22_23){















 vec3 P1 = texture(Source, xyp_1_2_3 . xw). rgb;
 vec3 P2 = texture(Source, xyp_1_2_3 . yw). rgb;
 vec3 P3 = texture(Source, xyp_1_2_3 . zw). rgb;

 vec3 P6 = texture(Source, xyp_6_7_8 . xw). rgb;
 vec3 P7 = texture(Source, xyp_6_7_8 . yw). rgb;
 vec3 P8 = texture(Source, xyp_6_7_8 . zw). rgb;

 vec3 P11 = texture(Source, xyp_11_12_13 . xw). rgb;
 vec3 P12 = texture(Source, xyp_11_12_13 . yw). rgb;
 vec3 P13 = texture(Source, xyp_11_12_13 . zw). rgb;

 vec3 P16 = texture(Source, xyp_16_17_18 . xw). rgb;
 vec3 P17 = texture(Source, xyp_16_17_18 . yw). rgb;
 vec3 P18 = texture(Source, xyp_16_17_18 . zw). rgb;

 vec3 P21 = texture(Source, xyp_21_22_23 . xw). rgb;
 vec3 P22 = texture(Source, xyp_21_22_23 . yw). rgb;
 vec3 P23 = texture(Source, xyp_21_22_23 . zw). rgb;

 vec3 P5 = texture(Source, xyp_5_10_15 . xy). rgb;
 vec3 P10 = texture(Source, xyp_5_10_15 . xz). rgb;
 vec3 P15 = texture(Source, xyp_5_10_15 . xw). rgb;

 vec3 P9 = texture(Source, xyp_9_14_9 . xy). rgb;
 vec3 P14 = texture(Source, xyp_9_14_9 . xz). rgb;
 vec3 P19 = texture(Source, xyp_9_14_9 . xw). rgb;



 vec4 p7 = lum_to(P7, P11, P17, P13);
 vec4 p8 = lum_to(P8, P6, P16, P18);
 vec4 p11 = p7 . yzwx;
 vec4 p12 = lum_to(P12, P12, P12, P12);
 vec4 p13 = p7 . wxyz;
 vec4 p14 = lum_to(P14, P2, P10, P22);
 vec4 p16 = p8 . zwxy;
 vec4 p17 = p7 . zwxy;
 vec4 p18 = p8 . wxyz;
 vec4 p19 = lum_to(P19, P3, P5, P21);
 vec4 p22 = p14 . wxyz;
 vec4 p23 = lum_to(P23, P9, P1, P15);


 vec2 fp = fract(tc * params . SourceSize . xy);


 vec4 ma45 = smoothstep(C45 - M45, C45 + M45, Ai * fp . y + B45 * fp . x);
 vec4 ma30 = smoothstep(C30 - M30, C30 + M30, Ai * fp . y + B30 * fp . x);
 vec4 ma60 = smoothstep(C60 - M60, C60 + M60, Ai * fp . y + B60 * fp . x);
 vec4 marn = smoothstep(C45 - M45 + Mshift, C45 + M45 + Mshift, Ai * fp . y + B45 * fp . x);


 vec4 e45 = lum_wd(p12, p8, p16, p18, p22, p14, p17, p13);
 vec4 econt = lum_wd(p17, p11, p23, p13, p7, p19, p12, p18);
 vec4 e30 = lum_df(p13, p16);
 vec4 e60 = lum_df(p8, p17);


 bvec4 r45_1 = _and_(notEqual(p12, p13), notEqual(p12, p17));
 bvec4 r45_2 = _and_(not(lum_eq(p13, p7)), not(lum_eq(p13, p8)));
 bvec4 r45_3 = _and_(not(lum_eq(p17, p11)), not(lum_eq(p17, p16)));
 bvec4 r45_4_1 = _and_(not(lum_eq(p13, p14)), not(lum_eq(p13, p19)));
 bvec4 r45_4_2 = _and_(not(lum_eq(p17, p22)), not(lum_eq(p17, p23)));
 bvec4 r45_4 = _and_(lum_eq(p12, p18), _or_(r45_4_1, r45_4_2));
 bvec4 r45_5 = _or_(lum_eq(p12, p16), lum_eq(p12, p8));
 bvec4 r45 = _and_(r45_1, _or_(_or_(_or_(r45_2, r45_3), r45_4), r45_5));
 bvec4 r30 = _and_(notEqual(p12, p16), notEqual(p11, p16));
 bvec4 r60 = _and_(notEqual(p12, p8), notEqual(p7, p8));


 bvec4 edr45 = _and_(lessThan(e45, econt), r45);
 bvec4 edrrn = lessThanEqual(e45, econt);
 bvec4 edr30 = _and_(lessThanEqual(coef * e30, e60), r30);
 bvec4 edr60 = _and_(lessThanEqual(coef * e60, e30), r60);


 vec4 final45 = vec4(_and_(_and_(not(edr30), not(edr60)), edr45));
 vec4 final30 = vec4(_and_(_and_(edr45, not(edr60)), edr30));
 vec4 final60 = vec4(_and_(_and_(edr45, not(edr30)), edr60));
 vec4 final36 = vec4(_and_(_and_(edr60, edr30), edr45));
 vec4 finalrn = vec4(_and_(not(edr45), edrrn));


 vec4 px = step(lum_df(p12, p17), lum_df(p12, p13));



 vec4 mac = final36 * max(ma30, ma60)+ final30 * ma30 + final60 * ma60 + final45 * ma45 + finalrn * marn;








 vec3 res1 = P12;
 res1 = mix(res1, mix(P13, P17, px . x), mac . x);
 res1 = mix(res1, mix(P7, P13, px . y), mac . y);
 res1 = mix(res1, mix(P11, P7, px . z), mac . z);
 res1 = mix(res1, mix(P17, P11, px . w), mac . w);

 vec3 res2 = P12;
 res2 = mix(res2, mix(P17, P11, px . w), mac . w);
 res2 = mix(res2, mix(P11, P7, px . z), mac . z);
 res2 = mix(res2, mix(P7, P13, px . y), mac . y);
 res2 = mix(res2, mix(P13, P17, px . x), mac . x);

 return vec4(mix(res1, res2, step(c_df(P12, res1), c_df(P12, res2))), 1.0);
}

vec4 Smooth(sampler2D tex, vec2 tc){


  const int mSize = 7;
  int kSize =(mSize - 1)/ 2;
  float kernel[mSize];
  vec3 final_colour = vec3(0.0);


  float sigma = 7.0;
  float Z = 0.0;
  for(int j = 0;j <= kSize;++ j)
  {
   kernel[kSize + j]= kernel[kSize - j]= normpdf(float(j), sigma);
  }


  for(int j = 0;j < mSize;++ j)
  {
   Z += kernel[j];
  }


  for(int i = - kSize;i <= kSize;++ i)
  {
   for(int j = - kSize;j <= kSize;++ j)
   {
    final_colour += kernel[kSize + j]* kernel[kSize + i]* texture(Source,((tc . xy * params . OutputSize . xy). xy + vec2(float(i), float(j)))/ params . OutputSize . xy). rgb;

   }
  }

  return vec4(final_colour /(Z * Z), 1.0);
}

void main()
{
 float test = IsEdge(Source, tc);
 vec4 hybrid = vec4(0.0);
 hybrid =(test < 0.5)? Smooth(Source, tc): Sharp(Source, tc, xyp_1_2_3, xyp_5_10_15, xyp_6_7_8, xyp_9_14_9, xyp_11_12_13, xyp_16_17_18, xyp_21_22_23);

   FragColor = hybrid;
}
