/**
 * Created by huzikang on 17/8/15.
 */
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'attribute vec4 a_Normal;\n' +        // 法向量
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform mat4 u_ModelMatrix;\n' +    //模型矩阵
    'uniform mat4 u_NormalMatrix;\n' +    //用来变换法向量的矩阵
    'varying vec4 v_Color;\n' +
    'varying vec3 v_Normal;\n' +
    'varying vec3 v_Position;\n' +
    'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position ;\n' +
    //计算顶点的世界坐标
    '  v_Position = vec3(u_ModelMatrix * a_Position);\n' +
    '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
    '  v_Color = a_Color;\n' +
    '}\n';

var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'uniform vec3 u_LightColor;\n' +     // 光线颜色
    'uniform vec3 u_LightPosition;\n' + // 光源位置（世界坐标系下）
    'uniform vec3 u_AmbientLight;\n' + // 环境光颜色
    'varying vec3 v_Normal;\n' +
    'varying vec3 v_Position;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    //对法线进行归一化，因为其内插之后长度不一定是1.0
    ' vec3 normal = normalize(v_Normal);\n'+
        //计算光线方向并归一化
    ' vec3 lightDirection = normalize(u_LightPosition - v_Position);\n'+
        //计算光线方向和法向量的点积
    ' float nDotL = max(dot(lightDirection, normal), 0.0);\n'+
        //计算diffuse、ambient以及最终的颜色
    ' vec3 diffuse = u_LightColor * v_Color.rgb * nDotL;\n'+
    ' vec3 ambient = u_AmbientLight * v_Color.rgb;\n'+
    ' gl_FragColor = vec4(diffuse + ambient, v_Color.a);\n' +
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

    // 获取uniform等变量的储存位置
    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
    var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
    if (!u_ModelMatrix || !u_MvpMatrix || !u_LightColor || !u_LightPosition || !u_AmbientLight || !u_NormalMatrix) {
        console.log('Failed to get the storage location');
        return;
    }

    // 设置光线颜色（白色）
    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
    //设置光源位置（世界坐标系下）
    gl.uniform3f(u_LightPosition, 0.0, 3.0, 4.0);

    //传入环境光
    gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);



    // 计算模型视图投影矩阵
    var mvpMatrix = new Matrix4(), // 模型视图投影矩阵
        normalMatrix = new Matrix4(), // 用来变换法向量的矩阵
        modelMatrix = new Matrix4(); // 模型矩阵


    //计算模型矩阵
    modelMatrix.rotate(0, 0, 0, 1); //绕z轴旋转






    //注册键盘事件响应函数
    document.onkeydown = function(ev){
        keydown(ev, gl, n,  mvpMatrix, u_MvpMatrix, 0, canvas, modelMatrix, normalMatrix, u_NormalMatrix);
    };
    document.getElementsByClassName('left')[0].onclick = function(ev){
        keydown(ev, gl, n,  mvpMatrix, u_MvpMatrix, 2, canvas, modelMatrix, normalMatrix, u_NormalMatrix);
    };
    document.getElementsByClassName('right')[0].onclick = function(ev){
        keydown(ev, gl, n,  mvpMatrix, u_MvpMatrix, 1, canvas, modelMatrix, normalMatrix, u_NormalMatrix);
    };
    document.getElementsByClassName('pre')[0].onclick = function(ev){
        keydown(ev, gl, n,  mvpMatrix, u_MvpMatrix, 3, canvas, modelMatrix, normalMatrix, u_NormalMatrix);
    };
    document.getElementsByClassName('back')[0].onclick = function(ev){
        keydown(ev, gl, n,  mvpMatrix, u_MvpMatrix, 4, canvas, modelMatrix, normalMatrix, u_NormalMatrix);
    };
    document.getElementsByClassName('clockwise')[0].onclick = function(ev){
        keydown(ev, gl, n,  mvpMatrix, u_MvpMatrix, 5, canvas, modelMatrix, normalMatrix, u_NormalMatrix);
    };
    document.getElementsByClassName('counterclockwise')[0].onclick = function(ev){
        keydown(ev, gl, n,  mvpMatrix, u_MvpMatrix, 6, canvas, modelMatrix, normalMatrix, u_NormalMatrix);
    };

    //绘制图形函数
    draw(gl, n, mvpMatrix, u_MvpMatrix, canvas, modelMatrix, normalMatrix, u_NormalMatrix);
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



function keydown(ev, gl, n,  mvpMatrix, u_MvpMatrix, num, canvas, modelMatrix, normalMatrix, u_NormalMatrix) {
    if(ev.keyCode == 39 || num == 1) { // 按下右键

        modelMatrix.rotate(10, 0, -1, 0); //绕y轴旋转

    } else if (ev.keyCode == 37 || num == 2 ) { // 按下左键

        modelMatrix.rotate(10, 0, 1, 0); //绕y轴旋转

    } else if(ev.keyCode == 38 || num == 3){ //按下上键

        modelMatrix.rotate(10, 1, 0, 0); //绕x轴旋转

    }else if(ev.keyCode == 40 || num == 4){ //按下下键

        modelMatrix.rotate(10, -1, 0, 0); //绕x轴旋转

    }else if(num == 5){ //顺时针

        modelMatrix.rotate(10, 0, 0, -1); //绕z轴旋转

    }else if(num == 6){ //逆时针

        modelMatrix.rotate(10, 0, 0, 1); //绕z轴旋转

    } else { //按下其他的键
        return;
    }
    draw(gl, n, mvpMatrix, u_MvpMatrix, canvas, modelMatrix, normalMatrix, u_NormalMatrix);
}

function draw(gl, n, mvpMatrix, u_MvpMatrix, canvas, modelMatrix, normalMatrix, u_NormalMatrix) {

    //计算模型矩阵
    //modelMatrix.rotate(30, 0, -1, 0); //绕z轴旋转


    //计算模型视图投影矩阵
    mvpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
    mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
    mvpMatrix.multiply(modelMatrix);
    // 将模型视图投影矩阵传给u_MvpMatrix
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    //根据模型矩阵计算用来用来变换的法向量的矩阵
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    //将用来变换法向量的矩阵传给u_NormalMatrix变量
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);


    //清空颜色缓冲区和深度缓冲区
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //绘制立方体
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);


}
