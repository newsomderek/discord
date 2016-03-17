var gulp = require('gulp');
var gutil = require('gulp-util');
var del = require('del');
var rename = require('gulp-rename');
var install = require('gulp-install');
var zip = require('gulp-zip');
var AWS = require('aws-sdk');
var fs = require('fs');
var runSequence = require('run-sequence');
var mocha = require('gulp-mocha')
var stylish = require('jshint-stylish');
var jshint = require('gulp-jshint')

var LAMBDA_FUNCTION_NAME = 'uptimeTracker';
var REGION = 'us-west-2';

/**
 * Copy JS code from folder to distribution directory
 * @param {String} taskName Contains gulp task name to use
 * @param {String} source Contains source directory name
 * @param {String} destination Contains destination directory name
 */
var gulpTaskPackageJavascript = function(taskName, source, destination) {

    destination = destination || source;

    gulp.task(taskName, function() {
        return gulp.src([source + '/*.js', '!node_modules'])
            .pipe(gulp.dest('dist/' + destination + '/'))
    });

};

/**
 * Install package.json dependencies into distribution directory
 * @param {String} taskName Contains gulp task name to use
 * @param {String} source Contains source directory name
 * @param {String} destination Contains destination directory name
 */
var gulpTaskInstallDependencies = function(taskName, source, destination) {

    destination = destination || source;

    gulp.task(taskName, function() {
        return gulp.src(source + '/package.json')
            .pipe(gulp.dest('./dist/' + destination + '/'))
            .pipe(install({
                production: true
            }));
    });

};

/**
 * Copy over environment variables managed outside of source control
 * @param {String} taskName Contains gulp task name to use
 * @param {String} directory Contains source and destination directory name
 */
var gulpTaskSetupEnvironment = function(taskName, directory) {

    gulp.task(taskName, function() {
        return gulp.src('./config.env.production')
            .pipe(rename('.env'))
            .pipe(gulp.dest('./dist/' + directory + '/'))
    });

};

/**
 * Zip up code in preparation for delivery to AWS Lambda service
 * @param {String} taskName Contains gulp task name to use
 * @param {String} directory Contains source and destination directory name
 */
var gulpTaskZipCode = function(taskName, directory) {

    gulp.task(taskName, function() {
        return gulp.src(['dist/' + directory + '/**/*', '!dist/' + directory + '/package.json', 'dist/' + directory + '/.*'])
            .pipe(zip('dist/' + directory + '/dist.zip'))
            .pipe(gulp.dest('./'));
    });

};

/**
 * Upload lambda function code to AWS
 * @param {String} taskName Contains gulp task name to use
 * @param {String} functionName Contains the lambda function's name
 * @param {String} directory Contains distribution source directory name
 */
var gulpTaskUploadCode = function(taskName, functionName, directory) {

    gulp.task(taskName, function() {

        AWS.config.region = REGION;

        var lambda = new AWS.Lambda();

        lambda.getFunction({
            FunctionName: functionName
        }, function(err, data) {

            if (err) {
                if (err.statusCode === 404) {
                    var warning = 'Unable to find lambda function ' + functionName + '. '
                    warning += 'Verify the lambda function name and AWS region are correct.'
                    gutil.log(warning);
                } else {
                    var warning = 'AWS API request failed. '
                    warning += 'Check your AWS credentials and permissions.'
                    gutil.log(warning);
                }
            } else {
                // This is a bit silly, simply because these five parameters are required.
                var current = data.Configuration;
                var params = {
                    FunctionName: functionName,
                    Handler: current.Handler,
                    Mode: current.Mode,
                    Role: current.Role,
                    Runtime: current.Runtime
                };

                fs.readFile('./dist/' + directory + '/dist.zip', function(err, zip) {
                    params['FunctionZip'] = zip;
                    params.Code = {
                        ZipFile: zip
                    }
                    lambda.updateFunctionCode({
                        FunctionName: params.FunctionName,
                        ZipFile: params.Code.ZipFile
                    }, function(err, data) {
                        if (err) {
                            var warning = 'Package upload failed. '
                            warning += 'Check your iam:PassRole permissions.'
                            gutil.log(warning);
                        } else {
                            gutil.log("Successful function upload");
                        }
                    });
                });
            }

        });

    });

};

gulpTaskPackageJavascript('jsUtilities', 'util');
gulpTaskInstallDependencies('npmUtilities', '.', 'util');
gulpTaskSetupEnvironment('envUtilities', 'util');
gulpTaskPackageJavascript('jsUtilitiesUptimeTracker', 'util', 'uptime-tracker');

gulpTaskPackageJavascript('jsUptimeTracker', 'uptime-tracker');
gulpTaskInstallDependencies('npmUptimeTracker', 'uptime-tracker');
gulpTaskSetupEnvironment('envUptimeTracker', 'uptime-tracker');
gulpTaskZipCode('zipUptimeTracker', 'uptime-tracker');
gulpTaskUploadCode('uploadUptimeTracker', LAMBDA_FUNCTION_NAME, 'uptime-tracker');

var processUptimeSequence = ['jsUptimeTracker', 'jsUtilitiesUptimeTracker', 'npmUptimeTracker', 'envUptimeTracker'];

var utilitySequence = ['jsUtilities', 'npmUtilities', 'envUtilities'];

/**
 * Delete the compiled distribution directory
 */
gulp.task('clean', function() {
    return del(['./dist']);
});

/**
 * Run the build sequence to compile code into distribution directory
 */
gulp.task('build', function(callback) {
    return runSequence(
        ['clean'], processUptimeSequence, utilitySequence, callback
    );
});

/**
 * Upload all compiled code to AWS Lambda service
 */
gulp.task('upload', function(callback) {
    return runSequence(
        ['clean'], processUptimeSequence, ['zipUptimeTracker'], ['uploadUptimeTracker'],
        callback
    );
});

/**
 * Defailt shorthand for a regular build process
 */
gulp.task('default', function(callback) {
    return runSequence(
        ['build'], callback
    );
});

/**
 * Lint all javascript files
 */
gulp.task('lint', function() {
    return gulp.src(['./util/**/*', './uptime-tracker/**/*'])
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'))
});

/**
 * Test runner without pre-compilcation phase
 */
gulp.task('tdd', ['lint'], function() {
    return gulp.src(['./test/**/*.js'], {
            read: false
        })
        .pipe(mocha({
            bail: true
        }))
        .once('end', function() {
            process.exit();
        });;
});

/**
 * Build distribution code first and then test from the compiled code
 */
gulp.task('test', function(callback) {
    return runSequence(
        ['build'], ['tdd'], callback
    );
});
