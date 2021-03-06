/* eslint-disable no-unexpected-multiline */
/* eslint-disable no-undef */
import React, { Component } from 'react';
import { Row, Col, Button, Modal, Form, Table, Spinner } from 'react-bootstrap';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Box from '@material-ui/core/Box';


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
let CUERPO_MODAL = 'Necesitas introducir el nombre de un usuario que quieras buscar.';
const TITULO_ERROR_MODAL = 'ERROR TWEELOCK';
const TITULO_BUSQUEDA_PREVIA = 'Búsquedas previas';
const PDF_VIEWER = 'Vista previa reporte';
const NO_HAY_ANALISIS = 'No existe aún un análisis para este usuario';
const FALLA_DESCARGA = 'GENERANDO PDF';
const ERROR_DESCARGA = 'Se esta generando el PDF, cierre el modal para que se descargue.';

const filtroLocation = [
    'mexico',
    'en tus sueños mojados',
    'cdmx',
    'ciudad de mexico',
    'mexico d.f.',
    'mexico df',
    'd.f.',
    'df',
    'distrito federal',
    'mexico, distrito federal',
    'mexico distrito federal',
    'ecatepec',
    'coacalco de berriozabal',
    'coacalco',
    'tultepec',
    'tultitlan',
    'tlalnepantla de baz',
    'tlalnepantla',
    'estado de mexico',
    'edomex',
    'puebla',
    'hidalgo',
    'veracruz',
    'oaxaca',
    'cancun',
    'yucatan',
    'monterrey',
    'nuevo leon',
    'mty',
    'cuernavaca',
    'morelia',
    'toluca',
    'tlaxcala',
    'acapulco',
    'gdl',
    'guadalajara jalisco',
    'guadalajara',
    'puerto vallarta',
    'sinaloa',
    'sonora',
    'aguascalientes',
    'zacatecas',
    'chiapas',
];

