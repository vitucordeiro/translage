import PDFDocument from 'pdfkit'


const pdfCreate = new PDFDocument({
    bufferPages:true,
});

export default pdfCreate;

