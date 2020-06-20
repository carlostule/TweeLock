import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';

import styles from '../../css/UserCard.module.css';

class UserCard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            fechaInicio: '',
        };
    }

    componentWillMount() {
        const { startDate } = this.props;
        let dia = '';
        let mes = '';
        const arregloFecha = startDate.split(' ');

        /* 0: "Wed"
        1: "Sep"
        2: "14"
        3: "01:20:18"
        4: "+0000"
        5: "2011" */

        switch (arregloFecha[0]) {
            case 'Sun':
                dia = 'Domingo';
                break;
            case 'Mon':
                dia = 'Lunes';
                break;
            case 'Tue':
                dia = 'Martes';
                break;
            case 'Wed':
                dia = 'Miércoles';
                break;
            case 'Thu':
                dia = 'Jueves';
                break;
            case 'Fri':
                dia = 'Viernes';
                break;
            case 'Sat':
                dia = 'Sábado';
                break;
            default:
                dia = '';
        }

        switch (arregloFecha[1]) {
            case 'Jan':
                mes = 'Enero';
                break;
            case 'Feb':
                mes = 'Febrero';
                break;
            case 'Mar':
                mes = 'Marzo';
                break;
            case 'Apr':
                mes = 'Abril';
                break;
            case 'May':
                mes = 'Mayo';
                break;
            case 'Jun':
                mes = 'Junio';
                break;
            case 'Jul':
                mes = 'Julio';
                break;
            case 'Aug':
                mes = 'Agosto';
                break;
            case 'Sep':
                mes = 'Septiembre';
                break;
            case 'Oct':
                mes = 'Octubre';
                break;
            case 'Nov':
                mes = 'Noviembre';
                break;
            case 'Dec':
                mes = 'Diciembre';
                break;
            default:
                mes = '';
        }

        this.setState({ fechaInicio: `${dia} ${arregloFecha[2]} de ${mes}, ${arregloFecha[5]}` });
    }

    render() {
        const {
            name,
            nickname,
            location,
            violento,
        } = this.props;
        const { fechaInicio } = this.state;
        localStorage.setItem('fechaNormal', fechaInicio);
        return(
            <div className={styles.containerCard}>
                <Col className={styles.columnaDatos1}>
                    <Row>
                        <Col>Usuario</Col>
                        <Col>{name}</Col>
                    </Row>
                    <Row>
                        <Col>Nickname</Col>
                        <Col>{nickname}</Col>
                    </Row>
                    <Row>
                        <Col>Localización</Col>
                        <Col>{location}</Col>
                    </Row>
                </Col>
                <Col className={styles.columnaDatos2}>
                    <Row>
                        <Col>Inicio</Col>
                        <Col>{fechaInicio !== '' ? fechaInicio : 'Sin fecha'}</Col>
                    </Row>
                    <Row>
                        <Col>¿El usuario es violento?</Col>
                        <Col>{violento}</Col>
                    </Row>
                </Col>
            </div>
        );
    }
}

export default UserCard;