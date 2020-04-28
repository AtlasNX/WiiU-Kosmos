#version 150
#define float2 vec2
#define float3 vec3
#define float4 vec4

uniform Push
{
   vec4 OutputSize;
   vec4 OriginalSize;
   vec4 SourceSize;
   uint FrameCount;
   float CRTgamma;
   float monitorgamma;
   float d;
   float R;
   float cornersize;
   float cornersmooth;
   float x_tilt;
   float y_tilt;
   float overscan_x;
   float overscan_y;
   float DOTMASK;
   float SHARPER;
   float scanline_weight;
   float CURVATURE;
}registers;

layout(std140) uniform UBO
{
   mat4 MVP;
   vec4 OutputSize;
}global;

#pragma parameterCRTgamma¡2.40.15.00.1
#pragma parametermonitorgamma¡2.20.15.00.1
#pragma parameterd¡1.50.13.00.1
#pragma parameterCURVATURE¡1.00.01.01.0
#pragma parameterR¡2.00.110.00.1
#pragma parametercornersize¡0.030.0011.00.005
#pragma parametercornersmooth¡1000.080.02000.0100.0
#pragma parameterx_tilt¡0.0-0.50.50.05
#pragma parametery_tilt¡0.0-0.50.50.05
#pragma parameteroverscan_x¡100.0-125.0125.01.0
#pragma parameteroverscan_y¡100.0-125.0125.01.0
#pragma parameterDOTMASK¡0.30.00.30.3
#pragma parameterSHARPER¡1.01.03.01.0
#pragma parameterscanline_weight¡0.30.10.50.05















































vec2 aspect = vec2(1.0, 0.75);
vec2 overscan = vec2(1.01, 1.01);

layout(location = 0) in vec2 vTexCoord;
layout(location = 1) in vec2 sinangle;
layout(location = 2) in vec2 cosangle;
layout(location = 3) in vec3 stretch;
layout(location = 4) in vec2 ilfac;
layout(location = 5) in vec2 one;
layout(location = 6) in float mod_factor;
layout(location = 7) in vec2 TextureSize;
layout(location = 0) out vec4 FragColor;
uniform sampler2D Source;

float intersect(vec2 xy)
{
    float A = dot(xy, xy)+ registers . d * registers . d;
    float B = 2.0 *(registers . R *(dot(xy, sinangle)- registers . d * cosangle . x * cosangle . y)- registers . d * registers . d);
    float C = registers . d * registers . d + 2.0 * registers . R * registers . d * cosangle . x * cosangle . y;

    return(- B - sqrt(B * B - 4.0 * A * C))/(2.0 * A);
}

vec2 bkwtrans(vec2 xy)
{
    float c = intersect(xy);
    vec2 point =(vec2(c, c)* xy - vec2(- registers . R, - registers . R)* sinangle)/ vec2(registers . R, registers . R);
    vec2 poc = point / cosangle;
    vec2 tang = sinangle / cosangle;

    float A = dot(tang, tang)+ 1.0;
    float B = - 2.0 * dot(poc, tang);
    float C = dot(poc, poc)- 1.0;

    float a =(- B + sqrt(B * B - 4.0 * A * C))/(2.0 * A);
    vec2 uv =(point - a * sinangle)/ cosangle;
    float r = max(abs(registers . R * acos(a)), 1e-5);;

    return uv * r / sin(r / registers . R);
}

vec2 fwtrans(vec2 uv)
{
    float r = max(abs(sqrt(dot(uv, uv))), 1e-5);;
    uv *= sin(r / registers . R)/ r;
    float x = 1.0 - cos(r / registers . R);
    float D = registers . d / registers . R + x * cosangle . x * cosangle . y + dot(uv, sinangle);

    return registers . d *(uv * cosangle - x * sinangle)/ D;
}

vec3 maxscale()
{
    vec2 c = bkwtrans(- registers . R * sinangle /(1.0 + registers . R / registers . d * cosangle . x * cosangle . y));
    vec2 a = vec2(0.5, 0.5)* aspect;

    vec2 lo = vec2(fwtrans(vec2(- a . x, c . y)). x,
                   fwtrans(vec2(c . x, - a . y)). y)/ aspect;
    vec2 hi = vec2(fwtrans(vec2(+ a . x, c . y)). x,
                   fwtrans(vec2(c . x, + a . y)). y)/ aspect;

    return vec3((hi + lo)* aspect * 0.5, max(hi . x - lo . x, hi . y - lo . y));
}







