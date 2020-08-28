import React, { useState } from 'react';
import { Jumbotron, Container, Row, Col, Tabs, Tab } from 'react-bootstrap';
import LoginForm from '../Login/LoginForm';
import RegisterForm from '../Login/RegisterForm';

import './HomePage.css';

enum HomeDetailsTabs {
    LOGIN = 'Login',
    REGISTER = 'Register',
}

interface HomePageProps {

}

export const HomePage: React.FC<HomePageProps> = () => {
    const [activeTab, setActiveTab] = useState<HomeDetailsTabs>(HomeDetailsTabs.LOGIN);

    return (
        <>
            <Jumbotron id="HomePageJumbo" fluid>
                <h1 id="JumboText">Rederly Coursework</h1>
            </Jumbotron>

            <Container>
                <Row>
                    <Col md={{ span: 4, offset: 4 }}>
                        <h3>Rederly Coursework</h3>
                        <Tabs
                            activeKey={activeTab}
                            defaultActiveKey={HomeDetailsTabs.LOGIN}
                            id="home-page-tabs"
                            onSelect={(activeTab: any) => {
                                setActiveTab(activeTab);
                            }}
                            style={{
                                marginTop: '20px'
                            }}
                        >
                            <Tab eventKey={HomeDetailsTabs.LOGIN} title={HomeDetailsTabs.LOGIN} style={{ marginBottom: '10px' }}>
                                <LoginForm />
                            </Tab>
                            <Tab eventKey={HomeDetailsTabs.REGISTER} title={HomeDetailsTabs.REGISTER} style={{ marginBottom: '10px' }}>
                                <RegisterForm />
                            </Tab>
                        </Tabs>
                        <Row>
                            <Col style={{ margin: '10px' }} className="text-center">
                                <a href="https://rederly.com/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default HomePage;