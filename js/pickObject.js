/**
 * Created by kang on 2017/8/20.
 */
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform bool u_Clicked;\n' + //鼠标按下
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    '  if (u_Clicked) {\n' + //  鼠标按下时用红色进行绘制
    '    v_Color = vec4(1.0, 0.0, 0.0, 1.0);\n' +
    '  } else {\n' +
    '    v_Color = a_Color;\n' +
    '  }\n' +
    '}\n';

var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_FragColor = v_Color;\n' +
    '}\n';

var ANGLE_STEP = 20.0; // 每秒钟旋转的角度

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

    // 设置顶点等信息
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
    var u_Clicked = gl.getUniformLocation(gl.program, 'u_Clicked');
    if (!u_MvpMatrix || !u_Clicked) {
        console.log('Failed to get the storage location of uniform variable');
        return;
    }

    // 计算视图投影矩阵
    var viewProjMatrix = new Matrix4();
    viewProjMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0);
    viewProjMatrix.lookAt(0.0, 0.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

    gl.uniform1i(u_Clicked, 0); // 将false传给u_Clicked变量

    var currentAngle = 0.0; //当前旋转角度
    // 注册事件响应函数
    canvas.onclick = function(ev) {   //鼠标按下时
        var x = ev.clientX, y = ev.clientY;
        var rect = ev.target.getBoundingClientRect();
        if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
            // 如果点击事件发生在canva区域内检测是否点击在立方体上
            var x_in_canvas = x - rect.left, y_in_canvas = rect.bottom - y;
            var picked = check(gl, n, x_in_canvas, y_in_canvas, currentAngle, u_Clicked, viewProjMatrix, u_MvpMatrix);
            if (picked) alert('你点到我了，在：('+x_in_canvas+', '+y_in_canvas+')处！');
        }
    }

    var tick = function() {   // 开始绘制
        currentAngle = animate(currentAngle);
        draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix);
        requestAnimationFrame(tick, canvas);
    };
    tick();
}

function initVertexBuffers(gl) {
    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    var vertices = new Float32Array([   // 顶点坐标
        1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
        1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
        1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
        -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
        -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
        1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
    ]);

    var colors = new Float32Array([   // 颜色
        0.2, 0.58, 0.82,   0.2, 0.58, 0.82,   0.2,  0.58, 0.82,  0.2,  0.58, 0.82, // v0-v1-v2-v3 front
        0.5,  0.41, 0.69,  0.5, 0.41, 0.69,   0.5, 0.41, 0.69,   0.5, 0.41, 0.69,  // v0-v3-v4-v5 right
        0.0,  0.32, 0.61,  0.0, 0.32, 0.61,   0.0, 0.32, 0.61,   0.0, 0.32, 0.61,  // v0-v5-v6-v1 up
        0.78, 0.69, 0.84,  0.78, 0.69, 0.84,  0.78, 0.69, 0.84,  0.78, 0.69, 0.84, // v1-v6-v7-v2 left
        0.32, 0.18, 0.56,  0.32, 0.18, 0.56,  0.32, 0.18, 0.56,  0.32, 0.18, 0.56, // v7-v4-v3-v2 down
        0.73, 0.82, 0.93,  0.73, 0.82, 0.93,  0.73, 0.82, 0.93,  0.73, 0.82, 0.93, // v4-v7-v6-v5 back
    ]);
    /*var colors = new Float32Array([   // 颜色(纯红)
        1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  1.0, 0.0, 0.0, // v0-v1-v2-v3 front
        1.0, 0.0, 0.0,  1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
       1.0, 0.0, 0.0,  1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v5-v6-v1 up
        1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0, // v1-v6-v7-v2 left
        1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0, // v7-v4-v3-v2 down
        1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0, // v4-v7-v6-v5 back
    ]);*/

    // 顶点索引
    var indices = new Uint8Array([
        0, 1, 2,   0, 2, 3,    // front
        4, 5, 6,   4, 6, 7,    // right
        8, 9,10,   8,10,11,    // up
        12,13,14,  12,14,15,    // left
        16,17,18,  16,18,19,    // down
        20,21,22,  20,22,23     // back
    ]);

    // 将顶点信息传递给缓存区对象
    if (!initArrayBuffer(gl, vertices, gl.FLOAT, 3, 'a_Position')) return -1; //坐标信息
    if (!initArrayBuffer(gl, colors, gl.FLOAT, 3, 'a_Color')) return -1;      // 颜色信息

    // 创建缓存区对象
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        return -1;
    }
    // 将索引信息传递给这个缓存区对象
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

function check(gl, n, x, y, currentAngle, u_Clicked, viewProjMatrix, u_MvpMatrix) {
    var picked = false;
    gl.uniform1i(u_Clicked, 1);  // 将true传给u_Clicked变量
    draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix); // 将立方体绘制为红色
    // 读取点击位置的像素颜色值
    var pixels = new Uint8Array(4); // 储存像素值的数组
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    if (pixels[0] == 255) // 如果R(pixels[0])是255则判定点击在物体上
        picked = true;

    gl.uniform1i(u_Clicked, 0);  // 将false传递给u_Clicked变量以重绘正常状态的立方体
    draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix); // 绘制立方体

    return picked;
}

var g_MvpMatrix = new Matrix4(); // 模型视图投影矩阵
function draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix) {
    //计算模型视图投影矩阵并传递给u_MvpMatrix变量
    g_MvpMatrix.set(viewProjMatrix);
    g_MvpMatrix.rotate(currentAngle, 1.0, 0.0, 0.0); // 自然地旋转
    g_MvpMatrix.rotate(currentAngle, 0.0, 1.0, 0.0);
    g_MvpMatrix.rotate(currentAngle, 0.0, 0.0, 1.0);
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);     // 清空缓存区
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);   // 绘制
}

var last = Date.now(); // 下一次调用函数的时间
function animate(angle) {
    var now = Date.now();   // 计算时间间隔
    var elapsed = now - last;
    last = now;
    // 根据时间调整旋转的角度
    var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    return newAngle % 360;
}

function initArrayBuffer (gl, data, type, num, attribute) {
    // 创建一个缓存区对象
    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return false;
    }
    // 把数据写入这个缓存区对象中去
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    //  将缓冲区对象分配给attribute变量
    var a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0) {
        console.log('Failed to get the storage location of ' + attribute);
        return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    //开启a_attribute变量
    gl.enableVertexAttribArray(a_attribute);

    return true;
}