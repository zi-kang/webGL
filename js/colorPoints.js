/**
 * Created by huzikang on 17/7/29.
 */

//顶点着色器函数
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n'+
    'void main(){\n' +
    'gl_Position = a_Position;\n' +
    'gl_PointSize = 5.0;\n' +
    '}\n';

//片元着色器函数
var FSHADER_SOURCE =
    'precision mediump float;\n'+
    'uniform vec4 u_FragColor;\n'+//uniform变量
    'void main() {\n' +
    ' gl_FragColor = u_FragColor;\n'+
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

    //获取a_Position变量的储存位置
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if( a_Position < 0 ){
        console.log( 'Failed to get the stroge location of a_Position' );
        return;
    }
    //获取u_FragColor变量的储存位置
    var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    console.log( u_FragColor );

    var status = 0;
    //注册鼠标点击事件响应函数
    canvas.onmousedown = function(ev){
        status = 1;
        moves();

    }
    canvas.onmouseup = function(ev){
        status = 0;
        moves();

    }
    function moves(){
        canvas.onmousemove = function(ev){
            if( status == 1 ){
                click(ev,gl,canvas,a_Position,u_FragColor);
            }else{
                return;
            }

        }
    }

    //将定点位置传递给attribute变量
    gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);

    gl.clearColor(0.5,0.5,0.5,1.0);
    gl.clear( gl.COLOR_BUFFER_BIT );
}

var g_points = [];
var g_colors = [];
function click(ev,gl,canvas,a_Position,u_FragColor){
    var x = ev.clientX,
        y = ev.clientY,
        rect = ev.target.getBoundingClientRect();
    x = ( (x-rect.left) - canvas.height/2 )/(canvas.height/2);
    y = ( canvas.width/2 - (y - rect.top) )/(canvas.width/2);

    //将坐标储存到g_points数组中
    g_points.push([x,y]);

    //将点的颜色储存到g_colors数组中
    if( x >= 0.0 && y >= 0.0 ){ //第一象限
        g_colors.push([1.0, 0.0, 0.0, 1.0]);//红色
    }else if( x < 0.0 && y < 0.0 ){//第三象限
        g_colors.push([0.0, 1.0, 0.0, 1.0]);//绿色
    }else if( x >= 0.0 && y < 0.0 ){ //第四象限
        g_colors.push([1.0, 1.0, 1.0, 1.0]);//白色
    }else{ //第二象限
        g_colors.push([0.0, 0.0, 1.0, 1.0]);//蓝色
    }

    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_points.length;
    for( var i = 0; i < len; i ++ ){
        var xy = g_points[i],
            rgba = g_colors[i];

        //将点的位置传输到a_Position变量中
        gl.vertexAttrib3f(a_Position,xy[0],xy[1],0.0);

        //将点的颜色传输到u_FragColor变量中
        gl.uniform4f( u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3] );
        //绘制点
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}