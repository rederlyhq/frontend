import React from 'react';
import { Link } from 'react-router-dom';
import { Jumbotron, Button, Container, Row, Col } from 'react-bootstrap';
import LoginButtonAndModal from '../Login/LoginButtonAndModal';

import './HomePage.css';

interface HomePageProps {

}

export const HomePage: React.FC<HomePageProps> = () => {
    return (
        <>
            <Jumbotron id="HomePageJumbo" fluid>
                <h1 id="JumboText">Rederly Coursework</h1>
            </Jumbotron>
            
            <Container>
                <Row>
                    <Col md={{span: 4, offset: 4}} className="text-center">
                        <h3>Rederly Coursework</h3>
                        <Row className="justify-content-sm-center">
                            <LoginButtonAndModal />
                            <Link to="/register">
                                <Button className="button-margin">Sign Up</Button>
                            </Link>
                        </Row>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default HomePage;