import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
// import notify from 'gulp-notify';
import browser from 'browser-sync';

import htmlmin from 'gulp-htmlmin';
import rename from 'gulp-rename';

import cache from 'gulp-cache';

import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import csso from 'postcss-csso';
import gcssmq from 'gulp-group-css-media-queries';

import terser from 'gulp-terser';
import concat from 'gulp-concat';

import sharp from 'gulp-sharp-responsive';

import { stacksvg } from 'gulp-stacksvg';

import size from 'gulp-size';

import delet from 'del';

import imagemin, {
    mozjpeg,
    optipng,
    svgo
} from 'gulp-imagemin';

// import never from 'gulp-newer';

import bemlinter from 'gulp-html-bemlinter';


// Sass to css

export function scssToCss() { //переводит синтаксис SASS в стандартный CSS;
    return gulp.src('source/sass/style.scss', { sourcemaps: true }) //обращается к исходному файлу style.scss;
        .pipe(plumber())
        .pipe(sass().on('error', sass.logError)) //показывает в терминале информацию о наличии ошибок в исходном файле;

        .pipe(gulp.dest('source/css', { sourcemaps: '.' }))
        .pipe(browser.stream())
    // .pipe(notify('scss ===> css'));
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
        // .pipe(notify('MinHtml'))

        .pipe(size(
            {
                uncompressed: true,
                showFiles: true,
                pretty: true
            }
        ))

        .pipe(gulp.dest('build'))
        .pipe(browser.stream());
}


// css-MIN

export function cssMinif() {
    return gulp.src('source/css/*.css', { sourcemaps: true })
        .pipe(plumber())  //Надо?
        .pipe(gcssmq()) // группирует вместе все медиавыражения и размещает их в конце файла;
        // важен порядок ! gcssmq до postcss
        .pipe(postcss([
            autoprefixer(), //добавляет вендорные префиксы CSS
            csso()
        ]))
        // .pipe(rename('style-min.css'))

        // .pipe(rename({
        //  basename: 'style',
        //  suffix: '-min'
        // }))

        // .pipe(notify('MinCss'))
        .pipe(size(
            {
                uncompressed: true,
                showFiles: true,
                pretty: true
            }
        ))

        .pipe(gulp.dest('build/css', { sourcemaps: '.' }))  //сохраняет итоговый файл в папку /build/css/
        .pipe(browser.stream())
}

// jsMin

export function jsMinif() {
    return gulp.src('source/js/*.js')
        .pipe(terser())
        // .pipe(concat('index.js')) // Конкатенируем в один файл

        .pipe(rename({
            suffix: '-min'
        }))

        // .pipe(notify('MinJs'))
        .pipe(size(
            {
                uncompressed: true,
                showFiles: true,
                pretty: true
            }
        ))

        .pipe(gulp.dest('build/js'))
        .pipe(browser.stream())

}

export const minif = gulp.parallel(htmlMinif, cssMinif, jsMinif);


// =============== отпимизация изображений ============

// Images

// оптимизация jpg, png, svg

export function imgMin() {
    return gulp.src(['source/img/**/*.{png,jpg,svg}', '!source/img/favicons'])

        // .pipe(never('TMP'))

        .pipe(cache(imagemin([
            mozjpeg({ //для jpg

                quality: 75, //Качество сжатия в диапазоне от 0 (наихудшее) до 100 (идеальное).
                progressive: true  //прогрессивность, false создает базовый файл JPEG
            }),

            optipng({
                optimizationLevel: 3//уровень оптимизации от 0 до 7.
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

        .pipe(size(
            {
                uncompressed: true,
                showFiles: true,
                pretty: true

            }
        ))

        // .pipe(notify('imgOpt'))
        .pipe(gulp.dest('source/img-opt/'));
}

// ретинизация + webp +webp@2x

export function retinaWebp() {
    return gulp.src('source/img-opt/**/*.{png,jpg}')

        // .pipe(never('build')) // ????????? почему не работает!

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

    // .pipe(notify('WEBP + -@2x'))
}

export function imgCopySvg() {
    return gulp.src(['source/img-opt/**/*.svg', 'source/img-opt/icons/*.svg'])
        // .pipe(never('build/img'))  // ????????? почему не работает!

        // .pipe(notify('копируем svg'))
        .pipe(gulp.dest('source/img-tmp/'))
}

export function createStack() {
    return gulp.src('source/img-opt/icons/*.svg')

        .pipe(stacksvg(''))

        // .pipe(notify('стек!'))

        .pipe(gulp.dest('build/img/'));
}

export const imgOpt = gulp.series(imgMin,
    gulp.parallel(imgCopySvg, retinaWebp));

// Линты
// Линты из требований Д19 и Д20 в package.json, проверка валидации там же
export function lintBem() {
    return gulp.src('source/**/*.html')
        .pipe(bemlinter());
}

// конечная сборка. BUILD

// Reload
export function reload(done) {
    // .pipe(notify('ПЕРЕЗАБГУЗКА БРАУЗЕРА'))
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
    // return delet(['build', '!build/img']);
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
        // .pipe(notify('копируем шрифты'))
        .pipe(gulp.dest('build'))
}

export function copyImg() {
    return gulp.src('source/img-tmp/**')
        // .pipe(notify('копируем img'))
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


export const go = gulp.series(
    server,
    watcher
)

export const product = gulp.series(
    imgOpt,
    build,
    server,
    watcher
)