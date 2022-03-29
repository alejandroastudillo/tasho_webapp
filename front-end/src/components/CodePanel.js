import React from 'react';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark, vs, coldarkDark, twilight, vscDarkPlus  } from 'react-syntax-highlighter/dist/esm/styles/prism';
// import  SyntaxHighlighter from 'react-syntax-highlighter';
// import { anOldHope, arta, atelierDuneDark, atelierSeasideDark, dracula, github, gml, irBlack, qtcreatorDark, sunburst, xt256 } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import Card from 'react-bootstrap/Card';
import CloseButton from 'react-bootstrap/CloseButton';

import '../styles/codePanel.css';


export function CodePanel (props) {

    const { pythonCode, handleCloseCode } = props;

    return (
        <div className="code_container" >
            <Card className="code_card dark" > 
                <Card.Body>
                    <Card.Title style={{marginBottom: "1em"}}> 
                        <span className="code_card_title dark" style={{fontSize: "calc(0.6em + 0.75vmin)"}}>Python code</span> 
                        <CloseButton variant="white" onClick={handleCloseCode} className="pull-right"/> 
                    </Card.Title>

                    <SyntaxHighlighter 
                        language="python" 
                        style={materialDark}
                        // customStyle={{ fontSize: "0.9em", lineHeight: "1", height:"70vh", width: "20vw"}}
                        customStyle={{ fontSize: "0.9em", lineHeight: "1", height:"70vh", width: "100%"}}
                        // codeTagProps={{style: {height: "100px"}}}
                        // lineProps={{style: {whiteSpace: 'pre-wrap'}}}
                        // wrapLongLines={true}
                        // wrapLines={true}
                        // showLineNumbers={true}
                        // showInlineLineNumbers={true}

                        children={pythonCode}
                    />
                        {/* {pythonCode}
                    </SyntaxHighlighter> */}


                </Card.Body>
            </Card>
        </div>
    )

}