import React from "react";
import cnsole from "loglevel";
import {differenceFn, sumFn} from "./Util";
import xrange from "xrange";
import lodash from "lodash";


export const OcrParser = ({ INVENTORY_ITEMS, QUANTITY_TITLES, WINDOW_INNER_HEIGHT, WINDOW_INNER_WIDTH }) => {
    const computeLines = (allTexts) => {
        const sorted = allTexts.slice().sort(rowSortFn);
        cnsole.info('sorted array: ', sorted);

        const lines = [[sorted[0]]];
        let top = sorted[0].top;
        let bottom = sorted[0].top + sorted[0].h;
        for (let i = 1; i < sorted.length; i++) {
            const curr = sorted[i];
            if (curr.top >= bottom) {
                // New line
                lines.push([curr]);
                top = curr.top;
                bottom = curr.top + curr.h;
                continue;
            }
            lines[lines.length - 1].push(curr);
        }
        lines.forEach(l => l.sort((a, b) => a.left - b.left));
        cnsole.info('lines: ', lines);

        const charWidths = sorted.filter(x => (x.description || '').length > 3).map(x => {
            const { description, w } = x;
            return w / description.length;
        }).sort(differenceFn);
        cnsole.info('charWidths: ', charWidths);
        const avgCharWidth = charWidths.reduce(sumFn, 0) / charWidths.length;
        const charScale = 1 / avgCharWidth;

        const textLinesFull = [];
        lines.forEach(line => {
            const textItems = [];
            let left = 0;
            line.forEach(elem => {
                const w = elem.left - left;
                const n = Math.floor(charScale * w);
                if (n > 0) {
                    const space = xrange(0, n).toArray().map(x => ' ').join('');
                    textItems.push({ type: 'space', description: space, left, top: elem.top, w, h: elem.h });
                }
                textItems.push(elem);
                left = elem.left + elem.w;
            });
            textLinesFull.push(textItems);
        });

        const textLines = textLinesFull.map(x => x.map(y => y.description));
        cnsole.info('textLines: ', textLines);
        cnsole.info('textLinesFull: ', textLinesFull.slice());

        textLinesFull.forEach(textLine => {
            for (let j = 0; j < textLine.length - 1; j++) {
                const t1 = textLine[j];
                const t2 = textLine[j + 1];

                const d1 = t1.description;
                const d2 = t2.description;
                const cond1 = (t1.type !== 'space' ) || d1 === ' ';
                const cond2 = (t2.type !== 'space' ) || d2 === ' ';
                // const cond1 = (t1.type !== 'space') && (t2.type !== 'space');
                // const cond2 = !d1.endsWith(' ') && !d2.startsWith(' ');
                if (cond1 && cond2) {
                    // Join them
                    textLine[j] = { description: d1 + d2, type: t1.type, left: t1.left, top: Math.min(t1.top, t2.top), h: Math.max(t1.h, t2.h), w: t2.left + t2.w - t1.left };
                    textLine.splice(j+1, 1);
                    j--;
                }
            }
        });
        cnsole.info('textLinesFull after merging adjacent: ', textLinesFull);

        const texts = [];
        textLines.forEach(line => {
            texts.push(line.join(''));
        });
        cnsole.info('texts: ', texts);

        return { lines, textLines, textLinesFull, texts };
    };

    const computeColumnsCoveringAllLines = (allTexts) => {
        const sorted = allTexts.filter(x => x.type === 'text').slice().sort(colSortFn);
        cnsole.info('sorted array: ', sorted);

        sorted.forEach(item => item.done = false);
        const cols = [];

        let numIter = 0;
        while (numIter < 100) {
            numIter++;
            const pending = sorted.filter(item => item.done === false);
            const firstPending = pending[0];
            cnsole.info('Iteration: ', numIter, { pending, firstPending });

            if (pending.length === 0) {
                break;
            }

            let left = firstPending.left;
            let right = firstPending.left + firstPending.w;
            let passItems = {'0': firstPending};
            let passUpdates = 1;
            while (passUpdates > 0) {
                passUpdates = 0;
                for (let i = 0; i < pending.length; i++) {
                    const curr = pending[i];
                    const a1 = left > curr.left && left < (curr.left + curr.w);
                    const a2 = right > curr.left && right < (curr.left + curr.w);
                    const a3 = left <= curr.left && (curr.left + curr.w) <= right;
                    if (a1 || a2) {
                        left = Math.min(left, curr.left);
                        right = Math.max(right, curr.left + curr.w);
                        passUpdates++;
                    }
                    if (a1 || a2 || a3) {
                        passItems[i + ''] = curr;
                    }
                    cnsole.log('line: --> ', { a1, a2, a3, left, right, curr });
                }
            }

            Object.values(passItems).forEach(item => item.done = true);
            const c = Object.values(passItems).sort(rowSortFn);
            cols.push(c);
        }

        cnsole.info('columns: ', cols);
        return cols;
    };

    const computeInventoryDetails = ({ textLinesFull, texts }) => {
        const rows = [];
        const quantityCols = [];
        textLinesFull.forEach((line, i) => {
            const t = texts[i].toLowerCase();
            const possible = INVENTORY_ITEMS.filter(x => t.includes(x.toLowerCase())).length > 0;
            if (possible) {
                rows.push(line);
            }

            line.forEach(item => {
                const isQuantityCol = QUANTITY_TITLES.filter(x => ((item.description || '').toLowerCase() === x.toLowerCase())).length > 0;
                if (isQuantityCol) {
                    quantityCols.push(item);
                }
            });
        });
        cnsole.info('quantityCols: ', quantityCols);
        const cols = computeColumnsCoveringAllLines(rows.flatMap(x => x));

        const invCols = [];
        cols.forEach(c => {
            const left = Math.min(...c.map(x => x.left));
            const top = Math.min(...c.map(x => x.top));
            const right = Math.max(...c.map(x => x.left + x.w));
            const bottom = Math.max(...c.map(x => x.top + x.h));
            c.push({ type: 'box', description: '', top, left, h: bottom - top, w: right - left });

            quantityCols.forEach(qCell => {
                if (qCell.top + qCell.h < top && overlap([qCell.left, qCell.left + qCell.w], [left, right])) {
                    invCols.push(c);
                }
            });
        });
        cnsole.info('cols: ', cols);
        cnsole.info('invCols: ', invCols);

        const uniqInvCols = lodash.uniq(invCols[0] || []);
        cnsole.info('uniqInvCols: ', uniqInvCols);
        const inventoryItems = [];
        rows.forEach(row => {
            const arr = row.map(cell => {
                const desc = (cell.description || '').toLowerCase();
                const arr = INVENTORY_ITEMS.filter(x => desc.includes(x.toLowerCase()));
                return arr.length > 0 ? { cell, item: arr[0] } : null;
            }).filter(x => x !== null);
            if (arr.length > 0) {
                const { cell, item } = arr[0];

                const arr2 = uniqInvCols.filter(x => row.includes(x));
                if (arr2.length > 0) {
                    const qty = parseInt(arr2[0].description || '-1');
                    inventoryItems.push({ cell, item, qty, qtyCell: arr2[0] });
                }
            }
        });

        cnsole.info('inventoryItems: ', inventoryItems);
        return { inventoryItems, invCols: uniqInvCols };
    };

    const parseOcr = (ocrJson, scaleWithHeightWidth) => {
        const { width, height, blocks } = ocrJson.responses[0].fullTextAnnotation.pages[0];
        const maxH = WINDOW_INNER_HEIGHT * 2;
        const maxW = WINDOW_INNER_WIDTH * 2;
        const scale = Math.min(maxH / height, maxW / width);
        cnsole.info('measurements: ', { height, width, maxH, maxW, scale, blocks });

        const MULT_X = scaleWithHeightWidth ? width : 1;
        const MULT_Y = scaleWithHeightWidth ? height : 1;
        const allTexts = [];

        // Texts
        blocks.forEach((item, i) => {
            item.paragraphs.forEach(p => {
                p.words.forEach(word => {
                    const { boundingBox, symbols } = word;
                    const description = symbols.map(x => x.text || '').join('');
                    const [a, b, c, d] = boundingBox.normalizedVertices || boundingBox.vertices;
                    const w = Math.abs(a.x - b.x);
                    const h = Math.abs(b.y - c.y);
                    allTexts.push({ type: 'text', description, top: a.y * MULT_Y, left: a.x * MULT_X, h: h * MULT_Y, w: w * MULT_X });
                });
            });
        });

        // Blocks
        blocks.forEach((item, i) => {
            const { boundingBox } = item;
            const [a, b, c, d] = boundingBox.normalizedVertices || boundingBox.vertices;
            const w = Math.abs(a.x - b.x);
            const h = Math.abs(b.y - c.y);
            allTexts.push({ type: 'box', description: '', top: a.y * MULT_Y, left: a.x * MULT_X, h: h * MULT_Y, w: w * MULT_X });
        });

        cnsole.info('allTexts: ', allTexts);
        const { lines, textLinesFull, texts } = computeLines(allTexts.filter(x => x.type === 'text'));

        const inventoryDetails = computeInventoryDetails({ lines, textLinesFull, texts });
        const completeText = texts.join('\n\n');

        return { allTexts: textLinesFull.flatMap(x => x), texts, completeText, scale, imgWidth: width, imgHeight: height, inventoryDetails };
    };

    return {
        parseOcr,
    }
};



const cmpFn = (x) => {
    if (Math.abs(x) <= 1) {
        return 0;
    }
    return x;
};
const colSortFn = (a, b) => {
    const c = cmpFn(a.left - b.left);
    return c !== 0 ? c : cmpFn(a.top - b.top);
};
const rowSortFn = (a, b) => {
    const c = cmpFn(a.top - b.top);
    return c !== 0 ? c : cmpFn(a.left - b.left);
};
const overlap = ([a, b], [c, d]) => {
    const x1 = Math.min(a, b);
    const x2 = Math.max(a, b);

    const x3 = Math.min(c, d);
    const x4 = Math.max(c, d);

    if (x2 < x3 || x4 < x1) {
        return false;
    }
    return true;
};
