/**
 * Created by huzikang on 17/8/3.
 */
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute float a_PointSize;\n' +
    'void main() {\n' +
    '  gl_Position = a_Position;\n' +
    '  gl_PointSize = a_PointSize;\n' +
    '}\n';
var FSHADER_SOURCE =
    'void main(){\n'+
    ' gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n'+
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
}

function initVertexBuffers(gl){
    var verticesSizes = new Float32Array([
        // 顶点坐标和点的尺寸
        10.0, -0.5, 0.5,  // 第一个点
        20.0, -0.5, -0.5,  // 第二个点
        30.0, 0.5, 0.5,   // 第三个点
        5.0, 0.5, -0.5   // 第四个点
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
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 3, FSIZE );
    gl.enableVertexAttribArray(a_Position);  // 开启分配

    // 获取a_PointSize的存储位置，并分配缓冲区开启
    var a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
    if(a_PointSize < 0) {
        console.log('Failed to get the storage location of a_PointSize');
        return -1;
    }
    gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, FSIZE * 3, 0);
    gl.enableVertexAttribArray(a_PointSize);  // 开启缓冲区

    // 解除绑定的缓冲区对象
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return n;
}


