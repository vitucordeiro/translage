import pdfExtract from '../config/pdfExtract';
import pdfCreate from '../config/pdfCreate';
import { response, type Response } from 'express';
import type { PDFInfo, PageInfo } from '../typings';
import translate from '../config/translate';
import fs from 'fs'

/**  */
class Services {
    
    async extractData(path, options?) {
        return new Promise<PDFInfo>((resolve, reject) => {
            pdfExtract.extract(path, options, async (err, data) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(data)
                }
            });
        });
    }
    
    async mappingContentPDF(data, to) {
        return new Promise<PageInfo>((resolve, reject) => {
            const pagesLength = data.pages.length;
            const pageInfo: PageInfo = {
                pages: []
            };
    
            for (let i = 0; i < pagesLength; i++) {
                const pageData = data.pages[i];
                const contentAndCoordinates = pageData.content.map(data => {
                    let content = data["str"].trim();
                    if(content != ''){
                        return {
                            content: data["str"],
                            coordinates: {
                                x: Math.round(data["x"]),
                                y: Math.round(data["y"])
                            }
                        };
                    }
                    return null
                });
                // if remove the filter, remove the null values that return from content.map
                const filteredContentAndCoordinates = contentAndCoordinates.filter(item => item !== null);

               
                pageInfo.pages.push({
                    to: to,
                    pageNumber: i + 1,
                    data: filteredContentAndCoordinates
                });
            }
            
            resolve(pageInfo);
        });
    }

    async translate(pageInfo: PageInfo) {
        const pagesLength = pageInfo.pages.length;
        for (let i = 0; i < pagesLength; i++) {
          const translatedContents = await Promise.all(
            pageInfo.pages[i].data.map(async (data) => {
              const [translation] = await translate.translate(data.content, pageInfo.pages[i].to);
              return { ...data, content: translation };
            })
          );
          pageInfo.pages[i] = { ...pageInfo.pages[i], data: translatedContents };
        }
        return pageInfo;
      }

      async createPDF(pageInfo) {
        return new Promise<Buffer>((resolve, reject) => {
          // Configuração do Pdfkit
          const pdfDoc = pdfCreate;
          const buffers = [];
          let range = pdfDoc.bufferedPageRange()
          pdfDoc.on('data', buffers.push.bind(buffers));
          pdfDoc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
          });
      
          // Lógica para criar página e adicionar conteúdo
          for (let j = 0; j < pageInfo.pages.length; j++) {
            pdfDoc.addPage();
            for (let i = 0; i < range.count; i++) {
              pdfDoc.switchToPage(i);
              pageInfo.pages[j].data.forEach((data) => {
                const content = data.content.toString();
                pdfDoc.text(content, data.coordinates.x, data.coordinates.y);
              });
              pdfDoc.save();
            }
          }
      
          pdfDoc.end();
        });
      }
      async createAndSavePDF(pageInfo, Response) {
        try {
          const pdfData = await this.createPDF(pageInfo);
      
          Response.setHeader('Content-Length', pdfData.length);
          Response.setHeader('Content-Type', 'application/pdf');
          Response.setHeader('Content-Disposition', 'attachment;filename=out.pdf');
      
          Response.end(pdfData);
        } catch (error) {
          Response.status(500).json({ error: error.message });
        }
      }
      
}

export default new Services();
