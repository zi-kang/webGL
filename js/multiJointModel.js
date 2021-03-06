/**
 * Created by huzikang on 17/8/16.
 */
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Normal;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform mat4 u_NormalMatrix;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    // 计算光照，使场景更加逼真
    '  vec3 lightDirection = normalize(vec3(0.0, 0.5, 0.7));\n' + // 光线
    '  vec4 color = vec4(1.0, 0.4, 0.0, 1.0);\n' +  // 机器人颜色
    '  vec3 normal = normalize((u_NormalMatrix * a_Normal).xyz);\n' +
    '  float nDotL = max(dot(normal, lightDirection), 0.0);\n' +
    '  v_Color = vec4(color.rgb * nDotL + vec3(0.1), color.a);\n' +
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

    // 获取uniform变量的储存位置
    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    if (!u_MvpMatrix || !u_NormalMatrix) {
        console.log('Failed to get the storage location');
        return;
    }

    //计算视图投影矩阵
    var viewProjMatrix = new Matrix4();
    viewProjMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 100.0);
    viewProjMatrix.lookAt(20.0, 10.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

    // 注册相应事件函数

    document.onkeydown = function(ev){ keydown(ev, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix); };
    document.getElementsByClassName('pointer')[0].onclick = function(){
        pointerClick(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0);
    };
    document.getElementsByClassName('pointer')[1].onclick = function(){
        pointerClick(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 1);
    };
    document.getElementsByClassName('palm')[0].onclick = function(){
        pointerClick(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 2);
    };
    document.getElementsByClassName('palm')[1].onclick = function(){
        pointerClick(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 3);
    };
    document.getElementsByClassName('arm')[0].onclick = function(){
        pointerClick(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 4);
    };
    document.getElementsByClassName('arm')[1].onclick = function(){
        pointerClick(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 5);
    };
    document.getElementsByClassName('arm')[2].onclick = function(){
        pointerClick(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 6);
    };
    document.getElementsByClassName('arm')[3].onclick = function(){
        pointerClick(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 7);
    };

    draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix); // 绘制机器人手臂
}

var ANGLE_STEP = 3.0;     // 每次按键转动的角度
var g_arm1Angle = 90.0;   // arm1的当前角度
var g_joint1Angle = 45.0; // joint1的当前角度
var g_joint2Angle = 0.0;  // joint2的当前角度
var g_joint3Angle = 0.0;  // joint3的当前角度

