import React, { Component } from 'react';
import ReactChart from 'react-apexcharts';

class ColumnChart extends Component {
    constructor(props) {
        super(props);

        this.state = {
            series: [{
                name: 'Mala palabra',
                data: [],
            }],
            options: {
                chart: {
                  height: 350,
                  type: 'bar',  
                },
                plotOptions: {
                    bar: {
                      dataLabels: {
                        position: 'top',
                      },
                    },
                },
                dataLabels: {
                    enabled: true,
                    offsetY: -20,
                    style: {
                        fontSize: '12px',
                        colors: ["#304758"],
                    },
                },
                xaxis: {
                    categories: [],
                    position: 'top',
                    axisBorder: {
                        show: false,
                    },
                    axisTicks: {
                        show: false
                    },
                },
                crosshairs: {
                    fill: {
                      type: 'gradient',
                      gradient: {
                        colorFrom: '#D8E3F0',
                        colorTo: '#BED1E6',
                        stops: [0, 100],
                        opacityFrom: 0.4,
                        opacityTo: 0.5,
                      },
                    },
                },
                tooltip: {
                    enabled: true,
                },
                yaxis: {
                    axisBorder: {
                      show: false
                    },
                    axisTicks: {
                      show: false,
                    },
                    labels: {
                      show: false,
                    },
                },
                title: {
                    text: 'Palabras violentas usadas',
                },
            },
        };
    }

    componentWillReceiveProps() {
        const {
            datos,
            categorias,
        } = this.props;

        this.setState({
            series: [{ data: datos }],
            options: { xaxis: { categories: categorias } },
        });

        console.log(this.state.series);
    }

    render() {
        const {
            options,
            series,
        } = this.state;
        return(
            <div>
                <ReactChart options={ options } series={ series } type="bar" height={ 350 }/>
            </div>
        );
    }
}

export default ColumnChart;