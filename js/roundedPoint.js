/**
 * Created by huzikang on 17/8/23.
 */

//顶点着色器函数
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n'+
    'void main(){\n' +
    'gl_Position = a_Position;\n' +
    'gl_PointSize = 10.0;\n' +
    '}\n';

//片元着色器函数
var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'void main() {\n' + //中心点坐标是(0.5,0.5)
    '  float d = distance(gl_PointCoord, vec2(0.5, 0.5));\n' +
    '  if(d < 0.5) {\n' +  //半径是0.5
    '    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
    '  } else { discard; }\n' +
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

    //设置顶点位置
    var n = initVertexBuffers(gl);
    if( n < 0 ){
        console.log( 'Failed to get the stroge location of a_Position' );
        return;
    }

    //设置背景色
    gl.clearColor(0.5,0.5,0.5,1.0);
    gl.clear( gl.COLOR_BUFFER_BIT );

    //绘制三个点
    gl.drawArrays( gl.POINTS, 0, n ); // n is 3
}

function initVertexBuffers(gl){
    var vertices = new Float32Array([
        0.0, 0.5, -0.5, -0.5, 0.5, -0.5, 0.0, 0.0
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