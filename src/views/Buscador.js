import React, { Component } from 'react';
import { Row, Col, Button, Modal, Form, Table, Spinner } from 'react-bootstrap';
import axios from 'axios';
import UserCard from '../views/components/UserCard';
import BarChart from './components/BarChart';
import ColumnChart from './components/ColumnChart';
import RadialChart from './components/RadialChart';

import 'react-tagsinput/react-tagsinput.css';
import styles from '../css/Buscador.module.css';


import tweelock from '../images/Tweelock.svg';
import analisis from '../images/Analisis.svg';
import botonLogo from '../images/LogoBotonDesplegado.svg';

const TITULO_MODAL = 'BUSCADOR TWEELOCK';
const CUERPO_MODAL = 'Necesitas introducir el nombre de un usuario que quieras buscar.';
const TITULO_ERROR_MODAL = 'ERROR TWEELOCK';
const TITULO_BUSQUEDA_PREVIA = 'Búsquedas previas';

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
];

const palabrasViolentas = [
    'chinga tu madre',
    'chinguen a su madre',
    'chingue a su madre',
    'hasta la madre',
    'emputado',
    'emputada',
    'encabronado',
    'encabronada',
    'pito',
    'jodido',
    'jodida',
    'partir la madre',
    'partir tu madre',
    'putiza',
    'puta',
    'pendejo',
    'pendeja',
    'pinche',
    'mierda',
    'verga',
    'ramera',
    'cabron',
    'culero',
    'culera',
    'maricon',
    'alv',
    'estupida',
    'puto',
    'culo',
    'bastardo',
    'hija de puta',
    'hijo de puta',
];

