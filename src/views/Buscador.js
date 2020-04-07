import React, { Component } from 'react'
import { Row, Col, Button, Modal, Form, Table, Spinner } from 'react-bootstrap'
import axios from 'axios'
import TagsInput from 'react-tagsinput'

import 'react-tagsinput/react-tagsinput.css'
import styles from '../css/Buscador.module.css'


import tweelock from '../images/Tweelock.svg'
import analisis from '../images/Analisis.svg'
const TITULO_MODAL = 'BUSCADOR TWEELOCK'
const CUERPO_MODAL = 'Necesitas introducir el nombre de un usuario que quieras buscar.'

const TITULO_ERROR_MODAL = 'ERROR TWEELOCK'

const filtroLocation = [
    'México',
    'Mexico',
    'méxico',
    'mexico',
    'D.F.',
    'd.f.',
    'D.f.',
    'DF',
    'Df',
    'df',
    'CDMX',
    'cdmx',
    'Ciudad de México',
    'Ciudad de méxico',
    'Ciudad de Mexico',
    'Ciudad de mexico',
    'ciudad de mèxico',
    'Distrito Federal',
    'distrito federal',
    'Distrito federal',
    'Coacalco',
    'coacalco',
    'Ecatepec',
    'ecatepec',
]

class Buscador extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
            usuario: '',
            modalAviso: false,
            modalError: false,
            mensajeError: '',
            twitterUsers: [],
            tweets: [],
            vistaAnalisis: false,
            nombreUsuario: '',
            loading: false,

        }
    }

    handleChange = (event) => {
        this.setState({ usuario: event.target.value})
    }

    handleClose = () => {
        this.setState({ modalAviso: false, modalError: false, mensajeError: '' })
    }

    handleAnalisis = (name, screen_name, count) => {
        this.setState({ vistaAnalisis: !this.state.vistaAnalisis })
        if (!this.state.vistaAnalisis) { // esta en la vista de analisis
            this.setState({ nombreUsuario: name })
            const objetoUsuario = {
                screenname: screen_name,
                count: count,
            }

            axios.post('http://localhost:8000/buscarTweets', objetoUsuario)
                .then((res) => {
                    console.log(res.data)
                    this.setState({ tweets: res.data })
                }).catch((error) => {
                this.setState({ modalError: true, mensajeError: error })
                console.log(error)
            })
        } else {
            this.setState({ tweets: [] })
        }
    }

    /* buscarTweets = () => {
        const { tags } = this.state
        let hashtaguno = tags[0]
        let hashtagdos = tags[1]
        /* Reemplazar simbolo # por el codigo correcto para la url %23 
        if (hashtaguno !== undefined && hashtaguno.includes('#')) {
            hashtaguno = tags[0].replace('#', '%23')
        }

        if (hashtagdos !== undefined && hashtagdos.includes('#')) {
            hashtagdos = tags[1].replace('#', '%23')
        }

        if (tags.length === 0) {
            this.setState({ modalAviso: true })
        } else if (tags.length === 1) { // El usuario escribe una palabra
            axios.get(`http://localhost:8000/oneTweet/${hashtaguno}`)
                .then((response) => {
                    console.log(response.data.statuses)
                    this.setState({ tweets: response.data.statuses })
                }).catch((error) => {
                    // this.setState({ modalError: true, mensajeError: error })
                    console.log(error)
                })
        } else { // El usuario escribe dos palabras
            axios.get(`http://localhost:8000/twoTweets/${hashtaguno}&${hashtagdos}`)
                .then((response) => {
                    console.log(response.data.statuses)
                }).catch((error) => {
                    // this.setState({ modalError: true, mensajeError: error })
                    console.log(error)
                })
        }
    } */

    buscarUsuarios = () => {
        const { usuario } = this.state
        const parametrosJSON = {
            username: usuario,
            count: 30,
        }
        console.log(parametrosJSON)

        if (usuario === '') {
            this.setState({ modalAviso: true })
        } else {
            this.setState({ loading: true })
            axios.post('http://localhost:8000/buscarUsuarios', parametrosJSON)
            .then((res) => {
                // this.setState({ twitterUsers: res.data })
                const usuarios = res.data
                const arregloTemporal = []

                usuarios.forEach((usuario) => {
                    for (let i = 0; i < filtroLocation.length; i++) {
                        if ((usuario.location).includes(filtroLocation[i])) {
                            arregloTemporal.push(usuario)
                        }
                    }
                })
                /* Quitamos valores duplicados en el arreglo */
                let set = new Set(arregloTemporal.map(JSON.stringify))
                const arregloSinDuplicaciones = Array.from(set).map(JSON.parse)

                this.setState({ twitterUsers: arregloSinDuplicaciones, loading: false })

            }).catch((error) => {
                // this.setState({ modalError: true, mensajeError: error })
                console.log(error)
            })
        }
    }

    analyticsView = () => {
        const { tweets, nombreUsuario } = this.state
        return (
            <div className={styles.contenedorAnalisis}>
                <Row className={styles.buttonRegresar}>
                    <Col sm={1} className={styles.columnaBotonRegresar}>
                     <Button variant="primary" onClick={this.handleAnalisis}>Regresar</Button>
                    </Col>
                    <Col sm={9} className={styles.columnaTitulo}>
                      <p className={styles.tituloAnalisis}>Análisis del usuario {nombreUsuario}</p>
                    </Col>
                    <Col sm={2} className={styles.columnaBotonRegresar}>
                     <Button variant="danger">Guardar en PDF</Button>
                    </Col>
                </Row>
                <Row className={styles.columnaAnalisis}>
                    <img src={analisis} className={styles.imagenAnalisis} alt="prototipo de analisis"/>
                </Row>
                <Row className={styles.tablaAnalisis}>
                    <Table striped bordered hover variant="dark">
                        <thead>
                            <tr>
                                <td>Tweet id</td>
                                <td>Texto</td>
                                <td>Usuario id</td>
                                <td>Fecha de creacion</td>
                                <td># reetwets</td>
                                <td># me gusta</td>
                            </tr>
                        </thead>
                        <tbody>
                        {(tweets.length === 0) ? null :
                            tweets.map((tweet) => {
                                return(
                                    <tr>
                                        <td>{tweet.id_str}</td>
                                        <td>{tweet.text}</td>
                                        <td>{tweet.user.id_str}</td>
                                        <td>{tweet.created_at}</td>
                                        <td>{tweet.retweet_count}</td>
                                        <td>{tweet.favorite_count}</td>
                                    </tr>
                                )
                            })
                        }
                        </tbody>
                    </Table>
                </Row>
            </div>
        )
    }

    usersTable = () => {
        const { twitterUsers } = this.state
        return(
            <Table striped bordered hover variant="dark">
                    <thead>
                        <tr>
                            <td>Usuario id</td>
                            <td>Nombre</td>
                            <td>Screen Name</td>
                            <td>Localización del usuario</td>
                            <td>Análisis</td>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            (twitterUsers.length === 0) ? null :
                                twitterUsers.map((user) => {
                                    return (
                                        <tr>
                                            <td>{user.id_str}</td>
                                            <td>{user.name}</td>
                                            <td>{user.screen_name}</td>
                                            <td>{user.location}</td>
                                            <td><Button variant="primary" onClick={() => this.handleAnalisis(user.name, user.screen_name, 100)}>Ver análisis</Button></td>
                                        </tr>
                                    )
                                })
                        }
                    </tbody>
                </Table>
        )
    }

    render() {
        const { usuario, modalAviso, modalError, mensajeError, vistaAnalisis, loading } = this.state
        return(
            <div className={styles.container}>
                <Row className={styles.header}> 
                    <Col className={styles.columnaLogo}>
                        <img src={tweelock} className={styles.imgLogo}/>
                    </Col>
                    <Col className={styles.columnaBuscador}>
                        {/* <TagsInput value={usuario} onChange={this.handleChange} maxTags={1} inputProps={{ className: 'react-tagsinput-input', placeholder: 'Buscar usuario' }}/> */}
                        <Form.Control type="text" placeholder="Buscar usuario" value={usuario} onChange={this.handleChange} />
                    </Col>
                    <Col className={styles.columnaBoton}>
                        {
                            loading ? <Spinner animation="grow" variant="light" /> : <Button variant="dark" onClick={this.buscarUsuarios}>Buscar</Button>
                        }
                    </Col>
                </Row>
                <Row className={styles.body}>
                    {
                        (vistaAnalisis) ? this.analyticsView() : this.usersTable()
                    }
                </Row>
                <Modal show={modalAviso} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                    <Modal.Title>{TITULO_MODAL}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {CUERPO_MODAL}
                    </Modal.Body>
                </Modal>
                <Modal show={modalError} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                    <Modal.Title>{TITULO_ERROR_MODAL}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {mensajeError}
                    </Modal.Body>
                </Modal>
            </div>
        )
    }
}

export default Buscador
