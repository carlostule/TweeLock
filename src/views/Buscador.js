/* eslint-disable no-unexpected-multiline */
/* eslint-disable no-undef */
import React, { Component, Fragment } from 'react';
import { Row, Col, Button, Modal, Form, Table, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { exportImage } from '@progress/kendo-drawing';
import { PDFExport } from '@progress/kendo-react-pdf';

import UserCard from '../views/components/UserCard';
import Barchart from './components/BarChart';
import ColumnChart from './components/ColumnChart';
import RadialChart from './components/RadialChart';
import ScreenCapture from './components/ScreenCapture'

import 'react-tagsinput/react-tagsinput.css';
import styles from '../css/Buscador.module.css';
import '../css/ScreenCapture.css';

import tweelock from '../images/Tweelock.svg';
import botonLogo from '../images/LogoBotonDesplegado.svg';
import logo from '../images/icono.png';

const TITULO_MODAL = 'BUSCADOR TWEELOCK';
const CUERPO_MODAL = 'Necesitas introducir el nombre de un usuario que quieras buscar.';
const TITULO_ERROR_MODAL = 'ERROR TWEELOCK';
const TITULO_BUSQUEDA_PREVIA = 'Búsquedas previas';
const PDF_VIEWER = 'Vista previa reporte';
const NO_HAY_ANALISIS = 'No existe aún un análisis para este usuario';

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
            usuariosPrevios: [],
            usuarioPrevio: {},
            vistaUsuarioPrevio: false,
            ocultarFooter: false,
            numPalabras: 0,
            tweetsNegativos: 0,
            tweetsPositivos: 0,
            datosPalabras: [],
            categoriasPalabras: [],
            contadorRetweets: 0,
            contadorFavorites: 0,
            vistaPdf: false,
            tempCapture1: '',
            tempCapture2: '',
            screenCapture1: '',
            screenCapture2: '',
            screenCapture3: '',
            sinGraficas: true,
            noHayAnalisis: false,
            fromAnalisisPrevio: false,
        }

        this.chartBar = React.createRef();
    }

    handleChange = (event) => {
        this.setState({ usuario: event.target.value})
    }

    handleClose = () => {
        this.setState({ modalAviso: false, modalError: false, mensajeError: '', vistaPdf: false, noHayAnalisis: false, vistaUsuarioPrevio: false })
    }

    handleRegresar = () => {
        this.setState({ vistaAnalisis: false, vistaBusquedaPrevia: true, usuario: '', ocultarFooter: false });
    }

    handleScreenCapture1 = (screenCapture) => {
        this.setState({
            screenCapture1: screenCapture,
            tempCapture1: screenCapture,
            sinGraficas: false,
        })
    }

    handleScreenCapture2 = (screenCapture) => {
        this.setState({
            screenCapture2: screenCapture,
            tempCapture2: screenCapture,
        })
    }

    handleScreenCapture3 = (screenCapture) => {
        this.setState({
            screenCapture3: screenCapture,
        })
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

    handleUsuariosPrevios = (id) => {
        const url = `https://tweelock-api.azurewebsites.net/usuariosPrevios?idBusqueda=${id}`;

        axios.get(url).then((res) => {
            console.log(JSON.stringify(res.data));
            this.setState({
                usuariosPrevios: res.data,
                vistaUsuarioPrevio: true, 
            });
        }).catch((error) => {
            this.setState({ modalError: true, mensajeError: error });
            console.log(error);
        });
    }

    analisisPrevios = (userId, name, screenName) => {
        const url = `https://tweelock-api.azurewebsites.net/tweetsPrevios?idUsuario=${userId}`;
        const { usuariosPrevios } = this.state;
        this.setState({ fromAnalisisPrevio: true, vistaAnalisis: true, vistaBusquedaPrevia: false});

        usuariosPrevios.forEach((user) => {
            if (screenName === user.screenName) {
                this.setState({ twitterUser: user });
            }
        });

        axios.get(url).then((res) => {
            console.log(res);
            if (res.data.length === 0) {
                this.setState({ noHayAnalisis: true });
            } else {
                this.contadorPalabrasViolentas(res.data);
                this.contadorTweetsNegativosPrevios(res.data);
                this.setState({
                    tweets: res.data,
                    modalBusquedaPrevia: false,
                    ocultarFooter: true,
                    nombreUsuario: name,
                });
            }
        }).catch((error) => {
            this.setState({ modalError: true, mensajeError: error });
            console.log(error);
        });
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

    contadorTweetsNegativosPrevios = (tweets) => {
        let countNegativeTweets = 0;
        let countPositiveTweets = 0;
        let countNull = 0;
        tweets.forEach((tweet) => {
            if (tweet !== null) {
                if (tweet.clasificacion === 'negativo') {
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

    exportPDF = () => {
        this.resume.save();
        this.setState({ screenCapture1: '', screenCapture2: '', screenCapture3: '' });
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

    handleCloseVistaUsuarioPrevio = () => {
        this.setState({ vistaUsuarioPrevio: false });
    }

    handlePdfView = () => {
        this.setState({ vistaPdf: true });
    }

    stopCapture = () => {
        this.setState({
            screenCapture1: '',
            screenCapture2: '',
            screenCapture3: '',
        });
    }

    pdfView = () => {
        const {
            nombreUsuario,
            twitterUser,
            tweetsNegativos,
            tweetsPositivos,
            numPalabras,
            categoriasPalabras,
            tweets,
            screenCapture1,
            screenCapture2,
            screenCapture3,
            tempCapture1,
            tempCapture2,
            sinGraficas,
            fromAnalisisPrevio,
        } = this.state;
        let palabras = '';
        let violenta = '';
        for(let indice = 0; indice < categoriasPalabras.length; indice++) {
            palabras = palabras + `${categoriasPalabras[indice]}, `;
        }

        if (tweetsNegativos > tweetsPositivos) {
            violenta = '¡El usuario es altamente violento en sus publicaciones!';
        } else if (tweetsNegativos === tweetsPositivos) {
            violenta = 'El usuario es violento en sus publicaciones';
        } else if (tweetsNegativos < tweetsPositivos && tweetsNegativos > 0) {
            violenta = 'El usuario es poco violento en sus publicaciones';
        } else if (tweetsNegativos === 0){
            violenta = 'El usuario no es violento en sus publicaciones';
        }

        return(
            <div className={styles.contenedorPdf}>
            <button onClick={this.exportPDF}>download</button>
            <PDFExport
                paperSize={'Letter'}
                fileName={`Análisis violencia ${nombreUsuario}.pdf`}
                title={`Análisis violencia ${nombreUsuario}`}
                subject=""
                keywords=""
                ref={(r) => this.resume = r}
            >   
                <div className={styles.contenedorPagina}>
                    <Row className={styles.rowBasicData}>
                        <Col>
                        <Row className={styles.rowTitleData}>
                            <Col className={styles.logoReporte}>
                             <img src={logo} alt="LogoTweelock" width={50} height={50} />
                            </Col>
                            <Col className={styles.tituloReporte}>
                                <p className={styles.seccionPagina}>Reporte generado por Tweelock</p>
                            </Col>
                         </Row>
                         <Row className={styles.rowTitleData}>
                            <p className={styles.seccionPagina}>Datos basicos del usuario</p>
                         </Row>
                         <Row>
                            <Table striped bordered>
                                <thead>
                                    <tr>
                                        <td>Usuario</td>
                                        <td>Localizacion</td>
                                        <td>Fecha de creacion</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{nombreUsuario}</td>
                                        <td>{twitterUser.location}</td>
                                        <td>{localStorage.getItem('fechaNormal')}</td>
                                    </tr>
                                </tbody>
                            </Table>
                         </Row>
                        </Col>
                    </Row>
                    <Row className={styles.rowBasicData}>
                        <Col>
                         <Row className={styles.rowTitleData}>
                            <p className={styles.seccionPagina}>Datos del analisis</p>
                         </Row>
                         <Row>
                            <p className={styles.parrafo}>
                                {
                                    `El siguiente reporte se ha creado con base en el analisis que se realizo al usuario ${nombreUsuario},
                                     de los 20 tweets recopilados de su cuenta de Twitter, se obtuvo que ${tweetsNegativos} son textos negativos y 
                                     ${tweetsPositivos} son textos positivos. Tambien dentro de los textos negativos el usuario ocupo ${numPalabras}
                                      palabras violentas, las cuales fueron ${palabras}por lo tanto la clasificacion que se le asigna es la siguiente: `
                                }
                            </p>
                            <p className={styles.clasificacion}>
                                {violenta}
                            </p>
                         </Row>
                        </Col>
                    </Row>
                    <Row className={styles.rowBasicData}>
                        <Col>
                         <Row className={styles.rowTitleData}>
                            <p className={styles.seccionPagina}>Lista de tweets negativos</p>
                         </Row>
                         <Row>
                            <Table striped bordered size="sm">
                                <thead>
                                    <tr>
                                        <td>Id</td>
                                        <td>Texto</td>
                                    </tr>
                                </thead>
                                {
                                    fromAnalisisPrevio ? (
                                        <tbody>
                                            {
                                            (tweets !== null && tweets.length === 0) ? null :
                                                tweets.map((tweet) => {
                                                    if (tweet === null) {
                                                        return null;
                                                    } else if(tweet.clasificacion === 'positivo') {
                                                        return null;
                                                    }
                                                    return(
                                                        <tr>
                                                            <td>{tweet.idTweets}</td>
                                                            <td>{tweet.msg}</td>
                                                        </tr>
                                                    )
                                                })
                                            }
                                        </tbody>
                                    ) : (
                                        <tbody>
                                            {
                                            (tweets !== null && tweets.length === 0) ? null :
                                                tweets.map((tweet) => {
                                                    if (tweet === null) {
                                                        return null;
                                                    } else if(tweet.classification.tag_name === 'positivo') {
                                                        return null;
                                                    }
                                                    return(
                                                        <tr>
                                                            <td>{tweet.tweetId}</td>
                                                            <td>{tweet.msg}</td>
                                                        </tr>
                                                    )
                                                })
                                            }
                                        </tbody>
                                    )
                                }
                            </Table>
                         </Row>
                        </Col>
                    </Row>
                    <Row className={styles.rowBasicData}>
                        <Col>
                        {
                            sinGraficas ? null : (
                                <Row className={styles.rowTitleData}>
                                    <p className={styles.seccionPagina}>Graficas</p>
                                </Row>
                            )
                        }
                         {
                             screenCapture1 === '' && screenCapture2 === '' && screenCapture3 === '' && tempCapture1 === '' && tempCapture2 === '' ?
                             (<p>Para visualizar las graficas del usuario primero debe de realizar una captura de las graficas que requiere en su reporte, si no necesita ninguna puede descargar el pdf como esta actualmente.</p>)
                             :
                             (
                             <>
                                <Row style={{ alignItems: 'center', marginTop: '4%' }}>
                                    <p className={styles.seccionPagina}>Analisis en la clasificacion de tweets</p>
                                </Row>
                                <Row>
                                    {
                                        screenCapture1 !== '' ?
                                        <img src={screenCapture1} alt="Grafica 1" width={550} height={350}/>
                                        : tempCapture1 !== '' ?
                                            <img src={tempCapture1} alt="Grafica 1" width={550} height={350}/>
                                            :
                                            null
                                    }
                                </Row>
                                <Row style={{ alignItems: 'center', marginTop: '4%' }}>
                                    <p className={styles.seccionPagina}>Analisis de la palabra mas usada</p>
                                </Row>
                                <Row >
                                    {
                                        screenCapture2 !== '' ?
                                        <img src={screenCapture2} alt="Grafica 2" width={550} height={350}/>
                                        : tempCapture2 !== '' ?
                                            <img src={tempCapture2} alt="Grafica 2" width={550} height={350}/>
                                            :
                                            null
                                    }
                                </Row>
                                <Row style={{ alignItems: 'center', marginTop: '4%' }}>
                                    <p className={styles.seccionPagina}>Analisis sobre la cuenta de twitter</p>
                                </Row>
                                <Row>
                                    {
                                        screenCapture3 !== '' ?
                                            <img src={screenCapture3} alt="Grafica 3" width={550} height={350}/> : null
                                    }
                                </Row>
                             </>
                             )
                         }
                        </Col>
                    </Row>
                </div>
            </PDFExport>
            </div>
        );
    }

    captureZone = (ss1, ss2, ss3) => {
        const {
            numPalabras,
            tweetsNegativos,
            tweetsPositivos,
            datosPalabras,
            categoriasPalabras,
            contadorRetweets,
            twitterUser,
            contadorFavorites,
            fromAnalisisPrevio,
        } = this.state;
        const follower = fromAnalisisPrevio ? twitterUser.followers : twitterUser.followers_count;
        if(ss1 !== '' && ss2 !== '' && ss3 !== '') {
            return(
                <div style={{ overflow: 'auto', border: '0px solid', height: '350px' }}>
                    {(numPalabras > 0 && tweetsNegativos > 0 && tweetsPositivos > 0) ?
                    <Barchart
                        ref={(cmp) => this.chartBar = cmp}
                        numPalabras={ numPalabras }
                        numTweetsNegativos={ tweetsNegativos }
                        numTweetsPositivos={ tweetsPositivos }
                    /> : null}
                    {(numPalabras > 0 && tweetsNegativos > 0 && tweetsPositivos > 0) ?
                    <ColumnChart
                        datos={ datosPalabras }
                        categorias={ categoriasPalabras }
                    /> : null}
                    {(numPalabras > 0 && tweetsNegativos > 0 && tweetsPositivos > 0 && contadorRetweets > 0) ?
                    <RadialChart
                        retweets={ contadorRetweets }
                        followers={ follower }
                        favorites={ contadorFavorites }
                    /> : null}
                </div>
            );
        } else if (ss1 !== '' && ss2 !== '' && ss3 === '') {
            return (
                <div style={{ overflow: 'auto', border: '0px solid', height: '350px' }}>
                    {(numPalabras > 0 && tweetsNegativos > 0 && tweetsPositivos > 0 && contadorRetweets > 0) ?
                    <RadialChart
                        retweets={ contadorRetweets }
                        followers={ follower }
                        favorites={ contadorFavorites }
                    /> : null}
                </div>
            );
        } else if (ss1 !== '' && ss2 === '' && ss3 === '') {
            return(
                <div style={{ overflow: 'auto', border: '0px solid', height: '350px' }}>
                    {(numPalabras > 0 && tweetsNegativos > 0 && tweetsPositivos > 0) ?
                    <ColumnChart
                        datos={ datosPalabras }
                        categorias={ categoriasPalabras }
                    /> : null}
                    {(numPalabras > 0 && tweetsNegativos > 0 && tweetsPositivos > 0 && contadorRetweets > 0) ?
                    <RadialChart
                        retweets={ contadorRetweets }
                        followers={ follower }
                        favorites={ contadorFavorites }
                    /> : null}
                </div>
            );
        } else {
            return (
                <div style={{ overflow: 'auto', border: '0px solid', height: '350px' }}>
                    {(numPalabras > 0 && tweetsNegativos > 0 && tweetsPositivos > 0) ?
                    <Barchart
                        ref={(cmp) => this.chartBar = cmp}
                        numPalabras={ numPalabras }
                        numTweetsNegativos={ tweetsNegativos }
                        numTweetsPositivos={ tweetsPositivos }
                    /> : null}
                    {(numPalabras > 0 && tweetsNegativos > 0 && tweetsPositivos > 0) ?
                    <ColumnChart
                        datos={ datosPalabras }
                        categorias={ categoriasPalabras }
                    /> : null}
                    {(numPalabras > 0 && tweetsNegativos > 0 && tweetsPositivos > 0 && contadorRetweets > 0) ?
                    <RadialChart
                        retweets={ contadorRetweets }
                        followers={ follower }
                        favorites={ contadorFavorites }
                    /> : null}
                </div>
            );
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
            screenCapture1,
            screenCapture2,
            screenCapture3,
            fromAnalisisPrevio,
        } = this.state;
        let violenta = '';

        if (tweets !== null) {
            if (tweetsNegativos > tweetsPositivos) {
                violenta = '¡El usuario es altamente violento en sus publicaciones!';
            } else if (tweetsNegativos === tweetsPositivos) {
                violenta = 'El usuario es violento en sus publicaciones';
            } else if (tweetsNegativos < tweetsPositivos && tweetsNegativos > 0) {
                violenta = 'El usuario es poco violento en sus publicaciones';
            } else if (tweetsNegativos === 0){
                violenta = 'El usuario no es violento en sus publicaciones';
            }
        }

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
                     <Button variant="danger" onClick={this.handlePdfView}>Vista previa PDF</Button>
                    </Col>
                </Row>
                <div className={styles.contenedorTarjetaUsuario}>
                    {
                        fromAnalisisPrevio ?
                            <UserCard
                                name={twitterUser.userName}
                                nickname={twitterUser.screenName}
                                location={twitterUser.location}
                                followers={twitterUser.followers}
                                startDate={twitterUser.fechaCreacion}
                                violento={violenta}
                            /> 
                            :
                            <UserCard
                                name={twitterUser.name}
                                nickname={twitterUser.screen_name}
                                location={twitterUser.location}
                                followers={twitterUser.followers_count}
                                startDate={twitterUser.created_at}
                                violento={violenta}
                            />
                    }
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
                                {
                                    fromAnalisisPrevio ? (
                                        <tbody>
                                        {(tweets !== null && tweets.length === 0) ? null :
                                            tweets.map((tweet) => {
                                                if (tweet === null) {
                                                    return null;
                                                } 
                                                return(
                                                    <tr>
                                                        <td>{tweet.idTweets}</td>
                                                        <td>{tweet.msg}</td>
                                                        <td>{tweet.clasificacion}</td>
                                                    </tr>
                                                )
                                            })
                                        }
                                        </tbody>
                                    ) : (
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
                                    )
                                }
                            </Table>
                        </Row>
                    </Col>
                    <Col className={styles.columnaGrafica}>
                        <ScreenCapture onEndCapture={(screenCapture1 !== '') ? (screenCapture2 !== '') ? this.handleScreenCapture3 : this.handleScreenCapture2 : this.handleScreenCapture1}>
                        {({ onStartCapture }) => (
                            <Fragment>
                                <Row className={styles.rowButton1}>
                                {
                                    (screenCapture1 !== '' && screenCapture2 !== '' && screenCapture3 === '') ?
                                    null : (screenCapture1 === '' && screenCapture2 === '' && screenCapture3 === '') ? <Button variant="danger" onClick={this.stopCapture}>Parar de capturar</Button>
                                     : <Button variant="danger" onClick={this.stopCapture}>Parar de capturar</Button>
                                }
                                </Row>
                                <Row className={styles.rowButton1}>
                                    <Button variant="danger" onClick={onStartCapture}>Capturar Gráfica</Button>
                                </Row>
                                {
                                    this.captureZone(screenCapture1, screenCapture2, screenCapture3)
                                }
                            </Fragment>
                        )}
                        </ScreenCapture>
                    </Col>
                </Row>
            </div>
        );
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
            vistaPdf,
            vistaUsuarioPrevio,
            usuariosPrevios,
            noHayAnalisis,
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
                <Modal show={noHayAnalisis} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                    <Modal.Title>{TITULO_MODAL}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {NO_HAY_ANALISIS}
                    </Modal.Body>
                </Modal>
                <Modal show={vistaPdf} onHide={this.handleClose} size="lg">
                    <Modal.Header closeButton>
                    <Modal.Title>{PDF_VIEWER}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {   
                            this.pdfView()
                        }
                    </Modal.Body>
                </Modal>
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
                        {
                            !vistaUsuarioPrevio ? (
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
                                                        <td><Button variant="primary" onClick={() => this.handleUsuariosPrevios(busqueda.idBusqueda)}>Ver busqueda</Button></td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </Table>
                            ) : (
                                <Table striped bordered hover variant="dark">
                                    <thead>
                                        <tr>
                                            <td>ID Usuario</td>
                                            <td>Nombre</td>
                                            <td>Screen Name</td>
                                            <td>Localización del usuario</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(usuariosPrevios !== null && usuariosPrevios.length === 0) ? null :
                                            usuariosPrevios.map((usuarioPrevio) => {
                                                if (usuarioPrevio === null) {
                                                    return null;
                                                } 
                                                return(
                                                    <tr>
                                                        <td>{usuarioPrevio.idUsuario}</td>
                                                        <td>{usuarioPrevio.userName}</td>
                                                        <td>{usuarioPrevio.screenName}</td>
                                                        <td>{usuarioPrevio.location}</td>
                                                        <td><Button variant="danger" onClick={this.handleCloseVistaUsuarioPrevio}>Regresar</Button></td>
                                                        <td><Button variant="primary" onClick={() => this.analisisPrevios(usuarioPrevio.idUsuario, usuarioPrevio.userName, usuarioPrevio.screenName)}>Ver análisis</Button></td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </Table>
                            )
                        }
                    </Modal.Body>
                </Modal>
            </div>
        )
    }
}

export default Buscador
