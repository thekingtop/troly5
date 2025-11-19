
// Declare global docx variable from CDN
declare var docx: any;

const getHeadingLevel = (tagName: string): any => {
    switch (tagName) {
        case 'H1': return docx.HeadingLevel.HEADING_1;
        case 'H2': return docx.HeadingLevel.HEADING_2;
        case 'H3': return docx.HeadingLevel.HEADING_3;
        case 'H4': return docx.HeadingLevel.HEADING_4;
        default: return undefined;
    }
};

// Recursive function to collect text runs from a node
const processInlineContent = (node: Node, textRuns: any[], style: { bold?: boolean, italic?: boolean, underline?: boolean } = {}) => {
    if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (text) {
            textRuns.push(new docx.TextRun({
                text: text,
                bold: style.bold,
                italics: style.italic,
                underline: style.underline ? { type: docx.UnderlineType.SINGLE } : undefined,
                font: "Times New Roman",
                size: 26, // 13pt
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
            processInlineContent(element.childNodes[i], textRuns, newStyle);
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

    // Recursively process block elements to generate paragraphs
    const processBlock = (node: Node): any[] => {
        const blockParagraphs: any[] = [];
        
        if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;

            // If it's a container for list items (UL/OL), process children
            if (element.tagName === 'UL' || element.tagName === 'OL') {
                for (let i = 0; i < element.childNodes.length; i++) {
                    blockParagraphs.push(...processBlock(element.childNodes[i]));
                }
                return blockParagraphs;
            }

            const textRuns: any[] = [];
            processInlineContent(node, textRuns);

            // If textRuns is empty and it's not a spacing element like BR, skip
            // (But keep headers even if empty? No, usually not needed)
            // Note: processInlineContent adds \n for BR.
            
            let alignment = docx.AlignmentType.JUSTIFIED;
            if (element.style.textAlign === 'center') alignment = docx.AlignmentType.CENTER;
            if (element.style.textAlign === 'right') alignment = docx.AlignmentType.RIGHT;
            
            // Headers are often centered in VN legal docs
            if (['H1', 'H2', 'H3'].includes(element.tagName)) {
                 alignment = docx.AlignmentType.CENTER;
            }
            
            // National Motto check
            const textContent = element.textContent || '';
            if (textContent.includes("CỘNG HÒA XÃ HỘI") || textContent.includes("Độc lập - Tự do")) {
                 alignment = docx.AlignmentType.CENTER;
            }

            const paragraphOptions: any = {
                children: textRuns,
                heading: getHeadingLevel(element.tagName),
                alignment: alignment,
                spacing: { line: 360, before: 120, after: 120 } // 1.5 line spacing
            };

            // Handle Bullet Points for List Items
            if (element.tagName === 'LI') {
                paragraphOptions.bullet = { level: 0 };
            }

            // Only add paragraph if it has content or is a specific block type
            if (textRuns.length > 0 || element.tagName === 'P' || element.tagName === 'LI' || ['H1','H2','H3','H4'].includes(element.tagName)) {
                blockParagraphs.push(new docx.Paragraph(paragraphOptions));
            }
        }
        return blockParagraphs;
    };

    for (let i = 0; i < bodyNodes.length; i++) {
        paragraphs.push(...processBlock(bodyNodes[i]));
    }

    const docxFile = new docx.Document({
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: 1440, // 1 inch
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