const palabrasViolentas = [
    'chinga tu madre',
    'chinguen a su madre',
    'chingue a su madre',
    'chingada madre',
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
    ' puta ',
    ' puta',
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
    'estupida',
    ' puto ',
    ' puto',
    ' culo ',
    ' culo',
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
            numPalabras: null,
            tweetsNegativos: null,
            tweetsPositivos: null,
            datosPalabras: [],
            categoriasPalabras: [],
            contadorRetweets: 0,
            contadorFavorites: 0,
            vistaPdf: false,
            noHayAnalisis: false,
            fromAnalisisPrevio: false,
            imgData: null,
            imgGraficas: null,
            retry: false,
            loadingBusquedaPrevia: false,
            loadingTable: false,
            loadingGraficas: false,
            modalNoHayBusqueda: false,
            parametroUsuario: '',
            parametroFecha: '',
            modalSinResultados: false,
            loadingPrevia: false,
            sinNegativos: false,
            modalGenerandoAnalisis: false,
        }

        this.chartBar = React.createRef();
    }

    handleChange = (event) => {
        this.setState({ usuario: event.target.value})
    }

    handleClose = () => {
        this.setState({
            modalNoHayBusqueda: false,
            modalBusquedaPrevia: false,
            modalAviso: false,
            modalError: false,
            mensajeError: '',
            vistaPdf: false,
            noHayAnalisis: false,
            vistaUsuarioPrevio: false,
            retry: false,
        });
    }

    handleVolverAbuscar = () => {
        this.setState({
            modalSinResultados: false,
            loading: false,
            usuario: '',
            vistaBusquedaPrevia: true,
            loadingPrevia: false,
        });
    }

    handleCloseDownload = () => {
        this.setState({
            retry: false
        });

        this.exportarReportePDF();
    }

    handleCloseAnalisisGenerado = () => {
        this.setState({ modalGenerandoAnalisis: false });
    }

    handleRegresar = () => {
        this.setState({
            vistaAnalisis: false,
            vistaBusquedaPrevia: true,
            usuario: '',
            ocultarFooter: false,
            parametroFecha: '',
            loadingPrevia: false,
            sinNegativos: false,
        });
    }

    handleModalBusquedasPrevias = () => {
        this.setState({ loadingBusquedaPrevia: true });
        const { modalBusquedaPrevia } = this.state;
        // const url = 'http://localhost:8080/busquedasPrevias';
        const url = 'https://tweelock-api.azurewebsites.net/busquedasPrevias';

        axios.get(url).then((res) => {
            if (res.data.length === 0) {
                this.setState({ modalNoHayBusqueda: true });
            } else {
                this.setState({
                    busquedasPrevias: res.data,
                    loadingBusquedaPrevia: false,
                });
            }
        }).catch((error) => {
            this.setState({ modalError: true, mensajeError: error });
            console.log(error);
        });

        this.setState({ modalBusquedaPrevia: !modalBusquedaPrevia });
    }

    handleUsuariosPrevios = (id, usuarioABuscar, fechaBusqueda) => {
        const url = `https://tweelock-api.azurewebsites.net/usuariosPrevios?idBusqueda=${id}`;

        this.setState({
            parametroUsuario: usuarioABuscar,
            parametroFecha: fechaBusqueda,
        });

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
        this.setState({ fromAnalisisPrevio: true, vistaAnalisis: true, vistaBusquedaPrevia: false, loadingTable: true, loadingGraficas: true, modalGenerandoAnalisis: true});

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
                    loadingTable: false,
                    loadingGraficas: false,
                });
                this.handleCloseAnalisisGenerado();
            }
        }).catch((error) => {
            this.setState({ modalError: true, mensajeError: error });
            console.log(error);
        });
    }

    handleAnalisis = (name, screen_name, count) => {
        const { twitterUsers } = this.state;
        this.setState({ vistaAnalisis: true, ocultarFooter: true, loadingTable: true, loadingGraficas: true, modalGenerandoAnalisis: true });
        
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
            // axios.post('http://localhost:8080/buscarTweets', objetoUsuario)
                .then((res) => {
                    this.contadorPalabrasViolentas(res.data);
                    this.contadorTweetsNegativos(res.data);
                    this.setState({ tweets: res.data, loadingTable: false, loadingGraficas: false });
                    this.handleCloseAnalisisGenerado();
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

        if(countNegativeTweets === 0) {
            this.setState({ sinNegativos: true, numPalabras: 0, tweetsNegativos: 0, tweetsPositivos: countPositiveTweets });
        } else {
            this.setState({ tweetsNegativos: countNegativeTweets, tweetsPositivos: countPositiveTweets });
        }
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

        if(countNegativeTweets === 0) {
            this.setState({ sinNegativos: true, numPalabras: 0, tweetsNegativos: 0, tweetsPositivos: countPositiveTweets });
        } else {
            this.setState({ tweetsNegativos: countNegativeTweets, tweetsPositivos: countPositiveTweets });
        }
    }

    exportarReportePDF = () => {
        html2canvas(document.querySelector("#reporte")).then(canvas => {
           //  document.body.appendChild(canvas);  // if you want see your screenshot in body.
            this.setState({ imgData: canvas.toDataURL('image/png') });
        });

        html2canvas(document.querySelector("#graficas")).then(canvas => {
            // document.body.appendChild(canvas);  // if you want see your screenshot in body.
            this.setState({ imgGraficas: canvas.toDataURL('image/png') });
        });

        const {
            imgData,
            imgGraficas,
        } = this.state;

        if (this.state.imgData !== null && this.state.imgGraficas !== null) {
             const pdf = new jsPDF('p', 'mm', 'a4');
             pdf.addImage(imgData, 'PNG', 0, 0);
             pdf.addPage();
             pdf.addImage(imgGraficas, 'PNG', 0, 0);
             pdf.save("reporte.pdf");
        } else {
            this.setState({ retry: true });
        }
    } 

    buscarUsuarios = () => {
        const { usuario } = this.state;
        const parametrosJSON = {
            username: usuario,
            count: 20,
        }
        this.setState({ parametroUsuario: usuario, loadingPrevia: true });

        if (usuario === '') {
            this.setState({ modalAviso: true })
        } else {
            this.setState({ loading: true, vistaBusquedaPrevia: false });
            axios.post('https://tweelock-api.azurewebsites.net/buscarUsuarios', parametrosJSON)
            // axios.post('http://localhost:8080/buscarUsuarios', parametrosJSON)
            .then((res) => {
                const usuarios = res.data;
                // const arregloTemporal = [];

                if (usuarios.length > 0) {
                    /* usuarios.forEach((usuario) => {
                        for (let i = 0; i < filtroLocation.length; i++) {
                            if ((usuario.location).includes(filtroLocation[i])) {
                                arregloTemporal.push(usuario)
                            }
                        }
                    })
                    // Quitamos valores duplicados en el arreglo
                    let set = new Set(arregloTemporal.map(JSON.stringify))
                    const arregloSinDuplicaciones = Array.from(set).map(JSON.parse) */
                    this.setState({ twitterUsers: usuarios, loading: false });
                } else {
                    this.setState({ modalSinResultados: true });
                }
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

    addZero = (num) => {
        if (num < 10) {
            num = `0${num}`;
        }
    
        return num;
    }

    pdfView = (datosPalabras) => {
        const {
            nombreUsuario,
            twitterUser,
            tweetsNegativos,
            tweetsPositivos,
            numPalabras,
            categoriasPalabras,
            tweets,
            fromAnalisisPrevio,
            parametroUsuario,
            parametroFecha,
            contadorFavorites,
            contadorRetweets,
        } = this.state;
        let palabras = '';
        let violenta = '';
        let indice = 0;
        const follower = fromAnalisisPrevio ? twitterUser.followers : twitterUser.followers_count;
        const fechaActual = new Date();
        const fechaHoy = `${fechaActual.getFullYear()}-${this.addZero(fechaActual.getMonth()+1)}-${this.addZero(fechaActual.getDate())}`;
        for(let indice = 0; indice < categoriasPalabras.length; indice++) {
            palabras = palabras + `${categoriasPalabras[indice]}, `;
        }

        if (tweetsNegativos > tweetsPositivos) {
            violenta = '¡El usuario es altamente violento en sus publicaciones!';
        } else if (tweetsNegativos === tweetsPositivos) {
            violenta = 'El usuario es violento en sus publicaciones';
        } else if (tweetsNegativos < tweetsPositivos && tweetsNegativos > 0) {
            violenta = 'El usuario es poco violento en sus publicaciones';
        } else if ((tweetsPositivos - tweetsNegativos <= 4 || numPalabras > 7) && tweetsNegativos > 0) {
            violenta = 'El usuario es violento en sus publicaciones';
        } else if (tweetsNegativos === 0){
            violenta = 'El usuario no es violento en sus publicaciones';
        }

        return(
            <div className={styles.contenedorPdf}>
            <Button variant="primary" onClick={this.exportarReportePDF}>download</Button>
                <div id="reporte" className={styles.contenedorPagina}>
                    <Row className={styles.rowBasicData}>
                        <Col>
                        <Row className={styles.rowTitleData}>
                            <Col className={styles.logoReporte}>
                             <img src={logo} alt="LogoTweelock" width={50} height={50} />
                            </Col>
                            <Col className={styles.tituloReporte}>
                                <p className={styles.seccionPagina}>Reporte Tweelock</p>
                            </Col>
                         </Row>
                         <Row className={styles.rowTitleData}>
                            <p className={styles.seccionPagina}>Datos de búsqueda</p>
                         </Row>
                         <Row>
                            <Table striped bordered>
                                <thead>
                                    <tr>
                                        <td>Fecha de búsqueda</td>
                                        <td>Nombre introducido</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{(parametroFecha !== '') ? parametroFecha : fechaHoy}</td>
                                        <td>{parametroUsuario}</td>
                                    </tr>
                                </tbody>
                            </Table>
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
                            <p className={styles.seccionPagina}>Análisis</p>
                         </Row>
                         <Row>
                            <p className={styles.parrafo}>
                                {
                                    this.state.sinNegativos ?
                                    `El siguiente reporte se ha creado con base en el análisis que se realizó al usuario ${nombreUsuario},
                                    de los ${tweetsPositivos} tweets recopilados de su cuenta de Twitter, se obtuvo que ${tweetsNegativos} son textos negativos y 
                                    ${tweetsPositivos} son textos positivos. Por lo tanto la clasificación que se le asigna es la siguiente: `
                                     :
                                    `El siguiente reporte se ha creado con base en el análisis que se realizó al usuario ${nombreUsuario},
                                     de los ${tweetsPositivos + tweetsNegativos} tweets recopilados de su cuenta de Twitter, se obtuvo que ${tweetsNegativos} son textos negativos y 
                                     ${tweetsPositivos} son textos positivos. También dentro de los textos negativos el usuario ocupo ${numPalabras}
                                      palabras violentas, las cuales fueron ${palabras}por lo tanto la clasificación que se le asigna es la siguiente: `
                                }
                            </p>
                         </Row>
                         <Row className={styles.rowTitleData}>
                            <p className={styles.seccionPagina}>Clasificación</p>
                         </Row>
                         <Row>
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
                            {
                                fromAnalisisPrevio ? (
                                    <div>
                                        {
                                            this.state.sinNegativos ? <p className={styles.parrafo}>{`No se detecto ningún texto negativo en la parte de tweets analizados.`}</p> :
                                                (tweets !== null && tweets.length === 0 ) ? null :
                                                    tweets.map((tweet) => {
                                                        if (tweet === null) {
                                                            return null;
                                                        } else if(tweet.clasificacion === 'positivo') {
                                                            return null;
                                                        } else if(tweet.clasificacion === 'negativos') {
                                                            return(
                                                                <p className={styles.parrafo}>{`• ${tweet.msg}`}</p>
                                                            )
                                                        }
                                                    })
                                        }
                                    </div>
                                ) : (
                                    <div>
                                        {
                                        this.state.sinNegativos ? <p className={styles.parrafo}>{`No se detecto ningún texto negativo en la parte de tweets analizados.`}</p> :
                                        (tweets !== null && tweets.length === 0) ? null :
                                            tweets.map((tweet) => {
                                                if (tweet === null) {
                                                    return null;
                                                } else if(tweet.classification.tag_name === 'positivo') {
                                                    return null;
                                                } else if(tweet.classification.tag_name === 'negativos') {
                                                    return(
                                                        <p className={styles.parrafo}>{`• ${tweet.msg}`}</p>
                                                    )
                                                }
                                            })
                                        }
                                    </div>
                                )
                            }
                         </Row>
                        </Col>
                    </Row>
                </div>
                <p className={styles.seccionPagina}>NOTA: Las gráficas se agregaran automáticamente al documento PDF</p>
            </div>
        );
    }

    analyticsView = () => {
        const {
            tweets,
            twitterUser,
            numPalabras,
            tweetsNegativos,
            tweetsPositivos,
            datosPalabras,
            categoriasPalabras,
            contadorRetweets,
            contadorFavorites,
            fromAnalisisPrevio,
            loadingTable,
        } = this.state;
        let violenta = '';

        if (tweets !== null) {
            if (tweetsNegativos > tweetsPositivos) {
                violenta = '¡El usuario es altamente violento en sus publicaciones!';
            } else if (tweetsNegativos === tweetsPositivos) {
                violenta = 'El usuario es violento en sus publicaciones';
            } else if (tweetsNegativos < tweetsPositivos && tweetsNegativos > 0) {
                violenta = 'El usuario es poco violento en sus publicaciones';
            } else if ((tweetsPositivos - tweetsNegativos <= 4 || numPalabras > 7) && tweetsNegativos > 0) {
                violenta = 'El usuario es violento en sus publicaciones';
            } else if (tweetsNegativos === 0){
                violenta = 'El usuario no es violento en sus publicaciones';
            }
        }
        const follower = fromAnalisisPrevio ? twitterUser.followers : twitterUser.followers_count;
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
                        <p>Lista de tweets</p>
                        <Row className={styles.tablaAnalisis}>
                            {
                                loadingTable ? (
                                    <div style={{ display: 'flex', 'flex': 1, alignItems: 'center', justifyContent: 'center' }}>
                                        <Spinner animation="grow" variant="primary" />
                                    </div>
                                ) : (
                                    <Table striped bordered hover >
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
                                )
                            }
                        </Row>
                    </Col>
                    <Col className={styles.columnaGrafica}>
                        <Row>
                            <p>Estadísticas de tweets</p>
                        </Row>
                        <div id="graficas">
                            {(numPalabras !== null && tweetsNegativos !== null && tweetsPositivos !== null) ?
                                <Barchart
                                    ref={(cmp) => this.chartBar = cmp}
                                    numPalabras={ numPalabras }
                                    numTweetsNegativos={ tweetsNegativos }
                                    numTweetsPositivos={ tweetsPositivos }
                                /> : null}
                            {(numPalabras !== null && numPalabras > 0 && tweetsNegativos !== null && tweetsPositivos !== null && !this.state.sinNegativos ) ?
                            <Box
                                boxShadow={0}
                                bgcolor="#ffffff"
                                m={1}
                                p={1}
                                style={{ width: '550px', height: '250px' }}
                            > 
                                <ColumnChart
                                    datos={ datosPalabras }
                                    categorias={ categoriasPalabras }
                                /> 
                            </Box>: null}
                            {(numPalabras !== null && tweetsNegativos !== null && tweetsPositivos !== null) ?
                            <Box
                                boxShadow={0}
                                bgcolor="#ffffff"
                                m={1}
                                p={1}
                                style={{ width: '550px', height: '250px' }}
                            >
                                <RadialChart
                                    retweets={ contadorRetweets }
                                    followers={ follower }
                                    favorites={ contadorFavorites }
                                /> 
                            </Box>: null}
                        </div>
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
                                            <td><Button variant="primary" onClick={() => this.handleAnalisis(user.name, user.screen_name, 20)}>Ver análisis</Button></td>
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
            modalNoHayBusqueda,
            busquedasPrevias,
            ocultarFooter,
            vistaPdf,
            vistaUsuarioPrevio,
            usuariosPrevios,
            noHayAnalisis,
            retry,
            loadingBusquedaPrevia,
            datosPalabras,
            modalSinResultados,
            loadingPrevia,
            modalGenerandoAnalisis,
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
                        {
                            loadingPrevia ? <Button variant="danger" onClick={this.handleModalBusquedasPrevias}>Busquedas previas</Button> : null
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
                            this.pdfView(datosPalabras)
                        }
                    </Modal.Body>
                </Modal>
                <Modal show={retry} onHide={this.handleCloseDownload}>
                    <Modal.Header closeButton>
                    <Modal.Title>{FALLA_DESCARGA}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {ERROR_DESCARGA}
                    </Modal.Body>
                </Modal>
                <Modal show={modalNoHayBusqueda} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                    <Modal.Title>BUSCADOR TWEELOCK</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        No existen búsquedas previas, realice una nueva búsqueda.
                    </Modal.Body>
                </Modal>
                <Modal show={modalSinResultados} onHide={this.handleVolverAbuscar}>
                    <Modal.Header closeButton>
                    <Modal.Title>BUSCADOR TWEELOCK</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        No hay resultados para la búsqueda que realizaste.
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
                <Modal show={modalGenerandoAnalisis} onHide={this.handleCloseAnalisisGenerado}>
                    <Modal.Header closeButton>
                    <Modal.Title>GENERANDO ANÁLISIS</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div style={{ display: 'flex', 'flex': 1, alignItems: 'center', justifyContent: 'center' }}>
                            <Spinner animation="border" variant="danger" />
                        </div>
                    </Modal.Body>
                </Modal>
                <Modal show={modalBusquedaPrevia} onHide={this.handleModalBusquedasPrevias} size="lg">
                    <Modal.Header closeButton>
                    <Modal.Title>{TITULO_BUSQUEDA_PREVIA}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {
                            loadingBusquedaPrevia ? (
                                <div style={{ display: 'flex', 'flex': 1, alignItems: 'center', justifyContent: 'center' }}>
                                    <Spinner animation="border" variant="danger" />
                                </div>
                            ) : 
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
                                                        <td><Button variant="primary" onClick={() => this.handleUsuariosPrevios(busqueda.idBusqueda, busqueda.usuarioABuscar, busqueda.fechaBusqueda)}>Ver busqueda</Button></td>
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
