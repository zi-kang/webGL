/**
 * Created by huzikang on 17/7/27.
 */
function main(){
    var canvas = document.getElementById('webgl');
    if( !canvas ){
        console.log( 'Failed to retrieve the <canvas> element' );
        return;
    }
    var gl = getWebGLContext(canvas);
    if( !gl ){
        console.log( '不能正确获取webgl元素' );
        return;
    }
    gl.clearColor(0.0,0.0,1.0,1.0);
    gl.clear( gl.COLOR_BUFFER_BIT );
}