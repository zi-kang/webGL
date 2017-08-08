/**
 * Created by huzikang on 17/8/8.
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

    gl.clearColor(0.5,0.5,0.5,1.0);

    //获取u_ViewMatrix变量的存储地址
    var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (u_ViewMatrix < 0) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return -1;
    }

    //创建视图矩阵的Matrix4对象
    var viewMatrix = new Matrix4();
    //注册键盘事件响应函数
    document.onkeydown = function(ev){
        keydown(ev, gl, n, u_ViewMatrix, viewMatrix, 0);
    };
    document.getElementsByClassName('left')[0].onclick = function(ev){
        keydown(ev, gl, n, u_ViewMatrix, viewMatrix, 2);
    };
    document.getElementsByClassName('right')[0].onclick = function(ev){
        keydown(ev, gl, n, u_ViewMatrix, viewMatrix, 1);
    };
    document.getElementsByClassName('pre')[0].onclick = function(ev){
        keydown(ev, gl, n, u_ViewMatrix, viewMatrix, 3);
    };
    document.getElementsByClassName('back')[0].onclick = function(ev){
        keydown(ev, gl, n, u_ViewMatrix, viewMatrix, 4);
    };


    draw(gl, n, u_ViewMatrix, viewMatrix);
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

var g_eyeX = 0.20, g_eyeY = 0.25, g_eyeZ = 0.25; // 视点

function keydown(ev, gl, n, u_ViewMatrix, viewMatrix, num) {
    if(ev.keyCode == 39 || num == 1) { // 按下右键
        g_eyeX += 0.01;
    } else if (ev.keyCode == 37 || num == 2 ) { // 按下左键
        g_eyeX -= 0.01;
    } else if(ev.keyCode == 38 || num == 3){ //按下上键
        g_eyeY += 0.01;
    }else if(ev.keyCode == 40 || num == 4){ //按下下键
        g_eyeY -= 0.01;
    } else { //按下其他的键
        return;
    }
    draw(gl, n, u_ViewMatrix, viewMatrix);
}

function draw(gl, n, u_ViewMatrix, viewMatrix) {
    //设置视点和视线
    viewMatrix.setLookAt(g_eyeX, g_eyeY, g_eyeZ, 0, 0, 0, 0, 1, 0);

    // 将视图矩阵传递给u_ViewMatrix矩阵
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT);     // Clear <canvas>

    gl.drawArrays(gl.TRIANGLES, 0, n); // Draw the rectangle
}
