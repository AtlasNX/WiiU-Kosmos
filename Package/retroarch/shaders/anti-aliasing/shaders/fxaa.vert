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
}params;

layout(std140) uniform UBO
{
   mat4 MVP;
}global;






















































































float FxaaLuma(vec3 rgb){
    return rgb . y *(0.587 / 0.299)+ rgb . x;
}

vec3 FxaaLerp3(vec3 a, vec3 b, float amountOfA){
    return(vec3(- amountOfA)* b)+((a * vec3(amountOfA))+ b);
}

vec4 FxaaTexOff(sampler2D tex, vec2 pos, ivec2 off, vec2 rcpFrame){
    float x = pos . x + float(off . x)* rcpFrame . x;
    float y = pos . y + float(off . y)* rcpFrame . y;
    return texture(tex, vec2(x, y));
}




vec3 FxaaPixelShader(vec2 pos, sampler2D tex, vec2 rcpFrame)
{
    vec3 rgbN = FxaaTexOff(tex, pos . xy, ivec2(0, - 1), rcpFrame). xyz;
    vec3 rgbW = FxaaTexOff(tex, pos . xy, ivec2(- 1, 0), rcpFrame). xyz;
    vec3 rgbM = FxaaTexOff(tex, pos . xy, ivec2(0, 0), rcpFrame). xyz;
    vec3 rgbE = FxaaTexOff(tex, pos . xy, ivec2(1, 0), rcpFrame). xyz;
    vec3 rgbS = FxaaTexOff(tex, pos . xy, ivec2(0, 1), rcpFrame). xyz;

    float lumaN = FxaaLuma(rgbN);
    float lumaW = FxaaLuma(rgbW);
    float lumaM = FxaaLuma(rgbM);
    float lumaE = FxaaLuma(rgbE);
    float lumaS = FxaaLuma(rgbS);
    float rangeMin = min(lumaM, min(min(lumaN, lumaW), min(lumaS, lumaE)));
    float rangeMax = max(lumaM, max(max(lumaN, lumaW), max(lumaS, lumaE)));

    float range = rangeMax - rangeMin;
    if(range < max((1.0 / 24.0), rangeMax *(1.0 / 8.0)))
    {
        return rgbM;
    }

    vec3 rgbL = rgbN + rgbW + rgbM + rgbE + rgbS;

    float lumaL =(lumaN + lumaW + lumaE + lumaS)* 0.25;
    float rangeL = abs(lumaL - lumaM);
    float blendL = max(0.0,(rangeL / range)-(1.0 / 4.0))*(1.0 /(1.0 -(1.0 / 4.0)));
    blendL = min((3.0 / 4.0), blendL);

    vec3 rgbNW = FxaaTexOff(tex, pos . xy, ivec2(- 1, - 1), rcpFrame). xyz;
    vec3 rgbNE = FxaaTexOff(tex, pos . xy, ivec2(1, - 1), rcpFrame). xyz;
    vec3 rgbSW = FxaaTexOff(tex, pos . xy, ivec2(- 1, 1), rcpFrame). xyz;
    vec3 rgbSE = FxaaTexOff(tex, pos . xy, ivec2(1, 1), rcpFrame). xyz;
    rgbL +=(rgbNW + rgbNE + rgbSW + rgbSE);
    rgbL *= vec3(1.0 / 9.0);

    float lumaNW = FxaaLuma(rgbNW);
    float lumaNE = FxaaLuma(rgbNE);
    float lumaSW = FxaaLuma(rgbSW);
    float lumaSE = FxaaLuma(rgbSE);

    float edgeVert =
        abs((0.25 * lumaNW)+(- 0.5 * lumaN)+(0.25 * lumaNE))+
        abs((0.50 * lumaW)+(- 1.0 * lumaM)+(0.50 * lumaE))+
        abs((0.25 * lumaSW)+(- 0.5 * lumaS)+(0.25 * lumaSE));
    float edgeHorz =
        abs((0.25 * lumaNW)+(- 0.5 * lumaW)+(0.25 * lumaSW))+
        abs((0.50 * lumaN)+(- 1.0 * lumaM)+(0.50 * lumaS))+
        abs((0.25 * lumaNE)+(- 0.5 * lumaE)+(0.25 * lumaSE));

    bool horzSpan = edgeHorz >= edgeVert;
    float lengthSign = horzSpan ? - rcpFrame . y : - rcpFrame . x;

    if(! horzSpan)
    {
        lumaN = lumaW;
        lumaS = lumaE;
    }

    float gradientN = abs(lumaN - lumaM);
    float gradientS = abs(lumaS - lumaM);
    lumaN =(lumaN + lumaM)* 0.5;
    lumaS =(lumaS + lumaM)* 0.5;

    if(gradientN < gradientS)
    {
        lumaN = lumaS;
        lumaN = lumaS;
        gradientN = gradientS;
        lengthSign *= - 1.0;
    }

    vec2 posN;
    posN . x = pos . x +(horzSpan ? 0.0 : lengthSign * 0.5);
    posN . y = pos . y +(horzSpan ? lengthSign * 0.5 : 0.0);

    gradientN *=(1.0 / 4.0);

    vec2 posP = posN;
    vec2 offNP = horzSpan ? vec2(rcpFrame . x, 0.0): vec2(0.0, rcpFrame . y);
    float lumaEndN = lumaN;
    float lumaEndP = lumaN;
    bool doneN = false;
    bool doneP = false;
    posN += offNP * vec2(- 1.0, - 1.0);
    posP += offNP * vec2(1.0, 1.0);

    for(int i = 0;i < 32;i ++){
        if(! doneN)
        {
            lumaEndN = FxaaLuma(texture(tex, posN . xy). xyz);
        }
        if(! doneP)
        {
            lumaEndP = FxaaLuma(texture(tex, posP . xy). xyz);
        }

        doneN = doneN ||(abs(lumaEndN - lumaN)>= gradientN);
        doneP = doneP ||(abs(lumaEndP - lumaN)>= gradientN);

        if(doneN && doneP)
        {
            break;
        }
        if(! doneN)
        {
            posN -= offNP;
        }
        if(! doneP)
        {
            posP += offNP;
        }
    }

    float dstN = horzSpan ? pos . x - posN . x : pos . y - posN . y;
    float dstP = horzSpan ? posP . x - pos . x : posP . y - pos . y;
    bool directionN = dstN < dstP;
    lumaEndN = directionN ? lumaEndN : lumaEndP;

    if(((lumaM - lumaN)< 0.0)==((lumaEndN - lumaN)< 0.0))
    {
        lengthSign = 0.0;
    }


    float spanLength =(dstP + dstN);
    dstN = directionN ? dstN : dstP;
    float subPixelOffset =(0.5 +(dstN *(- 1.0 / spanLength)))* lengthSign;
    vec3 rgbF = texture(tex, vec2(
        pos . x +(horzSpan ? 0.0 : subPixelOffset),
        pos . y +(horzSpan ? subPixelOffset : 0.0))). xyz;
    return FxaaLerp3(rgbL, rgbF, blendL);
}

layout(location = 0) in vec4 Position;
layout(location = 1) in vec2 TexCoord;
layout(location = 0) out vec2 vTexCoord;

void main()
{
   gl_Position = global . MVP * Position;
   vTexCoord = TexCoord;
}

