import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';

// import logo from '../../assets/images/full_white.png';
import MECO_logo from '../../assets/images/MECO_short_white.png';
import FM_at_KUL_logo from '../../assets/images/FM_at_KUL_large.png';

import '../../styles/header.css';

const Header = (props) => {

    return(

        <>
        {/* <Navbar bg="dark" variant="light"> */}
        <Navbar className="home_header" variant="dark" expand='sm' >
            <Navbar.Toggle aria-controls='responsive-navbar-nav'/>
            <Navbar.Collapse id='responsive-navbar-nav'>
              <Navbar.Brand href="https://github.com/meco-group/rockit_demo" className="ms-3">
                {/* <img alt="" src={FM_at_KUL_logo} width="176" height="30" className="d-inline-block align-top" /> */}
                {/* <img alt="" src={FM_at_KUL_logo} width="230" height="40" className="d-inline-block align-top" /> */}
                {/* <img alt="" src={FM_at_KUL_logo} width="205" height="35" className="d-inline-block align-top" /> */}
                <img alt="" src={FM_at_KUL_logo} className="brand-image d-inline-block align-top" />
                {/* <img alt="" src={MECO_logo} width="70" height="30" className="ml-3 d-inline-block align-top" /> */}
              </Navbar.Brand>
              <Navbar.Text className="ms-auto me-auto" style={{color:"#574d59", fontSize:"calc(0.75em + 1vmin)", fontWeight:'bold', userSelect: 'none'}}>
                <span className="title-large">Tasho: A model predictive control toolchain for constraint-based task specification of robot motions</span>
                <span className="title-small">Tasho</span>
              </Navbar.Text>

              <div className="ms-auto me-2">
                <Navbar.Text style={{color:"#574d59", fontSize:"calc(0.5em + 0.75vmin)", userSelect: 'none'}}>
                  Developed by:
                </Navbar.Text>
                <div>
                  <Navbar.Text style={{fontSize:"calc(0.5em + 0.75vmin)", fontWeight:'bold'}}>
                    <a style={{color:"#343434"}} href="https://www.mech.kuleuven.be/en/pma/research/meco/people/00124760">Alejandro Astudillo,</a>{' '}
                    <a style={{color:"#343434"}} href="https://www.mech.kuleuven.be/en/pma/research/meco/people/00110259">Ajay Sathya,</a>{' '}  
                    <a style={{color:"#343434"}} href="https://www.mech.kuleuven.be/en/pma/research/meco/people/00110021">Dries Dirckx</a>
                  </Navbar.Text>
                </div>
              </div>
            </Navbar.Collapse>
        </Navbar>
        </>

    );
}

export default Header;