class Buscador extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
            usuario: '',
            modalAviso: false,
            modalError: false,
            modalBusquedaPrevia: false,
            mensajeError: '',
            twitterUsers: [],
            twitterUser: {},
            tweets: [],
            vistaAnalisis: false,
            nombreUsuario: '',
            loading: false,
            vistaBusquedaPrevia: true,
            busquedasPrevias: [],
            ocultarFooter: false,
            numPalabras: 0,
            tweetsNegativos: 0,
            tweetsPositivos: 0,
            datosPalabras: [],
            categoriasPalabras: [],
            contadorRetweets: 0,
            contadorFavorites: 0,
        }
    }

    handleChange = (event) => {
        this.setState({ usuario: event.target.value})
    }

    handleClose = () => {
        this.setState({ modalAviso: false, modalError: false, mensajeError: '' })
    }

    handleRegresar = () => {
        this.setState({ vistaAnalisis: false, vistaBusquedaPrevia: true, usuario: '', ocultarFooter: false });
    }

    handleModalBusquedasPrevias = () => {
        const { modalBusquedaPrevia } = this.state;
        // const url = 'http://localhost:8080/busquedasPrevias';
        const url = 'https://tweelock-api.azurewebsites.net/busquedasPrevias';

        axios.get(url).then((res) => {
            console.log(JSON.stringify(res.data));
            this.setState({ busquedasPrevias: res.data });
        }).catch((error) => {
            this.setState({ modalError: true, mensajeError: error });
            console.log(error);
        });

        this.setState({ modalBusquedaPrevia: !modalBusquedaPrevia });
    }

    handleAnalisis = (name, screen_name, count) => {
        const { twitterUsers } = this.state;
        this.setState({ vistaAnalisis: true, ocultarFooter: true });
        
        twitterUsers.forEach((user) => {
            if (screen_name === user.screen_name) {
                this.setState({ twitterUser: user });
            }
        });

        if (!this.state.vistaAnalisis) { // esta en la vista de analisis
            this.setState({ nombreUsuario: name })
            const objetoUsuario = {
                screenname: screen_name,
                count: count,
            }

            axios.post('https://tweelock-api.azurewebsites.net/buscarTweets', objetoUsuario)
            //axios.post('http://localhost:8080/buscarTweets', objetoUsuario)
                .then((res) => {
                    this.contadorPalabrasViolentas(res.data);
                    this.contadorTweetsNegativos(res.data);
                    this.setState({ tweets: res.data });
                }).catch((error) => {
                this.setState({ modalError: true, mensajeError: error })
                console.log(error)
            })
        } else {
            this.setState({ tweets: [] })
        }
    }

    contadorPalabrasViolentas = (tweets) => {
        let countBadWords = 0;
        let countUndefined = 0;
        let palabrasUsadas = [];
        let cantidadPorPalabra = [];
        let countPorPalabra = 0;
        let sumaRetweets = 0;
        let sumaFavorites = 0;
        const temporal = tweets.map((tweet) => { if (tweet !== null) return tweet });
        temporal.forEach((tweet) => {
            if (tweet !== undefined) {
                const tweetSinAcentos = (tweet.msg.toLowerCase()).normalize('NFD').replace(/([^n\u0300-\u036f]|n(?!\u0303(?![\u0300-\u036f])))[\u0300-\u036f]+/gi,"$1").normalize();
                for(let indice = 0; indice < palabrasViolentas.length; indice++) {
                    if(tweetSinAcentos.includes(palabrasViolentas[indice])) {
                        countBadWords ++;
                        palabrasUsadas.push(palabrasViolentas[indice]);
                    }
                }
                sumaRetweets = sumaRetweets + tweet.retweet;
                sumaFavorites = sumaFavorites + tweet.favorite;
            } else {
                countUndefined ++;
            }
        });
        const categorias = Array.from(new Set(palabrasUsadas));
        categorias.forEach((categoria) => {
            for (let palabra = 0; palabra < palabrasUsadas.length; palabra ++) {
                if (palabrasUsadas[palabra] === categoria) {
                    countPorPalabra++;
                } 
            }
            cantidadPorPalabra.push(countPorPalabra);
            countPorPalabra = 0;
        });
        this.setState({
            numPalabras: countBadWords,
            categoriasPalabras: categorias,
            datosPalabras: cantidadPorPalabra,
            contadorRetweets: sumaRetweets,
            contadorFavorites: sumaFavorites,
        });
    }

    contadorTweetsNegativos = (tweets) => {
        let countNegativeTweets = 0;
        let countPositiveTweets = 0;
        let countNull = 0;
        tweets.forEach((tweet) => {
            if (tweet !== null) {
                if (tweet.classification.tag_name === 'negativo') {
                    countNegativeTweets ++;
                } else {
                    countPositiveTweets ++;
                }
            } else {
                countNull ++;
            }
        });
        this.setState({ tweetsNegativos: countNegativeTweets, tweetsPositivos: countPositiveTweets });
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
            count: 20,
        }
        console.log(parametrosJSON);

        if (usuario === '') {
            this.setState({ modalAviso: true })
        } else {
            this.setState({ loading: true, vistaBusquedaPrevia: false });
            axios.post('https://tweelock-api.azurewebsites.net/buscarUsuarios', parametrosJSON)
            // axios.post('http://localhost:8080/buscarUsuarios', parametrosJSON)
            .then((res) => {
                const usuarios = res.data
                const arregloTemporal = []

                usuarios.forEach((usuario) => {
                    for (let i = 0; i < filtroLocation.length; i++) {
                        if ((usuario.location).includes(filtroLocation[i])) {
                            arregloTemporal.push(usuario)
                        }
                    }
                })
                // Quitamos valores duplicados en el arreglo
                let set = new Set(arregloTemporal.map(JSON.stringify))
                const arregloSinDuplicaciones = Array.from(set).map(JSON.parse)
                this.setState({ twitterUsers: arregloSinDuplicaciones, loading: false });
            }).catch((error) => {
                this.setState({ modalError: true, mensajeError: error });
                console.log(error);
            });
        }
    }

    analyticsView = () => {
        const {
            tweets,
            nombreUsuario,
            twitterUser,
            numPalabras,
            tweetsNegativos,
            tweetsPositivos,
            datosPalabras,
            categoriasPalabras,
            contadorRetweets,
            contadorFavorites,
        } = this.state;
        return (
            <div className={styles.contenedorAnalisis}>
                <Row className={styles.buttonRegresar}>
                    <Col sm={9} className={styles.columnaTitulo}>
                      <p className={styles.tituloAnalisis}>Análisis de violencia</p>
                    </Col>
                    <Col sm={1} className={styles.columnaBotonRegresar}>
                     <Button variant="primary" onClick={this.handleRegresar}>Regresar</Button>
                    </Col>
                    <Col sm={2} className={styles.columnaBotonRegresar}>
                     <Button variant="danger">Guardar en PDF</Button>
                    </Col>
                </Row>
                <div className={styles.contenedorTarjetaUsuario}>
                    <UserCard
                        name={twitterUser.name}
                        nickname={twitterUser.screen_name}
                        location={twitterUser.location}
                        followers={twitterUser.followers_count}
                        startDate={twitterUser.created_at}
                    />
                </div>
                <Row className={styles.columnaAnalisis}>
                    <Col className={styles.columnaTweets}>
                        <Row className={styles.tablaAnalisis}>
                            <Table striped bordered hover variant="dark">
                                <thead>
                                    <tr>
                                        <td>Tweet id</td>
                                        <td>Texto</td>
                                        <td>Clasificación</td>
                                    </tr>
                                </thead>
                                <tbody>
                                {(tweets !== null && tweets.length === 0) ? null :
                                    tweets.map((tweet) => {
                                        if (tweet === null) {
                                            return null;
                                        } 
                                        return(
                                            <tr>
                                                <td>{tweet.tweetId}</td>
                                                <td>{tweet.msg}</td>
                                                <td>{tweet.classification.tag_name}</td>
                                            </tr>
                                        )
                                    })
                                }
                                </tbody>
                            </Table>
                        </Row>
                    </Col>
                    <Col className={styles.columnaGrafica}>
                        {
                            (numPalabras > 0 && tweetsNegativos > 0 && tweetsPositivos > 0) ?
                            <BarChart
                                numPalabras={ numPalabras }
                                numTweetsNegativos={ tweetsNegativos }
                                numTweetsPositivos={ tweetsPositivos }
                            /> : null
                            
                        }
                        {
                            (numPalabras > 0 && tweetsNegativos > 0 && tweetsPositivos > 0) ?
                            <ColumnChart
                                datos={ datosPalabras }
                                categorias={ categoriasPalabras }
                            /> : null
                            
                        }
                        {
                            (numPalabras > 0 && tweetsNegativos > 0 && tweetsPositivos > 0 && contadorRetweets > 0) ?
                            <RadialChart
                                retweets={ contadorRetweets }
                                followers={ twitterUser.followers_count }
                                favorites={ contadorFavorites }
                            /> : null
                            
                        }
                    </Col>
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
                                            <td><Button variant="primary" onClick={() => this.handleAnalisis(user.name, user.screen_name, 50)}>Ver análisis</Button></td>
                                        </tr>
                                    )
                                })
                        }
                    </tbody>
                </Table>
        )
    }

    previousSearchView = () => {
        return (
            <Col className={styles.containerPS}>
                <button className={styles.botonModalPS} onClick={this.handleModalBusquedasPrevias}>
                    <img src={botonLogo} className={styles.botonLogo} alt="Búsquedas previas"/> 
                </button>
            </Col>
        );
    }

    render() {
        const {
            usuario,
            modalAviso,
            modalError,
            mensajeError,
            vistaAnalisis,
            loading,
            vistaBusquedaPrevia,
            modalBusquedaPrevia,
            busquedasPrevias,
            ocultarFooter,
        } = this.state;
        return(
            <div className={styles.container}>
                <Row className={styles.header}> 
                    <Col className={styles.columnaLogo}>
                        <img src={tweelock} className={styles.imgLogo} alt="Tweelock" />
                    </Col>
                    <Col className={styles.columnaBuscador}>
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
                        vistaBusquedaPrevia ?
                            this.previousSearchView() :
                               ( vistaAnalisis ? this.analyticsView() : this.usersTable())
                    }
                </Row>
                {
                    !ocultarFooter ? (
                        <Row className={styles.footer}>
                            <div className={styles.columnaFooter}>
                                <p className={styles.infoFooter}>Trabajo Terminal 2019-A038 • Diana Guadalupe Maldonado Ledo • Carlos Enrique Tule Uscanga</p>
                            </div>
                        </Row>
                    ) : null
                }
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
                <Modal show={modalBusquedaPrevia} onHide={this.handleModalBusquedasPrevias} size="lg">
                    <Modal.Header closeButton>
                    <Modal.Title>{TITULO_BUSQUEDA_PREVIA}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Table striped bordered hover variant="dark">
                            <thead>
                                <tr>
                                    <td>ID Búsqueda</td>
                                    <td>Usuario que se busco</td>
                                    <td>Fecha de búsqueda</td>
                                </tr>
                            </thead>
                            <tbody>
                                {(busquedasPrevias !== null && busquedasPrevias.length === 0) ? null :
                                    busquedasPrevias.map((busqueda) => {
                                        if (busqueda === null) {
                                            return null;
                                        } 
                                        return(
                                            <tr>
                                                <td>{busqueda.idBusqueda}</td>
                                                <td>{busqueda.usuarioABuscar}</td>
                                                <td>{busqueda.fechaBusqueda}</td>
                                                <td><Button variant="primary">Ver busqueda</Button></td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </Table>
                    </Modal.Body>
                </Modal>
            </div>
        )
    }
}

export default Buscador
