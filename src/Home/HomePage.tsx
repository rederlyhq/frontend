import React from 'react';
import { Link } from 'react-router-dom';
import { Jumbotron, Button } from 'react-bootstrap';

import './HomePage.css';

interface HomePageProps {

}

export const HomePage: React.FC<HomePageProps> = () => {
    return (
        <>
            {/* <Carousel>
                <Carousel.Item>
                    <img className="d-block w-100"
                        src="roman-mager-5mZ_M06Fc9g-unsplash.jpg"
                        alt="Chalkboard with equations" />
                    <Carousel.Caption>
                        <h3>Rederly Coursework</h3>
                        <Button>Log In</Button>
                        <Button>Sign Up</Button>
                    </Carousel.Caption>
                </Carousel.Item>
            </Carousel> */}
            <Jumbotron id="HomePageJumbo" fluid>
                Rederly Coursework
                {/* <a style="background-color:black;color:white;text-decoration:none;padding:4px 6px;font-family:-apple-system, BlinkMacSystemFont, &quot;San Francisco&quot;, &quot;Helvetica Neue&quot;, Helvetica, Ubuntu, Roboto, Noto, &quot;Segoe UI&quot;, Arial, sans-serif;font-size:12px;font-weight:bold;line-height:1.2;display:inline-block;border-radius:3px" href="https://unsplash.com/@roman_lazygeek?utm_medium=referral&amp;utm_campaign=photographer-credit&amp;utm_content=creditBadge" target="_blank" rel="noopener noreferrer" title="Download free do whatever you want high-resolution photos from Roman Mager"><span style="display:inline-block;padding:2px 3px"><svg xmlns="http://www.w3.org/2000/svg" style="height:12px;width:auto;position:relative;vertical-align:middle;top:-2px;fill:white" viewBox="0 0 32 32"><title>unsplash-logo</title><path d="M10 9V0h12v9H10zm12 5h10v18H0V14h10v9h12v-9z"></path></svg></span><span style="display:inline-block;padding:2px 3px">Roman Mager</span></a> */}
            </Jumbotron>
            
            <h3>Rederly Coursework</h3>
            <Link to="/login">
                <Button>Log In</Button>
            </Link>
            <Link to="/register">
                <Button>Sign Up</Button>
            </Link>
        </>
    );
};

export default HomePage;