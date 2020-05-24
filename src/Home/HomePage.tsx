import React from 'react';
import { Jumbotron, Container, Row, Col } from 'react-bootstrap';
import LoginForm from '../Login/LoginForm';
import RegisterForm from '../Login/RegisterForm';
import ButtonAndModal from '../Components/ButtonAndModal';

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
                            <ButtonAndModal header="Log In" buttonText="Log In">
                                <LoginForm/>
                            </ButtonAndModal>
                            <ButtonAndModal header="Register" buttonText="Register">
                                <RegisterForm/>
                            </ButtonAndModal>
                        </Row>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default HomePage;