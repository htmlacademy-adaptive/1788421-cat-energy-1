import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import browser from 'browser-sync';
import htmlmin from 'gulp-htmlmin';
import rename from 'gulp-rename';
import cache from 'gulp-cache';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import csso from 'postcss-csso';
import gcssmq from 'gulp-group-css-media-queries';
import terser from 'gulp-terser';
import sharp from 'gulp-sharp-responsive';
import { stacksvg } from 'gulp-stacksvg';
import delet from 'del';
import imagemin, {
    mozjpeg,
    optipng,
    svgo
} from 'gulp-imagemin';
import bemlinter from 'gulp-html-bemlinter';

// Sass to css

export function scssToCss() { //переводит синтаксис SASS в стандартный CSS;
    return gulp.src('source/sass/style.scss', { sourcemaps: true }) //обращается к исходному файлу style.scss;
        .pipe(plumber())
        .pipe(sass().on('error', sass.logError)) //показывает в терминале информацию о наличии ошибок в исходном файле;

        .pipe(gulp.dest('source/css', { sourcemaps: '.' }))
        .pipe(browser.stream())
}

// =============== минимизация ============

// html-MIN

export function htmlMinif() {
    return gulp.src('source/*.html')
        .pipe(plumber())
        .pipe(htmlmin({
            removeComments: true,
            collapseWhitespace: true
        }))   
        .pipe(gulp.dest('build'))
        .pipe(browser.stream());
}


// css-MIN

export function cssMinif() {
    return gulp.src('source/css/*.css', { sourcemaps: true })
        .pipe(plumber())
        .pipe(gcssmq()) // группирует вместе все медиавыражения и размещает их в конце файла;
        .pipe(postcss([
            autoprefixer(), //добавляет вендорные префиксы CSS
            csso()
        ]))

        .pipe(gulp.dest('build/css', { sourcemaps: '.' }))  //сохраняет итоговый файл в папку /build/css/
        .pipe(browser.stream())
}

// jsMin

export function jsMinif() {
    return gulp.src('source/js/*.js')
        .pipe(terser())
        .pipe(rename({
            suffix: '-min'
        }))
        .pipe(gulp.dest('build/js'))
        .pipe(browser.stream())
}

export const minif = gulp.parallel(htmlMinif, cssMinif, jsMinif);


// =============== отпимизация изображений ============

// Images

// оптимизация jpg, png, svg

export function imgMin() {
    return gulp.src(['source/img/**/*.{png,jpg,svg}', '!source/img/favicons'])

        .pipe(cache(imagemin([
            mozjpeg({ //для jpg

                quality: 75, //Качество сжатия в диапазоне от 0 (наихудшее) до 100 (идеальное).
                progressive: true  //прогрессивность, false создает базовый файл JPEG
            }),

            optipng({
                optimizationLevel: 3   //уровень оптимизации от 0 до 7.
            }
            ),

            svgo({
                plugins: [{
                    name: 'cleanupIDs',
                    active: false
                }, {
                    name: 'preset-default', // предустановленные настройки по умолчанию
                    params: {
                        overrides: {
                            // настройка параметров:
                            convertPathData: {
                                floatPrecision: 2,
                                forceAbsolutePath: false,
                                utilizeAbsolute: false,
                            },
                            // отключить плагин
                            removeViewBox: false,
                        },
                    },
                }]
            })
        ])))

        .pipe(gulp.dest('source/img-tmp/'));
}

// ретинизация + webp +webp@2x

export function retinaWebp() {
    return gulp.src(['source/img-tmp/**/*.{png,jpg}', '!source/img-tmp/favicons'])

        .pipe(sharp({
            includeOriginalFile: true,
            formats: [{
                width: (metadata) => metadata.width * 2,
                rename: {
                    suffix: "-@2x"
                },
                jpegOptions: {
                    progressive: true
                },
            }, {
                width: (metadata) => metadata.width * 2,
                format: "webp",
                rename: {
                    suffix: "-@2x"
                }
            }, {
                format: "webp"
            },]
        }))
        .pipe(gulp.dest('source/img-tmp'))
    }

// export function imgCopySvg() {
//     return gulp.src(['source/img-opt/**/*.svg', '!source/img-opt/icons/*.svg'])
//         .pipe(gulp.dest('source/img-tmp/'))
// }

export function createStack() {
    return gulp.src('source/img-tmp/icons/*.svg')
        .pipe(stacksvg(''))
        .pipe(gulp.dest('build/img/'));
}

export const imgOpt = gulp.series(imgMin, retinaWebp);

// Линты

export function lintBem() {
    return gulp.src('source/**/*.html')
        .pipe(bemlinter());
}

// конечная сборка. BUILD

// Reload
export function reload(done) {
    browser.reload();
    done();
}

// Watcher
export function watcher() {
    gulp.watch('source/sass/**/*.scss', gulp.series(scssToCss, cssMinif));
    gulp.watch('source/*.html', gulp.series(htmlMinif, reload));
    gulp.watch('source/js/*.js', gulp.series(jsMinif));
    gulp.watch('source/icons/**/*.svg', gulp.series(createStack));
}

// del
export const clean = () => {
    return delet('build/');
};

// copy - копирую в BUILD всё, что не изменяетя (шрифты, фавиконки)
export function copy() {
    return gulp.src(['source/fonts/**/*.{woff2,woff}',
        'source/favicon.ico',
        'source/img/favicons/**',
        'source/manifest.webmanifest'
    ], {
        base: 'source'
    }
    )
        .pipe(gulp.dest('build'))
}

export function copyImg() {
    return gulp.src(['source/img-tmp/**', '!source/img-opt/icons/*.svg'])
        .pipe(gulp.dest('build/img/'))
}

// server
export function server(done) {
    browser.init({ //инициализируем веб-сервер;
        server: {
            baseDir: './build', // указываем рабочую папку;
            serveStaticOptions: { // упрощаем ввод в браузере адреса страницы — без расширения .html;
                extensions: ['html'],
            },
        },
        cors: true,
        notify: false,
        ui: false, //назначаем номер порта для пользовательского интерфейса веб-сервера;
        open: true, //открываем в браузере главную страницу сайта.
    });
    done();
}

export const build = gulp.series(
    clean,
    copy,
    scssToCss,
    gulp.parallel(
        minif, copyImg, createStack
    )
)

export default gulp.series(
    build,
    server,
    watcher)


