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
import { RelativePath } from './Config';

export const UIProxy = ({redirect=false}) =>
{
  if (redirect)
    setTimeout(() => {
        window.location = `${RelativePath}/saml2/login`
    }, 10)

  return (
    <Container>
      <Row className="login-first-row">
        <Col sm={{size: 6, offset: 3}}>
          <Card body outline color="secondary">
            <CardBody>
              <div className="text-center pt-2 pb-2">
                <img src={CloudLogoBig} id="cloud logo" alt="VPS Cloud Logo"/>
              </div>
              <div className="text-center mt-5">
                <a href="https://www.srce.unizg.hr/cloud/vps">
                  <h2>
                    https://www.srce.unizg.hr/cloud/vps
                  </h2>
                </a>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default UIProxy;
