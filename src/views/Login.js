import React, { Component } from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import { Redirect } from 'react-router-dom'
import { Modal } from 'react-bootstrap'
import 'react-tabs/style/react-tabs.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios'

import logo from '../images/logo.svg';
import styles from '../css/App.module.css';

class Login extends Component {

  constructor(props) {
    super(props);

    this.state = {
      registrarse: false,
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      email: '',
      passwd: '',
      passwdconfirm: '',
      username: '',
      password: '',
      tipoError: '',
      modalRegistro: false,
      modalSesion: false,
      modalHeader: '',
      modalMessage: '',
      ruta: '',
    }
  }

  activaRegistro = () => {
    this.setState({ registrarse: true });
  }

  handleNombre = (event) => {
    const { value } = event.target
    this.setState({ nombre: value, tipoError: '' })
  }

  handlePaterno = (event) => {
    const { value } = event.target
    this.setState({ apellidoPaterno: value, tipoError: '' })
  }

  handleMaterno = (event) => {
    const { value } = event.target
    this.setState({ apellidoMaterno: value, tipoError: '' })
  }

  handleEmail = (event) => {
    const { value } = event.target
    this.setState({ email: value, tipoError: '' })
  }

  handlePasswd = (event) => {
    const { value } = event.target
    this.setState({ passwd: value, tipoError: '' })
  }

  handlePassConfirm = (event) => {
    const { value } = event.target
    this.setState({ passwdconfirm: value, tipoError: '' })
  }

  handleUser = (event) => {
    const { value } = event.target
    this.setState({ username: value, tipoError: '' })
  }

  handlePass = (event) => {
    const { value } = event.target
    this.setState({ password: value, tipoError: '' })
  }

  handleClose = () => {
    this.setState({
      modalRegistro: false,
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      email: '',
      passwd: '',
      passwdconfirm: '',
    })
  }

  handleCloseSesion = () => {
    this.setState({ modalSesion: false })
  }

  validarRegistro = () => {
    const {
      nombre,
      apellidoPaterno,
      apellidoMaterno,
      email,
      passwd,
      passwdconfirm,
    } = this.state
    const textoValido = /^[A-Za-z ÁÉÍÓÚÑÜÀÈáéíóúñüàè]+$/
    const correoValido = /^\w+([\.\+\-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/
    const validarPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&_-])[A-Za-z\d$@$!%*?&]/

    // Validaciones
    if (nombre.length === 0) {
      this.setState({ tipoError: 'El nombre es un campo obligatorio.' })
    } else if (!textoValido.test(nombre)) {
      this.setState({ tipoError: 'El nombre no debe de contener números, ni símbolos raros.' })
    } else if (apellidoPaterno.length === 0) {
      this.setState({ tipoError: 'El apellido paterno es un campo obligatorio.' })
    } else if (!textoValido.test(apellidoPaterno)) {
      this.setState({ tipoError: 'El apellido paterno no debe de contener números, ni símbolos raros.' })
    } else if (apellidoMaterno.length === 0) {
      this.setState({ tipoError: 'El apellido materno es un campo obligatorio.' })
    } else if (!textoValido.test(apellidoMaterno)) {
      this.setState({ tipoError: 'El apellido materno no debe de contener números, ni símbolos raros.' })
    } else if (!correoValido.test(email)) {
      this.setState({ tipoError: 'El correo electrónico no es válido.' })
    } else if (passwd.length < 8) {
      this.setState({ tipoError: 'La contraseña debe de ser mínimo de 8 caracteres.' })
    } else if(!validarPass.test(passwd)) {
      this.setState({ tipoError: 'La contraseña debe de contener al menos 1 letra en mayúsculas, 1 letra en minúsculas, 1 número y 1 carácter especial.' })
    } else if(passwdconfirm !== passwd) {
      this.setState({ tipoError: 'Las contraseñas no son iguales.' })
    } else {
      const usuario = {
        nombre: nombre,
        apellidoPaterno: apellidoPaterno,
        apellidoMaterno: apellidoMaterno,
        email: email,
        password: passwd,
      }
      axios.post('http://localhost:8000/registrarUsuario', usuario)
        .then((response) => {
          console.log(response.data)
          this.setState({ modalRegistro: true, modalMessage: response.data })
        }).catch(error => {
          console.log(error)
          this.setState({ modalRegistro: true, modalMessage: error })
        })
    }
  }

