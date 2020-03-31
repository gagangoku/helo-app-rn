import React from 'react';
import {getOcrJson} from "../util/Api";
import cnsole from 'loglevel';
import window from 'global';
import {OcrParser} from "../util/OcrParser";


export class ParseImage extends React.Component {
    static URL = '/demos/parse-image';
    constructor(props) {
        super(props);
        this.state = {
            imgJson: null,
            pdfJson: null,
        };
    }

    async componentDidMount() {
        const imgJson = await getOcrJson('ocr.json');
        const pdfJson = await getOcrJson('file.json');
        cnsole.info('imgJson: ', imgJson);
        cnsole.info('pdfJson: ', pdfJson);
        window._imgJson = imgJson;
        window._pdfJson = pdfJson;

        this.setState({ imgJson, pdfJson });
    }

    render() {
        const { imgJson, pdfJson } = this.state;
        if (!imgJson || !pdfJson) {
            return <div />;
        }

        const ocrParser = OcrParser({ INVENTORY_ITEMS, QUANTITY_TITLES, WINDOW_INNER_HEIGHT, WINDOW_INNER_WIDTH });

        const { allTexts, completeText, scale, imgWidth, imgHeight, inventoryDetails } = ocrParser.parseOcr(imgJson, false);
        // const { allTexts, completeText, scale, imgWidth, imgHeight, inventoryDetails } = this.parsePdfOcr(pdfJson, true);
        const S = scale;

        cnsole.info('allTexts: ', allTexts);
        const inventoryBoxes = inventoryDetails.invCols.flatMap(x => x).filter(x => x.type === 'box');
        const onlyTexts = allTexts.filter(x => x.type === 'text');
        const onlyBoxes = allTexts.filter(x => x.type === 'box');
        const rects = [];
        onlyTexts.forEach((item, i) => {
            const { top, left, w, h } = item;
            rects.push(<div key={i + '-text'} style={{ ...custom.rect, height: h*S, width: w*S, top: top*S, left: left*S }} />);
        });
        onlyBoxes.forEach((item, i) => {
            const { top, left, w, h } = item;
            // rects.push(<div key={i + '-box'} style={{ ...custom.rect, borderColor: '#ff2fca', height: h*S, width: w*S, top: top*S, left: left*S }} />);
        });
        inventoryBoxes.forEach((item, i) => {
            const { top, left, w, h } = item;
            rects.push(<div key={i + '-box'} style={{ ...custom.rect, borderColor: '#ff2fca', height: h*S, width: w*S, top: top*S, left: left*S }} />);
        });

        return (
            <div style={{ width: '100%', height: '100%' }}>
                <div style={{ width: imgWidth*S, height: imgHeight*S, position: 'relative' }}>
                    <img src={IMG_URL} style={{ ...custom.img, width: imgWidth*S, height: imgHeight*S }} />
                    {rects}
                </div>

                <pre style={custom.pre}>
                    {completeText}
                </pre>

                <pre style={custom.pre}>
                    {JSON.stringify(inventoryDetails.inventoryItems, null, 2)}
                </pre>
            </div>
        );
    }
}

const INVENTORY_ITEMS = [
    'ENGINE Oil',
    'AIR FILTER',
    'OIL FILTER',
    'SCREEN WASH',
    'RUST BUST',

    'PAID SERVICE',
    'CALIPER GREASING',
];
const QUANTITY_TITLES = [
    'Quantity',
    'No.',
    'Qty',
];

const WINDOW_INNER_HEIGHT = window.innerHeight;
const WINDOW_INNER_WIDTH = window.innerWidth;
const IMG_URL = '/static/ocr/ocr.png';
const custom = {
    rect: {
        position: 'absolute',
        borderWidth: 0.5,
        borderStyle: 'solid',
        borderColor: '#ffaf44',
    },
    img: {
        position: 'absolute',
        top: 0, left: 0,
    },
    pre: {
        fontSize: 14,
        fontFamily: 'monospace',
    },
};