vec4 scanlineWeights(float distance, vec4 color)
{











    vec4 wid = 0.3 + 0.1 * pow(color, vec4(3.0));
    vec4 weights = vec4(distance / wid);
    return 0.4 * exp(- weights * weights)/ wid;





}

vec2 transform(vec2 coord)
{
    coord =(coord - vec2(0.5, 0.5))* aspect * stretch . z + stretch . xy;

    return(bkwtrans(coord)/
        vec2(registers . overscan_x / 100.0, registers . overscan_y / 100.0)/ aspect + vec2(0.5, 0.5));
}

float corner(vec2 coord)
{
    coord =(coord - vec2(0.5))* vec2(registers . overscan_x / 100.0, registers . overscan_y / 100.0)+ vec2(0.5, 0.5);
    coord = min(coord, vec2(1.0)- coord)* aspect;
    vec2 cdist = vec2(registers . cornersize);
    coord =(cdist - min(coord, cdist));
    float dist = sqrt(dot(coord, coord));

    return clamp((cdist . x - dist)* registers . cornersmooth, 0.0, 1.0);
}

void main()
{






















 vec2 xy;
 if(registers . CURVATURE > 0.5)
    xy = transform(vTexCoord);
 else
 xy = vTexCoord;

    float cval = corner(xy);




    vec2 ilvec = vec2(0.0, ilfac . y > 1.5 ? mod(float(registers . FrameCount), 2.0): 0.0);




    vec2 ratio_scale =(xy * TextureSize - vec2(0.5, 0.5)+ ilvec)/ ilfac;
    vec2 uv_ratio = fract(ratio_scale);


    xy =(floor(ratio_scale)* ilfac + vec2(0.5, 0.5)- ilvec)/ TextureSize;




    vec4 coeffs = 3.141592653589 * vec4(1.0 + uv_ratio . x, uv_ratio . x, 1.0 - uv_ratio . x, 2.0 - uv_ratio . x);


    coeffs = max(abs(coeffs), 1e-5);;


    coeffs = 2.0 * sin(coeffs)* sin(coeffs / 2.0)/(coeffs * coeffs);


    coeffs /= dot(coeffs, vec4(1.0));




    vec4 col = clamp(
        mat4(
                                        pow(texture(Source,(xy + vec2(- one . x, 0.0))), vec4(registers . CRTgamma)),
                    pow(texture(Source,(xy)), vec4(registers . CRTgamma)),
                                       pow(texture(Source,(xy + vec2(one . x, 0.0))), vec4(registers . CRTgamma)),
                                             pow(texture(Source,(xy + vec2(2.0 * one . x, 0.0))), vec4(registers . CRTgamma))
        )* coeffs,
        0.0, 1.0
    );
    vec4 col2 = clamp(
        mat4(
                                          pow(texture(Source,(xy + vec2(- one . x, one . y))), vec4(registers . CRTgamma)),
                                       pow(texture(Source,(xy + vec2(0.0, one . y))), vec4(registers . CRTgamma)),
                          pow(texture(Source,(xy + one)), vec4(registers . CRTgamma)),
                                               pow(texture(Source,(xy + vec2(2.0 * one . x, one . y))), vec4(registers . CRTgamma))
        )* coeffs,
        0.0, 1.0
    );








    vec4 weights = scanlineWeights(uv_ratio . y, col);
    vec4 weights2 = scanlineWeights(1.0 - uv_ratio . y, col2);


    float filter_ = fwidth(ratio_scale . y);
    uv_ratio . y = uv_ratio . y + 1.0 / 3.0 * filter_;
    weights =(weights + scanlineWeights(uv_ratio . y, col))/ 3.0;
    weights2 =(weights2 + scanlineWeights(abs(1.0 - uv_ratio . y), col2))/ 3.0;
    uv_ratio . y = uv_ratio . y - 2.0 / 3.0 * filter_;
    weights = weights + scanlineWeights(abs(uv_ratio . y), col)/ 3.0;
    weights2 = weights2 + scanlineWeights(abs(1.0 - uv_ratio . y), col2)/ 3.0;


    vec3 mul_res =(col * weights + col2 * weights2). rgb * vec3(cval);



    vec3 dotMaskWeights = mix(
        vec3(1.0, 1.0 - registers . DOTMASK, 1.0),
        vec3(1.0 - registers . DOTMASK, 1.0, 1.0 - registers . DOTMASK),
        floor(mod(mod_factor, 2.0))
    );

    mul_res *= dotMaskWeights;


    mul_res = pow(mul_res, vec3(1.0 / registers . monitorgamma));

    FragColor = vec4(mul_res, 1.0);
}
