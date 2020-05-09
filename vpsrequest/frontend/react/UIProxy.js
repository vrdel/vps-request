import React from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
} from 'reactstrap';
import './Login.css';
import CloudLogoBig from './logos/logo_cloud-big.png';
import SrceLogoBig from './logos/logo_srce-big.png';


export const UIProxy = () =>
(
  <Container>
    <Row className="login-first-row">
      <Col sm={{size: 8, offset: 2}}>
        <Card>
          <CardBody>
            <div className="text-center pt-2 pb-2">
              <img src={CloudLogoBig} id="cloud logo" alt="VPS Cloud Logo"/>
            </div>
            <div className="text-center mt-5 mb-5">
              <a href="https://www.srce.unizg.hr/cloud/vps">
                <h1>
                  https://www.srce.unizg.hr/cloud/vps
                </h1>
              </a>
            </div>
            <div className="text-center pt-2 pb-2">
              <a href="https://www.srce.unizg.hr/" target="_blank" rel="noopener noreferrer">
                <img src={SrceLogoBig} id="srcelogo" alt="SRCE Logo"/>
              </a>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  </Container>
)

export default UIProxy;
