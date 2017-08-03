/**
 * Created by huzikang on 17/8/3.
 * 用于验证片元着色器是逐片元执行的
 */
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'void main() {\n' +
    '  gl_Position = a_Position;\n' +
    '}\n';
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform float u_Width;\n' +
    'uniform float u_Height;\n' +
    'void main() {\n' +
    '  gl_FragColor = vec4(gl_FragCoord.x/u_Width, 0.0, gl_FragCoord.y/u_Height, 1.0);\n' +
    '}\n';


function main() {
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

    gl.drawArrays( gl.TRIANGLE_FAN, 0, n );
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
    gl.bufferData( gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW );
    var a_Position = gl.getAttribLocation( gl.program, 'a_Position' );
    if( a_Position < 0 ){
        console.log( 'Failed to get the stroge location of a_Position' );
        return;
    }

    //将缓冲区对象分配给a_Position变量
    gl.vertexAttribPointer( a_Position, 2, gl.FLOAT, false, 0, 0 );


    var u_Width = gl.getUniformLocation(gl.program, 'u_Width');
    if (!u_Width) {
        console.log('Failed to get the storage location of u_Width');
        return;
    }

    var u_Height = gl.getUniformLocation(gl.program, 'u_Height');
    if (!u_Height) {
        console.log('Failed to get the storage location of u_Height');
        return;
    }

    gl.uniform1f(u_Width, gl.drawingBufferWidth);
    gl.uniform1f(u_Height, gl.drawingBufferHeight);

    // Enable the generic vertex attribute array
    gl.enableVertexAttribArray(a_Position);

    // Unbind the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return n;
}
