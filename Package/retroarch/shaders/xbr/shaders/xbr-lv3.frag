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
   float XBR_EQ_THRESHOLD2;
   float XBR_LV2_COEFFICIENT;
   float corner_type;
}params;

#pragma parameterXBR_Y_WEIGHT�48.00.0100.01.0
#pragma parameterXBR_EQ_THRESHOLD�10.00.050.01.0
#pragma parameterXBR_EQ_THRESHOLD2�2.00.04.01.0
#pragma parameterXBR_LV2_COEFFICIENT�2.01.03.01.0
#pragma parametercorner_type�3.01.03.01.0

layout(std140) uniform UBO
{
   mat4 MVP;
}global;

mat3 yuv = mat3(0.299, 0.587, 0.114, - 0.169, - 0.331, 0.499, 0.499, - 0.418, - 0.0813);
vec4 delta = vec4(0.4, 0.4, 0.4, 0.4);

vec4 df(vec4 A, vec4 B)
{
 return vec4(abs(A - B));
}

float c_df(vec3 c1, vec3 c2){
 vec3 df = abs(c1 - c2);
 return df . r + df . g + df . b;
}

bvec4 eq(vec4 A, vec4 B)
{
 return lessThan(df(A, B), vec4(params . XBR_EQ_THRESHOLD));
}

bvec4 eq2(vec4 A, vec4 B)
{
 return lessThan(df(A, B), vec4(params . XBR_EQ_THRESHOLD2));
}

bvec4 and(bvec4 A, bvec4 B)
{
 return bvec4(A . x && B . x, A . y && B . y, A . z && B . z, A . w && B . w);
}

bvec4 or(bvec4 A, bvec4 B)
{
 return bvec4(A . x || B . x, A . y || B . y, A . z || B . z, A . w || B . w);
}

vec4 weighted_distance(vec4 a, vec4 b, vec4 c, vec4 d, vec4 e, vec4 f, vec4 g, vec4 h)
{
 return(df(a, b)+ df(a, c)+ df(d, e)+ df(d, f)+ 4.0 * df(g, h));
}

layout(location = 0) in vec2 vTexCoord;
layout(location = 1) in vec4 t1;
layout(location = 2) in vec4 t2;
layout(location = 3) in vec4 t3;
layout(location = 4) in vec4 t4;
layout(location = 5) in vec4 t5;
layout(location = 6) in vec4 t6;
layout(location = 7) in vec4 t7;
layout(location = 0) out vec4 FragColor;
uniform sampler2D Source;

