import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import CloseButton from 'react-bootstrap/CloseButton';

import "../styles/helpModal.css";

export function HelpModal (props) {
    const {showHelpModal, handleChangeShowModal} = props;

    return (
        <Modal
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            show={showHelpModal}
            onHide={() => handleChangeShowModal(false)}
            className="help-modal dark"
        >
            {/* <Modal.Header closeButton> */}
            <Modal.Header>
                <Modal.Title id="contained-modal-title-vcenter">
                Instructions
                </Modal.Title>
                <CloseButton variant="white" onClick={() => handleChangeShowModal(false)} className="pull-right"/> 
            </Modal.Header>
            <Modal.Body>
                <h4>Settings panel</h4>
                This panel is located on the left.<br/>
                To adjust the width of the panel, click on the bottom right of the panel and drag it left or right.<br/><br/>
                <h4>Obstacle</h4>
                When the obstacle is enabled, press <strong>left click</strong> on the obstacle and then use the displayed axes to change its position.<br/><br/>
                <h4>Camera</h4>
                Press <strong>ctrl + left click</strong> to move the camera.<br/>
                Press <strong>ctrl + right click</strong> to rotate the camera.<br/><br/>
                
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => handleChangeShowModal(false)}>Close</Button>
            </Modal.Footer>
        </Modal>
    )
}