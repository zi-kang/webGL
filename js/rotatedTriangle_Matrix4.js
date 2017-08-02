/**
 * Created by huzikang on 17/8/2.
 */
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n'+
    'uniform mat4 u_ModelMatrix;\n'+
    'void main(){\n'+
    ' gl_Position = u_ModelMatrix * a_Position;\n'+
    '}\n';

var FSHADER_SOURCE =
    'void main(){\n'+
    ' gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n'+
    '}\n';

var Tx = -0.1,
    Ty = 0.2,
    Tz = 0;

var ANGLE = 45.0;

var Sx = 1.5,
    Sy = 0.5,
    Sz = 1.0;

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

    //创建Matrix4对象以便进行模型变换
    var modelMatrix = new Matrix4();

    //计算模型矩阵
    modelMatrix.setRotate(ANGLE, 0, 0, 1);//设置模型转换为旋转矩阵
    modelMatrix.scale(Sx, Sy, Sz);//将模型矩阵乘以缩放矩阵
    modelMatrix.translate(Tx, Ty, Tz);//再将模型矩阵乘以平移矩阵

    //将模型矩阵传输给顶点着色器
    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_xformMatrix');
        return;
    }
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    gl.clearColor(0.5,0.5,0.5,1.0);
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLE_FAN, 0, n );
}

function initVertexBuffers(gl){
    var vertices = new Float32Array([
        -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, -0.5
    ]);
    var n = 4; //点的个数

    //创建缓冲区对象
    var vertexBuffer = gl.createBuffer();
    if( !vertexBuffer ){
        console.log( 'Failed to create the buffer object' );
        return -1;
    }

    //将缓冲区对象绑定到目标
    gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );

    //向缓冲区对象中写入数据
    gl.bufferData( gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW );
    var a_Position = gl.getAttribLocation( gl.program, 'a_Position' );
    if( a_Position < 0 ){
        console.log( 'Failed to get the stroge location of a_Position' );
        return;
    }

    //将缓冲区对象分配给a_Position变量
    gl.vertexAttribPointer( a_Position, 2, gl.FLOAT, false, 0, 0 );

    //连接a_Position变量分配给它的缓冲区对象
    gl.enableVertexAttribArray( a_Position );

    return n;
}
