/**
 * Created by huzikang on 17/7/28.
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
    'void main() {\n' +
    ' gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n'+
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
                click(ev,gl,canvas,a_Position);
            }else{
                return;
            }

        }
    }

    //将定点位置传递给attribute变量
    gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);

    gl.clearColor(0.5,0.5,0.5,1.0);
    gl.clear( gl.COLOR_BUFFER_BIT );

    var g_points = [];
    function click(ev,gl,canvas,a_Position){
        var x = ev.clientX,
            y = ev.clientY,
            rect = ev.target.getBoundingClientRect();
        x = ( (x-rect.left) - canvas.height/2 )/(canvas.height/2);
        y = ( canvas.width/2 - (y - rect.top) )/(canvas.width/2);

        g_points.push(x);
        g_points.push(y);

        gl.clear(gl.COLOR_BUFFER_BIT);

        var len = g_points.length;
        for( var i = 0; i < len; i +=2 ){
            gl.vertexAttrib3f(a_Position,g_points[i],g_points[i+1],0.0);
            //绘制一个点
            gl.drawArrays(gl.POINTS, 0, 1);
        }
    }
}