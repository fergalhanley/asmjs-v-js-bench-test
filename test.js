// utils

var inBrowser = typeof window !== 'undefined';
var log = inBrowser && document.querySelector('#log');

var timer = function() {
    return inBrowser ? performance.now() : new Date().getTime();
}

function logger(msg){
    if(inBrowser) {
        log.value += msg + '\n';
    }
    else {
        console.log(msg);
    }
}
function clearLog(){
    log.value = '';
}
function rnd(val){
    // 4 decimal places of precision
    return Math.round(val * 10000) / 10000;
}

// number of elements to represent 16 million colors on a 4k resolution image
var TEST_IMAGE_WIDTH = 4096;
var TEST_IMAGE_HEIGHT = 2160;
var ELEMENTS_PER_PIXEL = 4;
var testData = new Uint8Array(TEST_IMAGE_WIDTH * TEST_IMAGE_HEIGHT * ELEMENTS_PER_PIXEL);

// prepare test data
for (var i = 0; i < testData.length; i++) {
    testData[i] = ~~(Math.random() * 256);
}

function runTest(){
    clearLog();
    logger('Starting test - times are in milliseconds');

    var asm1, asm2, js1, js2;

    setTimeout(function(){

        logger('Running asm.js-test-1');
        asm1 = asmjsTest();
        logger('asm.js-test-1 complete: ' + rnd(asm1));

        logger('Running js-test-1');
        js1 = jsTest();
        logger('js-test-1 complete: ' + rnd(js1));

        logger('Now running the same scenario backwards');
        setTimeout(function(){

            logger('Running js-test-2');
            js2 = jsTest();
            logger('js-test-2 complete: ' + rnd(js2));

            logger('Running asm.js-test-2');
            asm2 = asmjsTest();
            logger('asm.js-test-2 complete: ' + rnd(asm2));

            logger('Test complete');
            logger('asm.js average ' + rnd((asm1 + asm2) / 2));
            logger('js average ' + rnd((js1 + js2) / 2));
            logger('Performance ration js/asm.js = ' + rnd((js1 + js2)/(asm1 + asm2)));

        }, 1000);
    }, 1000);
}

function asmjsTest(){
    var testDataCopy = testData.slice();
    var startTime = timer();

    shiftFilterAsmJs({}, {
        r: -100, g: 100, b: 0, a: 3,
        w: TEST_IMAGE_WIDTH * 4 - 4,
        max: testDataCopy.length - (TEST_IMAGE_WIDTH * 4 * 24)
    }, testDataCopy);

    return timer() - startTime;
}

function jsTest(){
    var testDataCopy = testData.slice();
    var startTime = timer();

    shiftFilterJs({}, {
        r: -100, g: 100, b: 0, a: 3,
        w: TEST_IMAGE_WIDTH * 4 - 4,
        max: testDataCopy.length - (TEST_IMAGE_WIDTH * 4 * 24)
    }, testDataCopy);

    return timer() - startTime;
}

function shiftFilterAsmJs(stdlib, foreign, heap) {
    'use asm';
    var w = foreign.w | 0,
        max = foreign.max | 0,
        r = foreign.r | 0,
        g = foreign.g | 0,
        b = foreign.b | 0,
        a = foreign.a | 0,
        i = 0, f = 0;

    for (i = w | 0; (i | 0) < (max | 0); i = (i + 4) | 0) {
        f = (i + w) | 0;
        heap[i << 2 >> 2] = heap[(f + r) | 0 << 2 >> 2];
        heap[((i | 0) + 1) | 0 << 2 >> 2] = heap[(f + g) | 0 << 2 >> 2];
        heap[((i | 0) + 2) | 0 << 2 >> 2] = heap[(f + b) | 0 << 2 >> 2];
        heap[((i | 0) + 3) | 0 << 2 >> 2] = heap[(f + a) | 0 << 2 >> 2];
    }
}

function shiftFilterJs(stdlib, foreign, heap) {
    var w = 0,
        max = foreign.max,
        r = foreign.r,
        g = foreign.g,
        b = foreign.b,
        a = foreign.a,
        i = 0, f = 0;

    for (i = w; i < max; i = i + 4) {
        f = i + w;
        heap[i] = heap[f + r];
        heap[i + 1] = heap[f + g];
        heap[i + 2] = heap[f + b];
        heap[i + 3] = heap[f + a];
    }
}

if(!inBrowser) {
    runTest();
}