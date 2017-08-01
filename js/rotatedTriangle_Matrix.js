/**
 * Created by huzikang on 17/8/1.
 */
//顶点着色器函数
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n'+
    'uniform mat4 u_xformTransMatrix;\n'+
    'uniform mat4 u_xformRotaMatrix;\n'+
    'uniform mat4 u_xformSizeMatrix;\n'+
    'void main(){\n' +
    'gl_Position = u_xformRotaMatrix * ( u_xformSizeMatrix * ( u_xformTransMatrix * a_Position ));\n' +
    '}\n';

//片元着色器函数
var FSHADER_SOURCE =
    'void main() {\n' +
    ' gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n'+
    '}\n';

var Tx = -0.1,
    Ty = 0.2,
    Tz = 0.0;
//旋转角度
var ANGLE = 45.0;

var Sx = 1.5,
    Sy = 0.5,
    Sz = 1.0;
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

    //将旋转图形所需的数据传输给顶点着色器
    var radian = Math.PI*ANGLE/180.0; //转换为弧度
    var cosB = Math.cos(radian),
        sinB = Math.sin(radian);

    //webGL中的矩阵都是列主序的
    //平移矩阵
    var xformTransMatrix = new Float32Array([
       1.0, 0.0, 0.0, 0.0,
       0.0, 1.0, 0.0, 0.0,
       0.0, 0.0, 1.0, 0.0,
        Tx, Ty, Tz, 1.0
    ]);
    //旋转矩阵
    var xFormRotaMatrix = new Float32Array([
        cosB, sinB, 0.0, 0.0,
        -sinB, cosB, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);
    //缩放矩阵
    var xFormSizeMatrix = new Float32Array([
        Sx, 0.0, 0.0, 0.0,
        0.0, Sy, 0.0, 0.0,
        0.0, 0.0, Sz, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);

    //将矩阵数据传输给顶点着色器
    var u_xformTransMatrix = gl.getUniformLocation(gl.program, 'u_xformTransMatrix');
    var u_xformRotaMatrix = gl.getUniformLocation(gl.program, 'u_xformRotaMatrix');
    var u_xformSizeMatrix = gl.getUniformLocation(gl.program, 'u_xformSizeMatrix');

    gl.uniformMatrix4fv(u_xformTransMatrix, false, xformTransMatrix);
    gl.uniformMatrix4fv(u_xformRotaMatrix, false, xFormRotaMatrix);
    gl.uniformMatrix4fv(u_xformSizeMatrix, false, xFormSizeMatrix);
    //将旋转矩阵传输给顶点着色器


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