import React, { Component } from 'react'
import { Row, Col, Button } from 'react-bootstrap'
import TagsInput from 'react-tagsinput'
import 'react-tagsinput/react-tagsinput.css'
import styles from '../css/Buscador.module.css'
import tweelock from '../images/Tweelock.svg'

class Buscador extends Component {
    constructor(props) {
        super(props)

        this.state = {
            tags: [],
        }
    }

    handleChange = (tags) => {
        this.setState({tags})
      }

    buscarTweets = () => {
        const { tags } = this.state
        alert(JSON.stringify(tags))
    }

    render() {
        const { tags } = this.state
        return(
            <div className={styles.container}>
                <Row className={styles.header}> 
                    <Col className={styles.columnaLogo}>
                        <img src={tweelock} className={styles.imgLogo}/>
                    </Col>
                    <Col className={styles.columnaBuscador}>
                        <TagsInput value={tags} onChange={this.handleChange} maxTags={3} inputProps={{ className: 'react-tagsinput-input', placeholder: 'Busca Tweets' }}/>
                    </Col>
                    <Col className={styles.columnaBoton}>
                        <Button variant="dark" onClick={this.buscarTweets}>Buscar</Button>
                    </Col>
                </Row>
                <Row>
                    <p>Resultados</p>
                </Row>
            </div>
        )
    }
}

export default Buscador