void main()
{
 bvec4 edr, edr_left, edr_up, edr3_left, edr3_up, px;
 bvec4 interp_restriction_lv1, interp_restriction_lv2_left, interp_restriction_lv2_up;
 bvec4 interp_restriction_lv3_left, interp_restriction_lv3_up;
 bvec4 nc, nc30, nc60, nc45, nc15, nc75;
 vec4 fx, fx_left, fx_up, finalfx, fx3_left, fx3_up;
 vec3 res1, res2, pix1, pix2;
 float blend1, blend2;

    vec2 fp = fract(vTexCoord * params . SourceSize . xy);

    vec3 A1 = texture(Source, t1 . xw). rgb;
    vec3 B1 = texture(Source, t1 . yw). rgb;
    vec3 C1 = texture(Source, t1 . zw). rgb;

    vec3 A = texture(Source, t2 . xw). rgb;
    vec3 B = texture(Source, t2 . yw). rgb;
    vec3 C = texture(Source, t2 . zw). rgb;

    vec3 D = texture(Source, t3 . xw). rgb;
    vec3 E = texture(Source, t3 . yw). rgb;
    vec3 F = texture(Source, t3 . zw). rgb;

    vec3 G = texture(Source, t4 . xw). rgb;
    vec3 H = texture(Source, t4 . yw). rgb;
    vec3 I = texture(Source, t4 . zw). rgb;

    vec3 G5 = texture(Source, t5 . xw). rgb;
    vec3 H5 = texture(Source, t5 . yw). rgb;
    vec3 I5 = texture(Source, t5 . zw). rgb;

    vec3 A0 = texture(Source, t6 . xy). rgb;
    vec3 D0 = texture(Source, t6 . xz). rgb;
    vec3 G0 = texture(Source, t6 . xw). rgb;

    vec3 C4 = texture(Source, t7 . xy). rgb;
    vec3 F4 = texture(Source, t7 . xz). rgb;
    vec3 I4 = texture(Source, t7 . xw). rgb;

 vec4 b = transpose(mat4x3(B, D, H, F))*(params . XBR_Y_WEIGHT * yuv[0]);
 vec4 c = transpose(mat4x3(C, A, G, I))*(params . XBR_Y_WEIGHT * yuv[0]);
 vec4 e = transpose(mat4x3(E, E, E, E))*(params . XBR_Y_WEIGHT * yuv[0]);
 vec4 d = b . yzwx;
 vec4 f = b . wxyz;
 vec4 g = c . zwxy;
 vec4 h = b . zwxy;
 vec4 i = c . wxyz;

 vec4 i4 = transpose(mat4x3(I4, C1, A0, G5))*(params . XBR_Y_WEIGHT * yuv[0]);
 vec4 i5 = transpose(mat4x3(I5, C4, A1, G0))*(params . XBR_Y_WEIGHT * yuv[0]);
 vec4 h5 = transpose(mat4x3(H5, F4, B1, D0))*(params . XBR_Y_WEIGHT * yuv[0]);
 vec4 f4 = h5 . yzwx;

 vec4 c1 = i4 . yzwx;
 vec4 g0 = i5 . wxyz;
 vec4 b1 = h5 . zwxy;
 vec4 d0 = h5 . wxyz;

 vec4 Ao = vec4(1.0, - 1.0, - 1.0, 1.0);
 vec4 Bo = vec4(1.0, 1.0, - 1.0, - 1.0);
 vec4 Co = vec4(1.5, 0.5, - 0.5, 0.5);
 vec4 Ax = vec4(1.0, - 1.0, - 1.0, 1.0);
 vec4 Bx = vec4(0.5, 2.0, - 0.5, - 2.0);
 vec4 Cx = vec4(1.0, 1.0, - 0.5, 0.0);
 vec4 Ay = vec4(1.0, - 1.0, - 1.0, 1.0);
 vec4 By = vec4(2.0, 0.5, - 2.0, - 0.5);
 vec4 Cy = vec4(2.0, 0.0, - 1.0, 0.5);

 vec4 Az = vec4(6.0, - 2.0, - 6.0, 2.0);
 vec4 Bz = vec4(2.0, 6.0, - 2.0, - 6.0);
 vec4 Cz = vec4(5.0, 3.0, - 3.0, - 1.0);
 vec4 Aw = vec4(2.0, - 6.0, - 2.0, 6.0);
 vec4 Bw = vec4(6.0, 2.0, - 6.0, - 2.0);
 vec4 Cw = vec4(5.0, - 1.0, - 3.0, 3.0);

 fx =(Ao * fp . y + Bo * fp . x);
 fx_left =(Ax * fp . y + Bx * fp . x);
 fx_up =(Ay * fp . y + By * fp . x);
 fx3_left =(Az * fp . y + Bz * fp . x);
 fx3_up =(Aw * fp . y + Bw * fp . x);


if(params . corner_type == 1.0)
 { interp_restriction_lv1 = and(notEqual(e, f), notEqual(e, h));}
else if(params . corner_type == 2.0)
 { interp_restriction_lv1 = and(and(notEqual(e, f), notEqual(e, h)),
         (or(or(and(and(or(and(not(eq(f, b)), not(eq(h, d))),
         eq(e, i)), not(eq(f, i4))), not(eq(h, i5))), eq(e, g)), eq(e, c))));}








else
 { interp_restriction_lv1 = and(and(notEqual(e, f), notEqual(e, h)),
                              or(or(and(not(eq(f, b)), not(eq(f, c))),
                                    and(not(eq(h, d)), not(eq(h, g)))),
                                 or(and(eq(e, i), or(and(not(eq(f, f4)), not(eq(f, i4))),
                                                    and(not(eq(h, h5)), not(eq(h, i5))))),
                                    or(eq(e, g), eq(e, c)))));}

    interp_restriction_lv2_left = and(notEqual(e, g), notEqual(d, g));
 interp_restriction_lv2_up = and(notEqual(e, c), notEqual(b, c));
 interp_restriction_lv3_left = and(eq2(g, g0), not(eq2(d0, g0)));
 interp_restriction_lv3_up = and(eq2(c, c1), not(eq2(b1, c1)));

 vec4 fx45 = smoothstep(Co - delta, Co + delta, fx);
 vec4 fx30 = smoothstep(Cx - delta, Cx + delta, fx_left);
 vec4 fx60 = smoothstep(Cy - delta, Cy + delta, fx_up);
 vec4 fx15 = smoothstep(Cz - delta, Cz + delta, fx3_left);
 vec4 fx75 = smoothstep(Cw - delta, Cw + delta, fx3_up);

 edr = and(lessThan(weighted_distance(e, c, g, i, h5, f4, h, f), weighted_distance(h, d, i5, f, i4, b, e, i)), interp_restriction_lv1);
 edr_left = and(lessThanEqual((params . XBR_LV2_COEFFICIENT * df(f, g)), df(h, c)), interp_restriction_lv2_left);
 edr_up = and(greaterThanEqual(df(f, g),(params . XBR_LV2_COEFFICIENT * df(h, c))), interp_restriction_lv2_up);
 edr3_left = interp_restriction_lv3_left;
 edr3_up = interp_restriction_lv3_up;

 nc45 = and(edr, bvec4(fx45));
 nc30 = and(edr, and(edr_left, bvec4(fx30)));
 nc60 = and(edr, and(edr_up, bvec4(fx60)));
 nc15 = and(and(edr, edr_left), and(edr3_left, bvec4(fx15)));
 nc75 = and(and(edr, edr_up), and(edr3_up, bvec4(fx75)));

    px = lessThanEqual(df(e, f), df(e, h));

    nc = bvec4(nc75 . x || nc15 . x || nc30 . x || nc60 . x || nc45 . x, nc75 . y || nc15 . y || nc30 . y || nc60 . y || nc45 . y, nc75 . z || nc15 . z || nc30 . z || nc60 . z || nc45 . z, nc75 . w || nc15 . w || nc30 . w || nc60 . w || nc45 . w);

 vec4 final45 = vec4(nc45)* fx45;
 vec4 final30 = vec4(nc30)* fx30;
 vec4 final60 = vec4(nc60)* fx60;
 vec4 final15 = vec4(nc15)* fx15;
 vec4 final75 = vec4(nc75)* fx75;

 vec4 maximo = max(max(max(final15, final75), max(final30, final60)), final45);

      if(nc . x){ pix1 = px . x ? F : H;blend1 = maximo . x;}
 else if(nc . y){ pix1 = px . y ? B : F;blend1 = maximo . y;}
 else if(nc . z){ pix1 = px . z ? D : B;blend1 = maximo . z;}
 else if(nc . w){ pix1 = px . w ? H : D;blend1 = maximo . w;}

      if(nc . w){ pix2 = px . w ? H : D;blend2 = maximo . w;}
 else if(nc . z){ pix2 = px . z ? D : B;blend2 = maximo . z;}
 else if(nc . y){ pix2 = px . y ? B : F;blend2 = maximo . y;}
 else if(nc . x){ pix2 = px . x ? F : H;blend2 = maximo . x;}

    res1 = mix(E, pix1, blend1);
    res2 = mix(E, pix2, blend2);
    vec3 res = mix(res1, res2, step(c_df(E, res1), c_df(E, res2)));

    FragColor = vec4(res, 1.0);
}
