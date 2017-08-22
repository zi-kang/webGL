/**
 * Created by huzikang on 17/8/22.
 */
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'uniform float a_Face;\n' + //表面编号(不能使用int整形)
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform int u_PickedFace;\n' + //被选中表面的编号
    'varying vec4 v_Color;\n' +
    'void main(){\n'+
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    '  int face = int(a_Face);\n' + // 转为int型
    '  vec3 color = (face == u_PickedFace) ? vec3(1.0) : a_Color.rgb;\n' +
    '  if(u_PickedFace == 0) {\n' + // 将表面编号写入alpha分量
    '    v_Color = vec4(color, a_Face/255.0);\n' +
    '  } else {\n' +
    '    v_Color = vec4(color, a_Color.a);\n' +
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


function isMobile(){
    var sUserAgent= navigator.userAgent.toLowerCase(),
        bIsIpad= sUserAgent.match(/ipad/i) == "ipad",
        bIsIphoneOs= sUserAgent.match(/iphone os/i) == "iphone os",
        bIsMidp= sUserAgent.match(/midp/i) == "midp",
        bIsUc7= sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4",
        bIsUc= sUserAgent.match(/ucweb/i) == "ucweb",
        bIsAndroid= sUserAgent.match(/android/i) == "android",
        bIsCE= sUserAgent.match(/windows ce/i) == "windows ce",
        bIsWM= sUserAgent.match(/windows mobile/i) == "windows mobile",
        bIsWebview = sUserAgent.match(/webview/i) == "webview";
    return (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM);
}

var touchStart,touchMove,touchEnd;
touchStart = isMobile() ? 'touchstart' : 'mousedown';
touchMove = isMobile() ? 'touchmove' : 'mousemove';
touchEnd = isMobile() ? 'touchend' : 'mouseup';


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
    var u_PickedFace = gl.getUniformLocation(gl.program, 'u_PickedFace');
    if (!u_MvpMatrix || !u_PickedFace) {
        console.log('Failed to get the storage location of uniform variable');
        return;
    }

    // 计算视图投影矩阵
    var viewProjMatrix = new Matrix4();
    viewProjMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0);
    viewProjMatrix.lookAt(0.0, 0.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

    // 初始换被选中的表面
    gl.uniform1i(u_PickedFace, -1);

    var currentAngle = 0.0; // 当前旋转角度
    //注册事件响应函数
    canvas.addEventListener(touchStart, function(ev){
        //鼠标按下时
        var x,y;
        x = touchStart == 'touchstart' ? ev.targetTouches[0].pageX : ev.clientX;
        y = touchStart == 'touchstart' ? ev.targetTouches[0].pageY : ev.clientY;

        var rect = ev.target.getBoundingClientRect();
        if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
            // 如果点击事件发生在canva区域内则更新表面
            var x_in_canvas = x - rect.left, y_in_canvas = rect.bottom - y;
            var face = checkFace(gl, n, x_in_canvas, y_in_canvas, currentAngle, u_PickedFace, viewProjMatrix, u_MvpMatrix);
            gl.uniform1i(u_PickedFace, face); // 传入表面编号
            draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix);
        }
    });

    var tick = function() {   // 开始绘制
        currentAngle = animate(currentAngle);
        draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix);
        requestAnimationFrame(tick, canvas);
    };
    tick();
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
        1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,    // v0-v1-v2-v3 前表面
        1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,    // v0-v3-v4-v5 右表面
        1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,    // v0-v5-v6-v1 上表面
        -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,    // v1-v6-v7-v2 左表面
        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,    // v7-v4-v3-v2 下表面
        1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0     // v4-v7-v6-v5 后表面
    ]);

    var colors = new Float32Array([   // Colors
        0.32, 0.18, 0.56, 0.32, 0.18, 0.56, 0.32, 0.18, 0.56, 0.32, 0.18, 0.56, // v0-v1-v2-v3 前表面
        0.5, 0.41, 0.69, 0.5, 0.41, 0.69, 0.5, 0.41, 0.69, 0.5, 0.41, 0.69,  // v0-v3-v4-v5 右表面
        0.78, 0.69, 0.84, 0.78, 0.69, 0.84, 0.78, 0.69, 0.84, 0.78, 0.69, 0.84, // v0-v5-v6-v1 上表面
        0.0, 0.32, 0.61, 0.0, 0.32, 0.61, 0.0, 0.32, 0.61, 0.0, 0.32, 0.61,  // v1-v6-v7-v2 左表面
        0.27, 0.58, 0.82, 0.27, 0.58, 0.82, 0.27, 0.58, 0.82, 0.27, 0.58, 0.82, // v7-v4-v3-v2 下表面
        0.73, 0.82, 0.93, 0.73, 0.82, 0.93, 0.73, 0.82, 0.93, 0.73, 0.82, 0.93, // v4-v7-v6-v5 后表面
    ]);

    var faces = new Uint8Array([   // 表面编号
        1, 1, 1, 1,     // v0-v1-v2-v3 前表面
        2, 2, 2, 2,     // v0-v3-v4-v5 右表面
        3, 3, 3, 3,     // v0-v5-v6-v1 上表面
        4, 4, 4, 4,     // v1-v6-v7-v2 左表面
        5, 5, 5, 5,     // v7-v4-v3-v2 下表面
        6, 6, 6, 6,     // v4-v7-v6-v5 后表面
    ]);

    var indices = new Uint8Array([   // 顶点索引
        0, 1, 2, 0, 2, 3,    // 前表面
        4, 5, 6, 4, 6, 7,    // 右表面
        8, 9, 10, 8, 10, 11,    // 上表面
        12, 13, 14, 12, 14, 15,    // 左表面
        16, 17, 18, 16, 18, 19,    // 下表面
        20, 21, 22, 20, 22, 23     // 后表面
    ]);

    // 创建缓存区对象
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        return -1;
    }

    // 将顶点信息传递给缓存区对象
    if (!initArrayBuffer(gl, vertices, gl.FLOAT, 3, 'a_Position')) return -1; // Coordinates Information
    if (!initArrayBuffer(gl, colors, gl.FLOAT, 3, 'a_Color')) return -1;      // Color Information
    if (!initArrayBuffer(gl, faces, gl.UNSIGNED_BYTE, 1, 'a_Face')) return -1;// Surface Information

    // 绑定这个缓存区对象
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // 将索引信息传递给这个缓存区对象
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

function checkFace(gl, n, x, y, currentAngle, u_PickedFace, viewProjMatrix, u_MvpMatrix) {
    var pixels = new Uint8Array(4); // 储存像素值的数组
    gl.uniform1i(u_PickedFace, 0);  // 将表面编号写入alpha分量
    draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix);
    //读取（x，y）处的像素颜色，pixels[3]中储存了表面编号
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    return pixels[3];
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