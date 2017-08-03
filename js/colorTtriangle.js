/**
 * Created by huzikang on 17/8/3.
 */
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute float a_PointSize;\n' +
    'attribute vec4 a_Color;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = a_Position;\n' +
    '  gl_PointSize = a_PointSize;\n' +
    '  v_Color = a_Color;\n' +
    '}\n';
var FSHADER_SOURCE =
    "precision mediump float;\n" +//!!! 需要声明浮点数精度，否则报错No precision specified for (float)
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
    if( !gl ) {
        console.log('不能正确获取webgl绘图上下文');
        return;
    }
    if( !initShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE) ){
        console.log( 'Falied to initialize shaders.' );
        return;
    }
    var n = initVertexBuffers(gl);
    if( n < 0 ){
        console.log( 'Failed to get the stroge location of a_Position' );
        return;
    }

    gl.clearColor(0.5,0.5,0.5,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, n);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, n);
}

function initVertexBuffers(gl){
    var verticesSizes = new Float32Array([
        // 顶点坐标和点的尺寸
        -0.5, 0.5, 10.0, 1.0, 0.0, 0.0,   // 第一个点
        -0.5, -0.5, 20.0, 0.0, 1.0, 0.0,  // 第二个点
        0.5, 0.5, 30.0, 0.0, 0.0, 1.0,    // 第三个点
        0.5, -0.5, 5.0, 1.0, 0.0, 1.0  // 第四个点
    ]);
    var n = 4; // The number of vertices

    //创建缓冲区对象
    var vertexSizeBuffer = gl.createBuffer();
    if (!vertexSizeBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    //将顶点坐标和尺寸写入缓冲区并开启
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexSizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesSizes, gl.STATIC_DRAW);

    var FSIZE = verticesSizes.BYTES_PER_ELEMENT;
    //获取a_Position的存储位置，分配缓冲区并开启
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 6, 0 );
    gl.enableVertexAttribArray(a_Position);  // 开启分配

    // 获取a_PointSize的存储位置，并分配缓冲区开启
    var a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
    if(a_PointSize < 0) {
        console.log('Failed to get the storage location of a_PointSize');
        return -1;
    }
    gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, FSIZE * 6, FSIZE * 2);
    gl.enableVertexAttribArray(a_PointSize);  // 开启缓冲区

    // 获取a_Color的存储位置，并分配缓冲区开启
    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if(a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return -1;
    }
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color);  // 开启缓冲区

    // 解除绑定的缓冲区对象
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return n;
}


