/**
 * Created by huzikang on 17/8/11.
 */
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'uniform mat4 u_ViewProjMatrix;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = u_ViewProjMatrix * a_Position;\n' +
    '  v_Color = a_Color;\n' +
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

    gl.enable(gl.DEPTH_TEST);

    //获取u_ViewProjMatrix变量的存储地址
    var u_ViewProjMatrix = gl.getUniformLocation(gl.program, 'u_ViewProjMatrix');
    if (!u_ViewProjMatrix) {
        console.log('Failed to get the storage locations of u_ViewProjMatrix');
        return;
    }

    var viewProjMatrix = new Matrix4();

    viewProjMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
    viewProjMatrix.lookAt(3.06, 2.5, 10.0, 0, 0, -2, 0, 1, 0);

    gl.uniformMatrix4fv(u_ViewProjMatrix, false, viewProjMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // 启用多边形偏移
    gl.enable(gl.POLYGON_OFFSET_FILL);
    // Draw the triangles
    gl.drawArrays(gl.TRIANGLES, 0, n/2);   // The green triangle
    gl.polygonOffset(1.0, 1.0);          // 设置多边形偏移
    gl.drawArrays(gl.TRIANGLES, n/2, n/2); // The yellow triangle


}

function initVertexBuffers(gl){
    var verticesColors = new Float32Array([
        //顶点坐标和颜色
        0.0,  2.5,  -5.0,  0.4,  1.0,  0.4, // The green triangle
        -2.5, -2.5,  -5.0,  0.4,  1.0,  0.4,
        2.5, -2.5,  -5.0,  1.0,  0.4,  0.4,

        0.0,  3.0,  -5.0,  1.0,  0.4,  0.4, // The yellow triagle
        -3.0, -3.0,  -5.0,  1.0,  1.0,  0.4,
        3.0, -3.0,  -5.0,  1.0,  1.0,  0.4,
    ]);
    var n = 6;

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

