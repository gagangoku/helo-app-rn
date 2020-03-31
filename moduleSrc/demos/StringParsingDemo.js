import React from 'react';
import {Pre, renderHtmlText, Text, TextareaElem, View} from "../platform/Util";
import {findPhonesAndLinksInText, formatPhonesAndLinksForDisplayHtml} from "../util/Util";


export default class StringParsingDemo extends React.Component {
    static URL = '/demos/parse';
    constructor(props) {
        super(props);
        this.state = {
            text: 'Call me at 9008781096 or +91-888-406-3910. Or email me at gagan.goku@gmail.com / www.example.com. http://9008781097.example.com ',
        };
    }

    onChange = (text) => {
        this.setState({ text });
    };

    render() {
        const { text } = this.state;

        const { phones, parsedLinks, links, allLinks } = findPhonesAndLinksInText(text);
        const tt = formatPhonesAndLinksForDisplayHtml({ text, allLinks, me: 'me', messageSender: 'other' });
        const html = renderHtmlText(tt, { whiteSpace: 'pre-wrap' });
        console.log('html: ', html);

        return (
            <View style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
                <TextareaElem type="text" value={text} onChangeText={this.onChange} style={custom.textInput} />
                <View style={{ display: 'flex', flexDirection: 'row' }}>
                    {html}
                </View>

                <Text style={{}}>Phones</Text>
                <Pre style={custom.parsed}>{JSON.stringify(phones, null, 2)}</Pre>

                <Text style={{}}>Links</Text>
                <Pre style={custom.parsed}>{JSON.stringify(parsedLinks, null, 2)}</Pre>
                <Pre style={custom.parsed}>{JSON.stringify(links, null, 2)}</Pre>

                <Text style={{}}>ALL</Text>
                <Pre style={custom.parsed}>{JSON.stringify(allLinks, null, 2)}</Pre>
            </View>
        );
    }
}

const MAX_WIDTH = 300;
const custom = {
    textInput: {
        marginTop: 20,
        width: '80%', maxWidth: MAX_WIDTH, height: 60, fontSize: 14,
    },
    parsed: {
        width: '80%', marginTop: 20,
        fontSize: 12
    },
};
