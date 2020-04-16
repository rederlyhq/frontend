import React, { useState } from 'react';
import LoginForm from './loginForm';
import { Modal, Button } from 'react-bootstrap';

interface loginProps {
}

/**
 * This component renders a Login button, and displays a Modal to log in with it.
 * 
 * Note: React-Bootstrap 1.0.0 throws a warning for deprecated usage of findDOMNode.
 *       This issue is being tracked here: https://github.com/react-bootstrap/react-bootstrap/issues/5075
 */
export const LoginButtonAndModal: React.FC<loginProps> = () => {
    const [showLogin, setShowLogin] = useState(false);

    return (
        <>
            <Button className="button-margin" onClick={()=>setShowLogin(true)}>Log In</Button>
            <Modal show={showLogin} onHide={()=>setShowLogin(false)}>
                <Modal.Header closeButton>
                        Log In
                </Modal.Header>
                <Modal.Body>
                    {/* Currently, the intention is that LoginForm will route us away if login succeeds. */}
                    <LoginForm />
                </Modal.Body>
            </Modal>
        </>
    );
};

export default LoginButtonAndModal;