/**
 * Created by kang on 2017/8/20.
 */
var gulp = require('gulp'),
    connect = require('gulp-connect');


gulp.task('localhost',function(){
    connect.server({
        root:'./',
        port:8904
    });

});


gulp.task('default',['localhost']);