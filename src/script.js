pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.12.313/pdf.worker.min.js';

const pdfUrl = 'example.pdf';
const canvas = document.getElementById('pdfCanvas');
const context = canvas.getContext('2d');

let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;

pdfjsLib.getDocument(pdfUrl).promise.then(pdf => {
    pdfDoc = pdf;
    renderPage(pageNum);
});

function renderPage(num) {
    pageRendering = true;
    pdfDoc.getPage(num).then(page => {
        const viewport = page.getViewport({ scale: 1 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        page.render(renderContext).promise.then(() => {
            pageRendering = false;
            if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });

    drawAnnotations();
}

function drawAnnotations() {
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseup', stopDrawing);

    let isDrawing = false;

    function startDrawing(event) {
        isDrawing = true;
        context.beginPath();
        context.moveTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
        canvas.addEventListener('mousemove', draw);
    }

    function draw(event) {
        if (isDrawing) {
            context.lineTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
            context.stroke();
        }
    }

    function stopDrawing() {
        isDrawing = false;
        canvas.removeEventListener('mousemove', draw);
    }
}