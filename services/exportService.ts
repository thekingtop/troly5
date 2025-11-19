
// Declare global docx variable from CDN
declare var docx: any;

const pxToPt = (px: number) => px * 0.75;

// Helper to convert HTML heading tags to docx heading levels
const getHeadingLevel = (tagName: string): any => {
    switch (tagName) {
        case 'H1': return docx.HeadingLevel.HEADING_1;
        case 'H2': return docx.HeadingLevel.HEADING_2;
        case 'H3': return docx.HeadingLevel.HEADING_3;
        case 'H4': return docx.HeadingLevel.HEADING_4;
        default: return undefined;
    }
};

// Recursive function to process HTML nodes and create docx TextRuns
const processNode = (node: Node, textRuns: any[], style: { bold?: boolean, italic?: boolean, underline?: boolean } = {}) => {
    if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (text) {
            textRuns.push(new docx.TextRun({
                text: text,
                bold: style.bold,
                italics: style.italic,
                underline: style.underline ? { type: docx.UnderlineType.SINGLE } : undefined,
                font: "Times New Roman",
                size: 26, // 13pt = 26 half-points
            }));
        }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const newStyle = { ...style };
        
        if (element.tagName === 'B' || element.tagName === 'STRONG') newStyle.bold = true;
        if (element.tagName === 'I' || element.tagName === 'EM') newStyle.italic = true;
        if (element.tagName === 'U') newStyle.underline = true;
        if (element.tagName === 'BR') {
             textRuns.push(new docx.TextRun({ text: "\n", font: "Times New Roman", size: 26 }));
        }

        for (let i = 0; i < element.childNodes.length; i++) {
            processNode(element.childNodes[i], textRuns, newStyle);
        }
    }
};

export const generateDocxFromHtml = async (htmlContent: string, filename: string = 'Van_ban_phap_ly.docx') => {
    if (typeof docx === 'undefined') {
        console.error("DOCX library not loaded");
        return;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const bodyNodes = doc.body.childNodes;
    const paragraphs: any[] = [];

    for (let i = 0; i < bodyNodes.length; i++) {
        const node = bodyNodes[i];
        
        if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            const textRuns: any[] = [];
            
            // Process content of the block element
            processNode(node, textRuns);

            // Determine alignment
            let alignment = docx.AlignmentType.JUSTIFIED; // Default for legal docs
            if (element.style.textAlign === 'center') alignment = docx.AlignmentType.CENTER;
            if (element.style.textAlign === 'right') alignment = docx.AlignmentType.RIGHT;
            
            // Special handling for Headers (often Center aligned in Vietnam)
            if (['H1', 'H2', 'H3'].includes(element.tagName)) {
                 alignment = docx.AlignmentType.CENTER;
            }

            // Special Check: National Motto should always be centered
            const textContent = element.textContent || '';
            if (textContent.includes("CỘNG HÒA XÃ HỘI") || textContent.includes("Độc lập - Tự do")) {
                 alignment = docx.AlignmentType.CENTER;
            }

            paragraphs.push(new docx.Paragraph({
                children: textRuns,
                heading: getHeadingLevel(element.tagName),
                alignment: alignment,
                spacing: {
                    line: 360, // 1.5 line spacing
                    before: 120, // Spacing before paragraph
                    after: 120,  // Spacing after paragraph
                },
            }));
        }
    }

    const docxFile = new docx.Document({
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: 1440, // 1 inch = 1440 twips (approx 2.54 cm)
                        right: 1134, // approx 2cm
                        bottom: 1134,
                        left: 1701, // approx 3cm
                    },
                },
            },
            children: paragraphs,
        }],
    });

    const blob = await docx.Packer.toBlob(docxFile);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
};
