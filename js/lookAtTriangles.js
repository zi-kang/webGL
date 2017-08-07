/**
 * Created by kang on 2017/8/7.
 */
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n'+
    'attribute vec4 a_Color;\n'+
    'uniform mat4 u_ViewMatrix;\n'+
    'varying vec4 v_Color;\n'+
    'void main(){\n'+
    ' gl_Position = u_ViewMatrix * a_Position;\n'+
    ' v_Color =  a_Color;\n'+
    '}\n';
var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    "precision mediump float;\n" +//!!! 需要声明浮点数精度，否则报错No precision specified for (float)
    '#endif\n' +
    "varying vec4 v_Color;\n" +//在片元着色器里面使用varying声明相同的变量
    'void main(){\n'+
    ' gl_FragColor = v_Color;\n'+
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

    //获取u_ViewMatrix变量的存储地址
    var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (u_ViewMatrix < 0) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return -1;
    }

    //设置视点、视线和上方向
    var viewMatrix = new Matrix4();
    viewMatrix.setLookAt(0.20, 0.25, 0.25, 0, 0, 0, 0, 1, 0);

    //将视图矩阵传给u_ViewMatrix变量
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

    // 清除 <canvas>
    gl.clearColor(0.5,0.5,0.5,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 绘制多边形
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl){
    var verticesColors = new Float32Array([
        //顶点坐标和颜色
        0.0, 0.5, -0.4, 0.4, 1.0, 0.4,
        -0.5, -0.5, -0.4, 0.4, 1.0, 0.4,  //绿色三角形在最后面
        0.5, -0.5, -0.4, 1.0, 0.4, 0.4,

        0.5, 0.4, -0.2, 1.0, 0.4, 0.4,
        -0.5, 0.4, -0.2, 1.0, 1.0, 0.4,   //黄色三角形在中间
        0.0, -0.6, -0.2, 1.0, 1.0, 0.4,

        0.0, 0.5, 0.0, 0.4, 0.4, 1.0,
        -0.5, -0.5, 0.0, 0.4, 0.4, 1.0,   //蓝色三角形在最前面
        0.5, -0.5, 0.0, 1.0, 0.4, 0.4,
    ]);
    var n = 9;

    //创建缓冲区对象
    var verticesColorbuffer = gl.createBuffer();
    if (!verticesColorbuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesColorbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

    var FSIZE = verticesColors.BYTES_PER_ELEMENT;
    //获取a_Position的存储位置，分配缓冲区并开启
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0 );
    gl.enableVertexAttribArray(a_Position);  // 开启分配


    // 获取a_Color的存储位置，并分配缓冲区开启
    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if(a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return -1;
    }
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color);  // 开启缓冲区



    return n;
}



