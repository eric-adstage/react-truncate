import React, { Component } from 'react';

export default class Truncate extends Component {
    static propTypes = {
        children: React.PropTypes.node,
        ellipsis: React.PropTypes.node,
        lines: React.PropTypes.number
    };

    static defaultProps = {
        children: '',
        ellipsis: '…'
        lines: 1
    };

    componentDidMount() {
        let canvas = document.createElement('canvas');
        this.canvas = canvas.getContext('2d');

        window.addEventListener('resize', this.onResize);

        this.onResize();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onResize);
    }

    onResize = () => {
        this.refs.target.style.display = 'inline-block';
        this.refs.target.style.width = '100%';

        let style = window.getComputedStyle(this.refs.target);
        let targetWidth = this.refs.target.clientWidth;

        this.refs.target.style.display = null;
        this.refs.target.style.width = null;

        let font = [
            style['font-weight'],
            style['font-style'],
            style['font-size'],
            style['font-family']
        ].join(' ');

        this.canvas.font = font;

        this.setState({
            targetWidth
        });
    };

    measureWidth = text => {
        return this.canvas.measureText(text).width;
    };

    getLines() {
        let {
            refs: {
                text: {
                    textContent: text
                },
                ellipsis: {
                    textContent: ellipsisText
                }
            },
            props: {
                lines: numLines,
                ellipsis
            },
            state: {
                targetWidth
            },
            measureWidth
        } = this;

        let lines = [];
        let textWords = text.split(' ');

        for (let line = 1; line <= numLines; line++) {
            let resultLine = textWords.join(' ');

            if (measureWidth(resultLine) < targetWidth) {
                // Line is end of text and fits without truncating //
                lines.push(resultLine);
                break;
            }

            if (line === numLines) {
                // Binary search determining the longest possible line inluding truncate string //
                let textRest = textWords.join(' ');

                let lower = 0;
                let upper = textRest.length - 1;

                let testLine;

                while (lower <= upper) {
                    let middle = Math.floor((lower + upper) / 2);

                    testLine = textRest.slice(0, middle);

                    if (measureWidth(testLine + ellipsisText) <= targetWidth) {
                        resultLine = <span>{testLine}{ellipsis}</span>;

                        lower = middle + 1;
                    } else {
                        upper = middle - 1;
                    }
                }
            } else {
                // Binary search determining when the line breaks //
                let lower = 0;
                let upper = textWords.length - 1;

                let testLine;
                let resultMiddle;

                while (lower <= upper) {
                    let middle = Math.floor((lower + upper) / 2);

                    testLine = textWords.slice(0, middle).join(' ');

                    if (measureWidth(testLine) <= targetWidth) {
                        resultLine = testLine;
                        resultMiddle = middle;

                        lower = middle + 1;
                    } else {
                        upper = middle - 1;
                    }
                }

                textWords = textWords.slice(resultMiddle, textWords.length);
            }

            lines.push(resultLine);
        }

        return lines;
    }

    renderLine = (line, i, arr) => {
        if (i === arr.length - 1) {
            return <span key={i} style={this.styles.line}>{line}</span>;
        } else {
            return [
                <span key={i} style={this.styles.line}>{line}</span>,
                <br key={i + 'br'} />
            ];
        }
    };

    render() {
        let {
            refs: {
                target
            },
            props,
            props: {
                children,
                ellipsis,
                lines
            }
        } = this;

        let text = children;

        if (target && lines > 0) {
            text = this.getLines().map(this.renderLine);
        }

        return (
            <span {...props} ref='target'>
                {text}
                <span style={this.styles.raw}>
                    <span ref='text'>{children}</span>
                    <span ref='ellipsis'>{ellipsis}</span>
                </span>
            </span>
        );
    }

    styles = {
        raw: {
            position: 'absolute',
            visibility: 'hidden',
            pointerEvents: 'none',
            width: 0,
            height: 0,
            overflow: 'hidden'
        },
        line: {
            whiteSpace: 'nowrap'
        }
    };
};
