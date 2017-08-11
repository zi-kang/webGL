/**
 * Created by huzikang on 17/8/11.
 */
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    '  v_Color = a_Color;\n' +
    '}\n';

var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_FragColor = v_Color;\n' +
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
        console.log( 'Failed to set the vertex information' );
        return;
    }

    // 设置背景色并开启隐藏面消除
    gl.clearColor(0.5,0.5,0.5,1.0);
    gl.enable(gl.DEPTH_TEST);

    // 获取u_MvpMatrix变量的储存位置
    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    if (!u_MvpMatrix) {
        console.log('Failed to get the storage location of u_MvpMatrix');
        return;
    }

    // 设置视点和可视空间
    var mvpMatrix = new Matrix4();
    mvpMatrix.setPerspective(30, 1, 1, 100);
    mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);

    // 将模型视图投影矩阵传给u_MvpMatrix
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    //清空颜色缓冲区和深度缓冲区
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //绘制立方体
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

function initVertexBuffers(gl) {
    // 将要绘制的立方体
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3

    var verticesColors = new Float32Array([
        // 顶点坐标和颜色
        1.0,  1.0,  1.0,     1.0,  1.0,  1.0,  // v0 白色
        -1.0,  1.0,  1.0,     1.0,  0.0,  1.0,  // v1 品红色
        -1.0, -1.0,  1.0,     1.0,  0.0,  0.0,  // v2 红色
        1.0, -1.0,  1.0,     1.0,  1.0,  0.0,  // v3 黄色
        1.0, -1.0, -1.0,     0.0,  1.0,  0.0,  // v4 绿色
        1.0,  1.0, -1.0,     0.0,  1.0,  1.0,  // v5 青色
        -1.0,  1.0, -1.0,     0.0,  0.0,  1.0,  // v6 蓝色
        -1.0, -1.0, -1.0,     0.0,  0.0,  0.0   // v7 黑色
    ]);

    //顶点索引
    var indices = new Uint8Array([
        0, 1, 2,   0, 2, 3,    // 前
        0, 3, 4,   0, 4, 5,    // 右
        0, 5, 6,   0, 6, 1,    // 上
        1, 6, 7,   1, 7, 2,    // 左
        7, 4, 3,   7, 3, 2,    // 下
        4, 7, 6,   4, 6, 5     // 后
    ]);

    //创建缓冲区对象
    var vertexColorBuffer = gl.createBuffer();
    var indexBuffer = gl.createBuffer();
    if (!vertexColorBuffer || !indexBuffer) {
        return -1;
    }

    //将顶点坐标和颜色写入缓冲区对象
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

    var FSIZE = verticesColors.BYTES_PER_ELEMENT;

    //将缓冲区内的顶点坐标数据分配给a_Position并开启之
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if(a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(a_Position);

    //将缓冲区内的顶点颜色数据分配给a_Color并开启之
    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if(a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return -1;
    }
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(a_Color);


    //将顶点索引数据写入缓冲区对象
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}