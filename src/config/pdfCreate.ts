import PDFDocument from 'pdfkit'
import fs from 'fs'
import type { PageInfo } from '../typings';
const pdfCreate = new PDFDocument({
    bufferPages:true,
});




export default pdfCreate;