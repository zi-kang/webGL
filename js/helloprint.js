/**
 * Created by huzikang on 17/7/28.
 */

//顶点着色器函数
var VSHADER_SOURCE =
    'void main(){\n' +
    'gl_Position = vec4(-0.5,0.5,0.0,1.0);\n' +
    'gl_PointSize = 20.0;\n' +
    '}\n';

//片元着色器函数
var FSHADER_SOURCE =
    'void main() {\n' +
    ' gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n'+
    '}\n';

function main(){
    var canvas = document.getElementById('webgl');
    if( !canvas ){
        console.log( 'Failed to retrieve the <canvas> element' );
        return;
    }
    var gl = getWebGLContext(canvas);
    if( !gl ){
        console.log( '不能正确获取webgl绘图上下文' );
        return;
    }
    //初始化着色器
    if( !initShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE) ){
        console.log( 'Falied to initialize shaders.' );
        return;
    }


    gl.clearColor(0.0,1.0,0.0,1.0);
    gl.clear( gl.COLOR_BUFFER_BIT );

    //绘制一个点
    gl.drawArrays(gl.POINTS, 0, 1);
}