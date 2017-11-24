const fs = require('fs');
const gulp = require('gulp');
const modifyCssUrls = require('gulp-modify-css-urls');
const stripCssComments = require('gulp-strip-css-comments');

let source = 'F:/SIMS_CODE3/modules/sim5service';
let destination = 'F:/temp';

gulp.task('main', function(done) {
    return gulp.src([source + '/**/*.css',
                `!${source}/**/node_modules/**/*`
            ])
            .pipe(stripCssComments())
            .pipe(modifyCssUrls({
                modify: function(url, filePath) {

                    logIfContent(url, filePath);
                    
                    if (url.indexOf("?") != -1) {
                        // not modifying the url as of now if '?' is already present 
                        return url;
                    } else {
                        return url + '?' + 'rd=yyy';
                    }
                }
            }))
            .on('error', (err)=> {
                console.error('Error encountered on modifyCssUrls' + err.message);
            })
            //.pipe(gulp.dest(destination))
            .on('end', function() { 
                console.log('DONE!!!'); 
            });
});

function logIfContent(url, filePath) {

    url = url.toLowerCase();
    filePath = filePath.toLowerCase();

    //for file path having \
    let contentSubPaths = [ 'app\\comps\\', 'app\\comps2016\\', 'app\\controls\\', 'app\\controls2016\\', 'taskxmls2016\\', 'taskxmls\\' ];

    //for urls having /
    let modContentSubPaths = contentSubPaths.map(path => {
        return path.replace(/\\/gi, '/');
    });

    let isContentFile = false;
    contentSubPaths.every((subPath) => {
        if(filePath.indexOf(subPath) !== -1) { //ignore if not css file is in content
            isContentFile = true;
            return false;
        }
        return true;
    });

    if(isContentFile) {
        let str = `content-file,${filePath},${url}\r\n`;
        appendToFile(str);
    }
    else { //code file
        
        let isContentUrl = false;

        modContentSubPaths.every(subPath => {
            if(url.indexOf(subPath) !== -1) { //url belongs to content
                isContentUrl = true;
                return false;
            }
            return true;
        });

        if(isContentUrl) {
            let str = `code-file-content-url,${filePath},${url}\r\n`;
            appendToFile(str);
        }
        else {
            let str = `code-file-code-url,${filePath},${url}\r\n`;
            appendToFile(str);
        }
    }
}

let fstream;
function appendToFile(str) {

    if(!fstream) {
        fstream = fs.createWriteStream('./output.csv');
    }

    fstream.write(str);
    process.stdout.write(str);
}