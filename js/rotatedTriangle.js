/**
 * Created by huzikang on 17/7/31.
 */
//顶点着色器函数
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n'+
    'uniform vec4 u_Translation;\n'+
    'uniform float u_CosB, u_SinB;\n'+
    'void main(){\n' +
    'gl_Position.x = (a_Position.x + u_Translation.x)*u_CosB - (a_Position.y + u_Translation.y)*u_SinB;\n' +
    'gl_Position.y = (a_Position.x + u_Translation.x)*u_SinB + (a_Position.y + u_Translation.y)*u_CosB;\n' +
    'gl_Position.z = a_Position.z;\n' +
    'gl_Position.w = 1.0;\n' +
    '}\n';

//片元着色器函数
var FSHADER_SOURCE =
    'void main() {\n' +
    ' gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n'+
    '}\n';

var Tx = -0.2,
    Ty = 0.2,
    Tz = 0.0;
//旋转角度
var ANGLE = 45.0;

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

    //设置顶点位置
    var n = initVertexBuffers(gl);
    if( n < 0 ){
        console.log( 'Failed to get the stroge location of a_Position' );
        return;
    }
    //设置平移位置
    var u_Translation = gl.getUniformLocation(gl.program, 'u_Translation');
    gl.uniform4f(u_Translation, Tx, Ty, Tz, 0.0);

    //将旋转徒刑所需的数据传输给顶点着色器
    var radian = Math.PI*ANGLE/180.0; //转换为弧度
    var cosB = Math.cos(radian),
        sinB = Math.sin(radian);
    var u_CosB = gl.getUniformLocation(gl.program, 'u_CosB'),
        u_SinB = gl.getUniformLocation(gl.program, 'u_SinB');

    gl.uniform1f(u_CosB, cosB);
    gl.uniform1f(u_SinB, sinB);

    //设置背景色
    gl.clearColor(0.5,0.5,0.5,1.0);
    gl.clear( gl.COLOR_BUFFER_BIT );

    //绘制三个点
    // gl.drawArrays( gl.TRIANGLES, 0, n ); // n is 3
    // gl.drawArrays( gl.LINES, 0, n ); // n is 3
    // gl.drawArrays( gl.LINE_STRIP, 0, n ); // n is 3
    // gl.drawArrays( gl.LINE_LOOP, 0, n ); // n is 3
    // gl.drawArrays( gl.TRIANGLE_STRIP, 0, n ); // n is 4
    gl.drawArrays( gl.TRIANGLE_FAN, 0, n ); // n is 4
}

function initVertexBuffers(gl){
    var vertices = new Float32Array([
        -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, -0.5
    ]);
    var n = 4; //点的个数

    //创建缓冲区对象
    var vertexBuffer = gl.createBuffer();
    if( !vertexBuffer ){
        console.log( 'Failed to create the buffer object' );
        return -1;
    }

    //将缓冲区对象绑定到目标
    gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );

    //向缓冲区对象中写入数据
    gl.bufferData( gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW );
    var a_Position = gl.getAttribLocation( gl.program, 'a_Position' );
    if( a_Position < 0 ){
        console.log( 'Failed to get the stroge location of a_Position' );
        return;
    }

    //将缓冲区对象分配给a_Position变量
    gl.vertexAttribPointer( a_Position, 2, gl.FLOAT, false, 0, 0 );

    //连接a_Position变量分配给它的缓冲区对象
    gl.enableVertexAttribArray( a_Position );

    return n;
}