  iniciarSesion = () => {
    const {
      username,
      password,
    } = this.state
    console.log("Ejecutando funcion iniciarSesion")
    if (username.length === 0) {
      this.setState({ tipoError: 'El email de usuario es requerido.' })
    } else if (password.length === 0) {
      this.setState({ tipoError: 'La contraseña es requerida.' })
    } else {
      axios.get(`http://localhost:8000/verificarUsuario/${username}&${password}`)
        .then((response) => {
          console.log(response.data)
          if (response.data === 'Usuario no registrado en el sistema.') {
            this.setState({ modalSesion: true, modalHeader: 'No existe usuario', modalMessage: response.data, ruta: '' })
          } else {
            this.setState({ modalSesion: true, modalHeader: 'Inicio de sesión exitoso', modalMessage: response.data, ruta: 'redirect' })
          }
        }).catch(error => console.log(error))
    }
  }

  login = () => {
    const {
      username,
      password,
      tipoError,
      ruta,
    } = this.state
    return (
      <div>
        <form>
          {
            (tipoError === '') ? null : <div><p className={styles.error}>{tipoError}</p></div>
          }
          <div>
            <input type="text" value={username} className={styles.username} placeholder="email" onChange={this.handleUser} />
          </div>
          <div>
            <input type="password" value={password} className={styles.password} placeholder="contraseña" onChange={this.handlePass}/>
          </div>
          <div className={styles.contenedorSubmit}>
              {
                  (ruta !== '') ? <Redirect to="/Buscador" /> : <a className={styles.btnSubmit} onClick={this.iniciarSesion}>Iniciar</a>
              }
          </div>
        </form>
      </div>
    )
  }

  registro = () => {
    const {
      nombre,
      apellidoPaterno,
      apellidoMaterno,
      email,
      passwd,
      passwdconfirm,
      tipoError,
    } = this.state
    return (
      <div>
        <form>
          {
            (tipoError === '') ? null : <div><p className={styles.error}>{tipoError}</p></div>
          }
          <div>
            <input type="text" value={nombre} className={styles.field} placeholder="Nombre" onChange={this.handleNombre}/>
          </div>
          <div>
            <input type="text" value={apellidoPaterno} className={styles.field} placeholder="Apellido Paterno" onChange={this.handlePaterno}/>
          </div>
          <div>
            <input type="text" value={apellidoMaterno} className={styles.field} placeholder="Apellido Materno" onChange={this.handleMaterno}/>
          </div>
          <div>
            <input type="email" value={email} className={styles.field} placeholder="Email" onChange={this.handleEmail}/>
          </div>
          <div>
            <input type="password" value={passwd} className={styles.field} placeholder="Contraseña" onChange={this.handlePasswd}/>
          </div>
          <div>
            <input type="password" value={passwdconfirm} className={styles.field} placeholder="Confirmar contraseña" onChange={this.handlePassConfirm}/>
          </div>
          <div className={styles.contenedorSubmit}>
            <a className={styles.btnSubmit} onClick={this.validarRegistro}>Registrarse</a>
          </div>
        </form>
      </div>
    )
  }

  render(){
    const {
      modalRegistro,
      modalSesion,
      modalHeader,
      modalMessage,
    } = this.state
    return (
      <div className={styles.App}>
        <header className={styles.AppHeader}>
          <div className={styles.rowLogo}>
            <img src={logo} className={styles.AppLogo} alt="logo" />
          </div>
          <div className={styles.rowForm}>
          <Tabs>
            <TabList>
              <Tab>Iniciar Sesión</Tab>
              <Tab>Registro</Tab>
            </TabList>
            <TabPanel>
              { this.login() }
            </TabPanel>
            <TabPanel>
              { this.registro() }
            </TabPanel>
          </Tabs>
          </div>
          <Modal show={modalRegistro} onHide={this.handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>¡Registro exitoso!</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {modalMessage}
            </Modal.Body>
          </Modal>
          <Modal show={modalSesion} onHide={this.handleCloseSesion}>
            <Modal.Header closeButton>
              <Modal.Title>{modalHeader}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {modalMessage}
            </Modal.Body>
          </Modal>
        </header>
      </div>
    );
  }
}

export default Login;
