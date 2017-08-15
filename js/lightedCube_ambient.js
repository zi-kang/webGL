/**
 * Created by huzikang on 17/8/15.
 */
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'attribute vec4 a_Normal;\n' +        // 法向量
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform vec3 u_LightColor;\n' +     // 光线颜色
    'uniform vec3 u_LightDirection;\n' + // 归一化的世界坐标
    'uniform vec3 u_AmbientLight;\n' + // 环境光颜色
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position ;\n' +
    // 对法向量进行归一化
    '  vec3 normal = normalize(a_Normal.xyz);\n' +
    // 计算光线方向和法向量的点积
    '  float nDotL = max(dot(u_LightDirection, normal), 0.0);\n' +
    // 计算漫反射光的颜色
    '  vec3 diffuse = u_LightColor * a_Color.rgb * nDotL;\n' +
        //计算环境光产生的反射光颜色
    ' vec3 ambient = u_AmbientLight * a_Color.rgb;\n'+
        //将以上两者相加得到物体最终的颜色
    '  v_Color = vec4(diffuse + ambient, a_Color.a);\n' +
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

    // 设置顶点的坐标、颜色、和法向量
    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
    }

    // 设置背景色和开启隐藏面消除
    gl.clearColor(0.5, 0.5, 0.5, 1);
    gl.enable(gl.DEPTH_TEST);

    // 获取u_MvpMatrix、u_LightColor、u_LightDirection、u_AmbientLight变量的储存位置
    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
    var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
    if (!u_MvpMatrix || !u_LightColor || !u_LightDirection) {
        console.log('Failed to get the storage location');
        return;
    }

    // 设置光线颜色（白色）
    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
    // 设置光线方向（世界坐标系下）
    var lightDirection = new Vector3([0.5, 3.0, 4.0]);
    lightDirection.normalize();     // 归一化
    gl.uniform3fv(u_LightDirection, lightDirection.elements);

    //传入环境光
    gl.uniform3f(u_AmbientLight, 0.3, 0.3, 0.3);



    // 计算模型视图投影矩阵
    var mvpMatrix = new Matrix4();


    //注册键盘事件响应函数
    document.onkeydown = function(ev){
        keydown(ev, gl, n,  mvpMatrix, u_MvpMatrix, 0, canvas);
    };
    document.getElementsByClassName('left')[0].onclick = function(ev){
        keydown(ev, gl, n,  mvpMatrix, u_MvpMatrix, 2, canvas);
    };
    document.getElementsByClassName('right')[0].onclick = function(ev){
        keydown(ev, gl, n,  mvpMatrix, u_MvpMatrix, 1, canvas);
    };
    document.getElementsByClassName('pre')[0].onclick = function(ev){
        keydown(ev, gl, n,  mvpMatrix, u_MvpMatrix, 3, canvas);
    };
    document.getElementsByClassName('back')[0].onclick = function(ev){
        keydown(ev, gl, n,  mvpMatrix, u_MvpMatrix, 4, canvas);
    };

    //绘制图形函数
    draw(gl, n, mvpMatrix, u_MvpMatrix, canvas);
}











function initVertexBuffers(gl) {
    // 要绘制的立方体
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    var vertices = new Float32Array([   // 顶点坐标
        1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // v0-v1-v2-v3 front
        1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // v0-v3-v4-v5 right
        1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
        -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // v1-v6-v7-v2 left
        -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // v7-v4-v3-v2 down
        1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // v4-v7-v6-v5 back
    ]);


    var colors = new Float32Array([    // 顶点颜色
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 前
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 右
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 上
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 左
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 下
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 后
    ]);


    var normals = new Float32Array([    // 法向量
        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 前
        1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 右
        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 上
        -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 左
        0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 下
        0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 后
    ]);


    // 顶点索引
    var indices = new Uint8Array([
        0, 1, 2,   0, 2, 3,    // 前
        4, 5, 6,   4, 6, 7,    // 右
        8, 9,10,   8,10,11,    // 上
        12,13,14,  12,14,15,    // 左
        16,17,18,  16,18,19,    // 下
        20,21,22,  20,22,23     // 后
    ]);


    // 将顶点数据写入缓冲区 (顶点, 颜色和法向量)
    if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
    if (!initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)) return -1;
    if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1;

    // 将顶点索引数据写入缓冲区对象
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        console.log('Failed to create the buffer object');
        return false;
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}


function initArrayBuffer(gl, attribute, data, num, type) {
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

function keydown(ev, gl, n,  mvpMatrix, u_MvpMatrix, num, canvas) {
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
    draw(gl, n, mvpMatrix, u_MvpMatrix, canvas);
}

function draw(gl, n, mvpMatrix, u_MvpMatrix, canvas) {



    //计算模型视图投影矩阵
    mvpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
    mvpMatrix.lookAt(g_eyeX, g_eyeY, g_eyeZ, 0, 0, 0, 0, 1, 0);

    // 将模型视图投影矩阵传给u_MvpMatrix
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);



    //清空颜色缓冲区和深度缓冲区
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //绘制立方体
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);


}
