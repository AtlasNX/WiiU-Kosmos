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
   float XBR_Y_WEIGHT;
   float XBR_EQ_THRESHOLD;
   float XBR_LV1_COEFFICIENT;
   float XBR_LV2_COEFFICIENT;
   float XBR_RES;
   float XBR_SCALE;
}params;

#pragma parameterXBR_Y_WEIGHT�48.00.0100.01.0
#pragma parameterXBR_EQ_THRESHOLD�15.00.050.01.0
#pragma parameterXBR_LV1_COEFFICIENT�0.50.030.00.5
#pragma parameterXBR_LV2_COEFFICIENT�2.01.03.00.1
#pragma parameterXBR_RES�2.01.08.01.0
#pragma parameterXBR_SCALE�3.01.05.01.0











layout(std140) uniform UBO
{
   mat4 MVP;
}global;













float coef = 2.0;
vec3 rgbw = vec3(14.352, 28.176, 5.472);
vec4 eq_threshold = vec4(15.0, 15.0, 15.0, 15.0);

vec4 delta = vec4(1.0 / params . XBR_SCALE, 1.0 / params . XBR_SCALE, 1.0 / params . XBR_SCALE, 1.0 / params . XBR_SCALE);
vec4 delta_l = vec4(0.5 / params . XBR_SCALE, 1.0 / params . XBR_SCALE, 0.5 / params . XBR_SCALE, 1.0 / params . XBR_SCALE);
vec4 delta_u = delta_l . yxwz;

vec4 Ao = vec4(1.0, - 1.0, - 1.0, 1.0);
vec4 Bo = vec4(1.0, 1.0, - 1.0, - 1.0);
vec4 Co = vec4(1.5, 0.5, - 0.5, 0.5);
vec4 Ax = vec4(1.0, - 1.0, - 1.0, 1.0);
vec4 Bx = vec4(0.5, 2.0, - 0.5, - 2.0);
vec4 Cx = vec4(1.0, 1.0, - 0.5, 0.0);
vec4 Ay = vec4(1.0, - 1.0, - 1.0, 1.0);
vec4 By = vec4(2.0, 0.5, - 2.0, - 0.5);
vec4 Cy = vec4(2.0, 0.0, - 1.0, 0.5);
vec4 Ci = vec4(0.25, 0.25, 0.25, 0.25);

vec3 Y = vec3(0.2126, 0.7152, 0.0722);


vec4 df(vec4 A, vec4 B)
{
    return vec4(abs(A - B));
}


bvec4 eq(vec4 A, vec4 B)
{
    return(lessThan(df(A, B), vec4(params . XBR_EQ_THRESHOLD)));
}

vec4 weighted_distance(vec4 a, vec4 b, vec4 c, vec4 d, vec4 e, vec4 f, vec4 g, vec4 h)
{
 return(df(a, b)+ df(a, c)+ df(d, e)+ df(d, f)+ 4.0 * df(g, h));
}

float c_df(vec3 c1, vec3 c2)
{
      vec3 df = abs(c1 - c2);
      return df . r + df . g + df . b;
}

layout(location = 0) in vec2 vTexCoord;
layout(location = 1) in vec4 t1;
layout(location = 0) out vec4 FragColor;
uniform sampler2D Source;

