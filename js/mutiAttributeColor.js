/**
 * Created by huzikang on 17/8/3.
 */
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute float a_PointSize;\n' +
    'attribute vec4 a_Color;\n' +
    'varying vec4 v_Color;\n' + //varying变量
    'void main() {\n' +
    '  gl_Position = a_Position;\n' +
    '  gl_PointSize = a_PointSize;\n' +
    '  v_Color = a_Color;\n' +//将数据传给片元着色器
    '}\n';
var FSHADER_SOURCE =
    'precision mediump float;\n' + // Precision qualifier (See Chapter 6)
    'varying vec4 v_Color;\n' +
    'void main(){\n'+
    ' gl_FragColor = v_Color;\n'+//从顶点着色器接收数据
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
    //设置顶点位置大小与颜色
    var n = initVertexBuffers(gl);
    if( n < 0 ){
        console.log( 'Failed to get the stroge location of a_Position' );
        return;
    }

    gl.clearColor(0.5,0.5,0.5,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, n);
}
function initVertexBuffers(gl) {
    //顶点坐标和点的尺寸
    var verticesSizes = new Float32Array([
        -0.5, 0.5, 10.0, 1.0, 0.0, 0.0,  // 第一个点
        -0.5, -0.5, 20.0, 0.0, 1.0, 0.0,  // 第二个点
        0.5, 0.5, 30.0,  0.0, 0.0, 1.0,   // 第三个点
        0.5, -0.5, 5.0, 1.0, 0.5, 0.5   // 第四个点
    ]);
    var n = 4;

    //创建缓冲区
    var vertexSizeBuffer = gl.createBuffer();
    if(!vertexSizeBuffer){
        console.log("无法创建缓冲区对象");
        return -1;
    }

    //将顶点坐标和尺寸写入缓冲区并开启
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexSizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,verticesSizes,gl.STATIC_DRAW);

    //获取Float32Array中每个元素所占的字节数
    var FSIZE = verticesSizes.BYTES_PER_ELEMENT;

    //获取a_Position的存储位置，分配缓冲区并开启
    var a_Position = gl.getAttribLocation(gl.program,"a_Position");

    if(a_Position < 0){
        console.log("无法获取顶点的存储位置");
        return;
    }
    //对位置进行分配
    gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,FSIZE*6,0);
    //开启分配
    gl.enableVertexAttribArray(a_Position);

    //获取a_PointSize的存储位置
    var a_Color = gl.getAttribLocation(gl.program,"a_Color");
    if(a_Color < 0){
        console.log("Failed to get the storage location of a_Color");
        return;
    }
    //对颜色进行分配
    gl.vertexAttribPointer(a_Color,3,gl.FLOAT,false,FSIZE*6,FSIZE*3);
    //开启分配
    gl.enableVertexAttribArray(a_Color);


    // 获取a_PointSize的存储位置，并分配缓冲区开启
    var a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
    if(a_PointSize < 0) {
        console.log('Failed to get the storage location of a_PointSize');
        return -1;
    }
    gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, FSIZE * 6, FSIZE * 2);
    gl.enableVertexAttribArray(a_PointSize);  // 开启缓冲区

    return n;
}
