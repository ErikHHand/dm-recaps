import React, { Component } from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from "react-router-dom";

// Component that is rendered in case of 404 Not Found
class NotFound extends Component {
    render() {

        return  <Container className="text-white">
                    <p className="h1">
                        404.. This page is not found!
                    </p>
                    <p>
                        So sorry about that!
                    </p>
                    <Link to="/">
                        <Button>
                            Return to homepage
                        </Button>    
                    </Link>
                </Container>
                
    }
}

export default NotFound;