void main()
{
 bvec4 edri, edr, edr_left, edr_up, px;
 bvec4 interp_restriction_lv0, interp_restriction_lv1, interp_restriction_lv2_left, interp_restriction_lv2_up, block_3d, block_3d_left, block_3d_up;
 vec4 fx, fx_left, fx_up;

 vec4 delta = vec4(1.0 / params . XBR_SCALE, 1.0 / params . XBR_SCALE, 1.0 / params . XBR_SCALE, 1.0 / params . XBR_SCALE);
 vec4 deltaL = vec4(0.5 / params . XBR_SCALE, 1.0 / params . XBR_SCALE, 0.5 / params . XBR_SCALE, 1.0 / params . XBR_SCALE);
 vec4 deltaU = deltaL . yxwz;

 vec2 fp = fract(vTexCoord * params . SourceSize . xy / params . XBR_RES);

 vec2 tex =(floor(vTexCoord * params . SourceSize . xy / params . XBR_RES)+ vec2(0.5, 0.5))* params . XBR_RES / params . SourceSize . xy;

 vec2 dx = t1 . xy;
 vec2 dy = t1 . zw;

 vec3 A = texture(Source, vTexCoord - dx - dy). xyz;
 vec3 B = texture(Source, vTexCoord - dy). xyz;
 vec3 C = texture(Source, vTexCoord + dx - dy). xyz;
 vec3 D = texture(Source, vTexCoord - dx). xyz;
 vec3 E = texture(Source, vTexCoord). xyz;
 vec3 F = texture(Source, vTexCoord + dx). xyz;
 vec3 G = texture(Source, vTexCoord - dx + dy). xyz;
 vec3 H = texture(Source, vTexCoord + dy). xyz;
 vec3 I = texture(Source, vTexCoord + dx + dy). xyz;

 vec3 A1 = texture(Source, vTexCoord - dx - 2.0 * dy). xyz;
 vec3 B1 = texture(Source, vTexCoord - 2.0 * dy). xyz;
 vec3 C1 = texture(Source, vTexCoord + dx - 2.0 * dy). xyz;
 vec3 G5 = texture(Source, vTexCoord - dx + 2.0 * dy). xyz;
 vec3 H5 = texture(Source, vTexCoord + 2.0 * dy). xyz;
 vec3 I5 = texture(Source, vTexCoord + dx + 2.0 * dy). xyz;
 vec3 A0 = texture(Source, vTexCoord - 2.0 * dx - dy). xyz;
 vec3 D0 = texture(Source, vTexCoord - 2.0 * dx). xyz;
 vec3 G0 = texture(Source, vTexCoord - 2.0 * dx + dy). xyz;
 vec3 C4 = texture(Source, vTexCoord + 2.0 * dx - dy). xyz;
 vec3 F4 = texture(Source, vTexCoord + 2.0 * dx). xyz;
 vec3 I4 = texture(Source, vTexCoord + 2.0 * dx + dy). xyz;

 vec3 F6 = texture(Source, tex + dx + 0.25 * dx + 0.25 * dy). xyz;
 vec3 F7 = texture(Source, tex + dx + 0.25 * dx - 0.25 * dy). xyz;
 vec3 F8 = texture(Source, tex + dx - 0.25 * dx - 0.25 * dy). xyz;
 vec3 F9 = texture(Source, tex + dx - 0.25 * dx + 0.25 * dy). xyz;

 vec3 B6 = texture(Source, tex + 0.25 * dx + 0.25 * dy - dy). xyz;
 vec3 B7 = texture(Source, tex + 0.25 * dx - 0.25 * dy - dy). xyz;
 vec3 B8 = texture(Source, tex - 0.25 * dx - 0.25 * dy - dy). xyz;
 vec3 B9 = texture(Source, tex - 0.25 * dx + 0.25 * dy - dy). xyz;

 vec3 D6 = texture(Source, tex - dx + 0.25 * dx + 0.25 * dy). xyz;
 vec3 D7 = texture(Source, tex - dx + 0.25 * dx - 0.25 * dy). xyz;
 vec3 D8 = texture(Source, tex - dx - 0.25 * dx - 0.25 * dy). xyz;
 vec3 D9 = texture(Source, tex - dx - 0.25 * dx + 0.25 * dy). xyz;

 vec3 H6 = texture(Source, tex + 0.25 * dx + 0.25 * dy + dy). xyz;
 vec3 H7 = texture(Source, tex + 0.25 * dx - 0.25 * dy + dy). xyz;
 vec3 H8 = texture(Source, tex - 0.25 * dx - 0.25 * dy + dy). xyz;
 vec3 H9 = texture(Source, tex - 0.25 * dx + 0.25 * dy + dy). xyz;

 float y_weight = params . XBR_Y_WEIGHT;

 vec4 b =(y_weight * Y * mat4x3(B, D, H, F));
 vec4 c =(y_weight * Y * mat4x3(C, A, G, I));
 vec4 e =(y_weight * Y * mat4x3(E, E, E, E));
 vec4 d = b . yzwx;
 vec4 f = b . wxyz;
 vec4 g = c . zwxy;
 vec4 h = b . zwxy;
 vec4 i = c . wxyz;

 vec4 i4 =(y_weight * Y * mat4x3(I4, C1, A0, G5));
 vec4 i5 =(y_weight * Y * mat4x3(I5, C4, A1, G0));
 vec4 h5 =(y_weight * Y * mat4x3(H5, F4, B1, D0));
 vec4 f4 = h5 . yzwx;

 vec4 f0 =(y_weight * Y * mat4x3(F6, B6, D6, H6));
 vec4 f1 =(y_weight * Y * mat4x3(F7, B7, D7, H7));
 vec4 f2 =(y_weight * Y * mat4x3(F8, B8, D8, H8));
 vec4 f3 =(y_weight * Y * mat4x3(F9, B9, D9, H9));

 vec4 h0 = f0 . wxyz;
 vec4 h1 = f1 . wxyz;
 vec4 h2 = f2 . wxyz;
 vec4 h3 = f3 . wxyz;


 fx =(Ao * fp . y + Bo * fp . x);
 fx_left =(Ax * fp . y + Bx * fp . x);
 fx_up =(Ay * fp . y + By * fp . x);

 block_3d . x =((f0 . x == f1 . x && f1 . x == f2 . x && f2 . x == f3 . x)&&(h0 . x == h1 . x && h1 . x == h2 . x && h2 . x == h3 . x));
 block_3d . y =((f0 . y == f1 . y && f1 . y == f2 . y && f2 . y == f3 . y)&&(h0 . y == h1 . y && h1 . y == h2 . y && h2 . y == h3 . y));
 block_3d . z =((f0 . z == f1 . z && f1 . z == f2 . z && f2 . z == f3 . z)&&(h0 . z == h1 . z && h1 . z == h2 . z && h2 . z == h3 . z));
 block_3d . w =((f0 . w == f1 . w && f1 . w == f2 . w && f2 . w == f3 . w)&&(h0 . w == h1 . w && h1 . w == h2 . w && h2 . w == h3 . w));
 interp_restriction_lv1 . x = interp_restriction_lv0 . x =((e . x != f . x)&&(e . x != h . x)&& block_3d . x);
 interp_restriction_lv1 . y = interp_restriction_lv0 . y =((e . y != f . y)&&(e . y != h . y)&& block_3d . y);
 interp_restriction_lv1 . z = interp_restriction_lv0 . z =((e . z != f . z)&&(e . z != h . z)&& block_3d . z);
 interp_restriction_lv1 . w = interp_restriction_lv0 . w =((e . w != f . w)&&(e . w != h . w)&& block_3d . w);










 interp_restriction_lv1 . x =(interp_restriction_lv0 . x &&(! eq(f, b). x && ! eq(f, c). x || ! eq(h, d). x && ! eq(h, g). x || eq(e, i). x &&(! eq(f, f4). x && ! eq(f, i4). x || ! eq(h, h5). x && ! eq(h, i5). x)|| eq(e, g). x || eq(e, c). x));
 interp_restriction_lv1 . y =(interp_restriction_lv0 . y &&(! eq(f, b). y && ! eq(f, c). y || ! eq(h, d). y && ! eq(h, g). y || eq(e, i). y &&(! eq(f, f4). y && ! eq(f, i4). y || ! eq(h, h5). y && ! eq(h, i5). y)|| eq(e, g). y || eq(e, c). y));
 interp_restriction_lv1 . z =(interp_restriction_lv0 . z &&(! eq(f, b). z && ! eq(f, c). z || ! eq(h, d). z && ! eq(h, g). z || eq(e, i). z &&(! eq(f, f4). z && ! eq(f, i4). z || ! eq(h, h5). z && ! eq(h, i5). z)|| eq(e, g). z || eq(e, c). z));
 interp_restriction_lv1 . w =(interp_restriction_lv0 . w &&(! eq(f, b). w && ! eq(f, c). w || ! eq(h, d). w && ! eq(h, g). w || eq(e, i). w &&(! eq(f, f4). w && ! eq(f, i4). w || ! eq(h, h5). w && ! eq(h, i5). w)|| eq(e, g). w || eq(e, c). w));


 interp_restriction_lv2_left . x =((e . x != g . x)&&(d . x != g . x));
 interp_restriction_lv2_left . y =((e . y != g . y)&&(d . y != g . y));
 interp_restriction_lv2_left . z =((e . z != g . z)&&(d . z != g . z));
 interp_restriction_lv2_left . w =((e . w != g . w)&&(d . w != g . w));
 interp_restriction_lv2_up . x =((e . x != c . x)&&(b . x != c . x));
 interp_restriction_lv2_up . y =((e . y != c . y)&&(b . y != c . y));
 interp_restriction_lv2_up . z =((e . z != c . z)&&(b . z != c . z));
 interp_restriction_lv2_up . w =((e . w != c . w)&&(b . w != c . w));

 vec4 fx45i = clamp((fx + delta - Co - Ci)/(2 * delta), 0.0, 1.0);
 vec4 fx45 = clamp((fx + delta - Co)/(2 * delta), 0.0, 1.0);
 vec4 fx30 = clamp((fx_left + deltaL - Cx)/(2 * deltaL), 0.0, 1.0);
 vec4 fx60 = clamp((fx_up + deltaU - Cy)/(2 * deltaU), 0.0, 1.0);

 vec4 wd1 = weighted_distance(e, c, g, i, h5, f4, h, f);
 vec4 wd2 = weighted_distance(h, d, i5, f, i4, b, e, i);

    edri . x =(wd1 . x <= wd2 . x)&& interp_restriction_lv0 . x;
 edri . y =(wd1 . y <= wd2 . y)&& interp_restriction_lv0 . y;
 edri . z =(wd1 . z <= wd2 . z)&& interp_restriction_lv0 . z;
 edri . w =(wd1 . w <= wd2 . w)&& interp_restriction_lv0 . w;
 edr . x =(wd1 . x < wd2 . x)&& interp_restriction_lv1 . x;
 edr . y =(wd1 . y < wd2 . y)&& interp_restriction_lv1 . y;
 edr . z =(wd1 . z < wd2 . z)&& interp_restriction_lv1 . z;
 edr . w =(wd1 . w < wd2 . w)&& interp_restriction_lv1 . w;
 edr_left . x =((params . XBR_LV2_COEFFICIENT * df(f, g). x)<= df(h, c). x)&& interp_restriction_lv2_left . x && edr . x;
 edr_left . y =((params . XBR_LV2_COEFFICIENT * df(f, g). y)<= df(h, c). y)&& interp_restriction_lv2_left . y && edr . y;
 edr_left . z =((params . XBR_LV2_COEFFICIENT * df(f, g). z)<= df(h, c). z)&& interp_restriction_lv2_left . z && edr . z;
 edr_left . w =((params . XBR_LV2_COEFFICIENT * df(f, g). w)<= df(h, c). w)&& interp_restriction_lv2_left . w && edr . w;
 edr_up . x =(df(f, g). x >=(params . XBR_LV2_COEFFICIENT * df(h, c). x))&& interp_restriction_lv2_up . x && edr . x;
 edr_up . y =(df(f, g). y >=(params . XBR_LV2_COEFFICIENT * df(h, c). y))&& interp_restriction_lv2_up . y && edr . y;
 edr_up . z =(df(f, g). z >=(params . XBR_LV2_COEFFICIENT * df(h, c). z))&& interp_restriction_lv2_up . z && edr . z;
 edr_up . w =(df(f, g). w >=(params . XBR_LV2_COEFFICIENT * df(h, c). w))&& interp_restriction_lv2_up . w && edr . w;

 fx45 = vec4(edr)* fx45;
 fx30 = vec4(edr_left)* fx30;
 fx60 = vec4(edr_up)* fx60;
 fx45i = vec4(edri)* fx45i;

 px . x =(df(e, f3). x <= df(e, h1). x);
 px . y =(df(e, f3). y <= df(e, h1). y);
 px . z =(df(e, f3). z <= df(e, h1). z);
 px . w =(df(e, f3). w <= df(e, h1). w);


 vec4 maximos = max(max(fx30, fx60), max(fx45, fx45i));




 vec3 res1 = E;
 res1 = mix(res1, mix(H, F, float(px . x)), maximos . x);
 res1 = mix(res1, mix(B, D, float(px . z)), maximos . z);

 vec3 res2 = E;
 res2 = mix(res2, mix(F, B, float(px . y)), maximos . y);
 res2 = mix(res2, mix(D, H, float(px . w)), maximos . w);

 vec3 res = mix(res1, res2, step(c_df(E, res1), c_df(E, res2)));

 FragColor = vec4(res, 1.0);
}