function keydown(ev, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
    switch (ev.keyCode){
        case 40: //上方向键 --> 使joint1绕Z轴正向旋转
            if (g_joint1Angle < 135.0) g_joint1Angle += ANGLE_STEP;
            break;
        case 38: //下方向键 --> 使joint1绕Z轴负向旋转
            if (g_joint1Angle > -135.0) g_joint1Angle -= ANGLE_STEP;
            break;
        case 39: //右方向键 -> 使arm1绕y轴正向旋转
            g_arm1Angle = (g_arm1Angle + ANGLE_STEP) % 360;
            break;
        case 37: //左方向键 -> 使arm1绕y轴负向旋转
            g_arm1Angle = (g_arm1Angle - ANGLE_STEP) % 360;
            break;
        case 90: // Z键 -> 使joint2正向转动
            g_joint2Angle = (g_joint2Angle + ANGLE_STEP) % 360;
            break;
        case 88: // X键 -> 使joint2负向转动
            g_joint2Angle = (g_joint2Angle - ANGLE_STEP) % 360;
            break;
        case 86: // V键 -> 使joint3正向转动
            if (g_joint3Angle < 60.0)  g_joint3Angle = (g_joint3Angle + ANGLE_STEP) % 360;
            break;
        case 67: // C键 -> 使joint3负向转动
            if (g_joint3Angle > -60.0) g_joint3Angle = (g_joint3Angle - ANGLE_STEP) % 360;
            break;
        default: return; // 其他情况直接跳过
    }
    // 绘制机器人手臂
    draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
}
function pointerClick(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, num){
    switch (num){
        case 0:
            if (g_joint3Angle < 60.0)  g_joint3Angle = (g_joint3Angle + ANGLE_STEP) % 360;
            break;
        case 1:
            if (g_joint3Angle > -60.0) g_joint3Angle = (g_joint3Angle - ANGLE_STEP) % 360;
            break;
        case 2:
            g_joint2Angle = (g_joint2Angle + ANGLE_STEP) % 360;
            break;
        case 3:
            g_joint2Angle = (g_joint2Angle - ANGLE_STEP) % 360;
            break;
        case 4:
            if (g_joint1Angle > -135.0) g_joint1Angle -= ANGLE_STEP;
            break;
        case 5:
            if (g_joint1Angle < 135.0) g_joint1Angle += ANGLE_STEP;
            break;
        case 6:
            g_arm1Angle = (g_arm1Angle + ANGLE_STEP) % 360;
            break;
        case 7:
            g_arm1Angle = (g_arm1Angle - ANGLE_STEP) % 360;
            break;
        default: return;
    }
    draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
};
function initVertexBuffers(gl) {
    // 立方体顶点坐标
    var vertices = new Float32Array([
        0.5, 1.0, 0.5, -0.5, 1.0, 0.5, -0.5, 0.0, 0.5,  0.5, 0.0, 0.5, // v0-v1-v2-v3 前
        0.5, 1.0, 0.5,  0.5, 0.0, 0.5,  0.5, 0.0,-0.5,  0.5, 1.0,-0.5, // v0-v3-v4-v5 右
        0.5, 1.0, 0.5,  0.5, 1.0,-0.5, -0.5, 1.0,-0.5, -0.5, 1.0, 0.5, // v0-v5-v6-v1 上
        -0.5, 1.0, 0.5, -0.5, 1.0,-0.5, -0.5, 0.0,-0.5, -0.5, 0.0, 0.5, // v1-v6-v7-v2 左
        -0.5, 0.0,-0.5,  0.5, 0.0,-0.5,  0.5, 0.0, 0.5, -0.5, 0.0, 0.5, // v7-v4-v3-v2 下
        0.5, 0.0,-0.5, -0.5, 0.0,-0.5, -0.5, 1.0,-0.5,  0.5, 1.0,-0.5  // v4-v7-v6-v5 后
    ]);

    // 法向量
    var normals = new Float32Array([
        0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0, // v0-v1-v2-v3 前
        1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0, // v0-v3-v4-v5 右
        0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0, // v0-v5-v6-v1 上
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 左
        0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0, // v7-v4-v3-v2 下
        0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0  // v4-v7-v6-v5 后
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

    // 写入顶点着色器缓冲区 (坐标和法向量)
    if (!initArrayBuffer(gl, 'a_Position', vertices, gl.FLOAT, 3)) return -1;
    if (!initArrayBuffer(gl, 'a_Normal', normals, gl.FLOAT, 3)) return -1;

    // 绑定缓冲区对象
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // 把顶点索引写入创建的缓冲区对象
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

function initArrayBuffer(gl, attribute, data, type, num) {
    // 创建一个缓冲区对象
    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return false;
    }
    // 把数据传递给缓冲区对象
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

// 变换坐标的矩阵
var g_modelMatrix = new Matrix4(), g_mvpMatrix = new Matrix4();
function draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
    //用以清空颜色缓冲区和深度缓冲区的背景色
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //绘制基底
    var baseHeight = 2.0;
    g_modelMatrix.setTranslate(0.0, -12.0, 0.0);
    drawBox(gl, n, 10.0, baseHeight, 10.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

    //arm1
    var arm1Length = 10.0;
    g_modelMatrix.translate(0.0, baseHeight, 0.0);     // 移至基底
    g_modelMatrix.rotate(g_arm1Angle, 0.0, 1.0, 0.0);  // 绕y轴旋转
    drawBox(gl, n, 3.0, arm1Length, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix); // 绘制

    //arm2
    var arm2Length = 10.0;
    g_modelMatrix.translate(0.0, arm1Length, 0.0);       // 移至joint1
    g_modelMatrix.rotate(g_joint1Angle, 0.0, 0.0, 1.0);  // 绕z轴旋转
    drawBox(gl, n, 4.0, arm2Length, 4.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix); // 绘制

    //A plam
    var palmLength = 2.0;
    g_modelMatrix.translate(0.0, arm2Length, 0.0);       // 移至palm
    g_modelMatrix.rotate(g_joint2Angle, 0.0, 1.0, 0.0);  // 绕y轴旋转
    drawBox(gl, n, 2.0, palmLength, 6.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);  // 绘制

    // 移至palm一段的中点
    g_modelMatrix.translate(0.0, palmLength, 0.0);

    // 绘制finger1
    pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(0.0, 0.0, 2.0);
    g_modelMatrix.rotate(g_joint3Angle, 1.0, 0.0, 0.0);  // 绕x轴旋转
    drawBox(gl, n, 1.0, 2.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
    g_modelMatrix = popMatrix();

    // 绘制finger2
    g_modelMatrix.translate(0.0, 0.0, -2.0);
    g_modelMatrix.rotate(-g_joint3Angle, 1.0, 0.0, 0.0);  // 绕x轴旋转
    drawBox(gl, n, 1.0, 2.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
}

var g_matrixStack = []; // 储存矩阵的栈
function pushMatrix(m) { // 将矩阵压入栈
    var m2 = new Matrix4(m);
    g_matrixStack.push(m2);
}

function popMatrix() { // 从栈中弹出来
    return g_matrixStack.pop();
}

var g_normalMatrix = new Matrix4();  // 变换法线的矩阵

// 绘制立方体
function drawBox(gl, n, width, height, depth, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
    pushMatrix(g_modelMatrix);   // 保存模型矩阵
    // 缩放立方体并绘制
    g_modelMatrix.scale(width, height, depth);
    // 计算模型视图投影矩阵并传给u_MvpMatrix变量
    g_mvpMatrix.set(viewProjMatrix);
    g_mvpMatrix.multiply(g_modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements);
    // 计算变换法线矩阵并传给u_NormalMatrix变量
    g_normalMatrix.setInverseOf(g_modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);
    // 绘制
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    g_modelMatrix = popMatrix();   // 获取之前保存的矩阵
}