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

    //开启隐藏面消除
    gl.enable( gl.DEPTH_TEST );
    //清除颜色和深度缓冲区
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // 设置视点和可视空间
    var mvpMatrix = new Matrix4();


    //注册键盘事件响应函数
    document.onkeydown = function(ev){
        keydown(ev, gl, n,  mvpMatrix, u_MvpMatrix, 0);
    };
    document.getElementsByClassName('left')[0].onclick = function(ev){
        keydown(ev, gl, n,  mvpMatrix, u_MvpMatrix, 2);
    };
    document.getElementsByClassName('right')[0].onclick = function(ev){
        keydown(ev, gl, n,  mvpMatrix, u_MvpMatrix, 1);
    };
    document.getElementsByClassName('pre')[0].onclick = function(ev){
        keydown(ev, gl, n,  mvpMatrix, u_MvpMatrix, 3);
    };
    document.getElementsByClassName('back')[0].onclick = function(ev){
        keydown(ev, gl, n,  mvpMatrix, u_MvpMatrix, 4);
    };

    //绘制图形函数
    draw(gl, n, mvpMatrix, u_MvpMatrix);
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

    var vertices = new Float32Array([   // 顶点坐标
        1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  // v0-v1-v2-v3 前
        1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,  // v0-v3-v4-v5 右
        1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,  // v0-v5-v6-v1 上
        -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,  // v1-v6-v7-v2 左
        -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,  // v7-v4-v3-v2 下
        1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0   // v4-v7-v6-v5 后
    ]);

    var colors = new Float32Array([     // 颜色
        0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 前（蓝色）
        0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 右(绿色)
        1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1 上(红色)
        1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2 左(黄色)
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 下(白色)
        0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0   // v4-v7-v6-v5 后(青色)
    ]);


    //顶点索引
    var indices = new Uint8Array([
        0, 1, 2,   0, 2, 3,    // 前
        4, 5, 6,   4, 6, 7,    // 右
        8, 9,10,   8,10,11,    // 上
        12,13,14,  12,14,15,    // 左
        16,17,18,  16,18,19,    // 下
        20,21,22,  20,22,23     // 后
    ]);

    //创建缓冲区对象
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer)
        return -1;
    // 将顶点坐标和颜色写入缓冲区对象
    if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position'))
        return -1;

    if (!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color'))
        return -1;

    // 将顶点索引写入缓冲区对象
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}


function initArrayBuffer(gl, data, num, type, attribute) {
    var buffer = gl.createBuffer();   // 创建缓冲区对象
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return false;
    }
    // 将数据写入缓冲区对象
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    // 将缓冲区对象分配给attribute变量
    var a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0) {
        console.log('Failed to get the storage location of ' + attribute);
        return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    // 开启缓冲区对象
    gl.enableVertexAttribArray(a_attribute);

    return true;
}



var g_eyeX = 3.0, g_eyeY = 3.0, g_eyeZ = 7.0; // 视点

function keydown(ev, gl, n,  mvpMatrix, u_MvpMatrix, num) {
    if(ev.keyCode == 39 || num == 1) { // 按下右键
        g_eyeX += 0.1;
    } else if (ev.keyCode == 37 || num == 2 ) { // 按下左键
        g_eyeX -= 0.1;
    } else if(ev.keyCode == 38 || num == 3){ //按下上键
        g_eyeY += 0.1;
    }else if(ev.keyCode == 40 || num == 4){ //按下下键
        g_eyeY -= 0.1;
    } else { //按下其他的键
        return;
    }
    draw(gl, n, mvpMatrix, u_MvpMatrix);
}

function draw(gl, n, mvpMatrix, u_MvpMatrix) {

    mvpMatrix.setPerspective(30, 1, 1, 100);
    mvpMatrix.lookAt(g_eyeX, g_eyeY, g_eyeZ, 0, 0, 0, 0, 1, 0);

    // 将模型视图投影矩阵传给u_MvpMatrix
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    //清空颜色缓冲区和深度缓冲区
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //绘制立方体
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);


}
