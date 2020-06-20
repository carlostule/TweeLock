import React, { Component } from 'react';
import ReactChart from 'react-apexcharts';

class BarChart extends Component {
    constructor(props) {
        super(props);

        this.state = {
            series: [{
                name: 'Cantidad',
                data: [],
            }],
            options: {
                chart: {
                    height: 350,
                    type: 'bar',
                },
                plotOptions: {
                    bar: {
                        horizontal: true,
                    },
                },
                dataLabels: {
                    enabled: false
                },
                title: {
                    text: 'Clasificación de tweets'
                },
                xaxis: {
                    categories: ['Palabras Violentas', 'Tweets negativos', 'Tweets positivos'],
                },
            },
        };

        this.barchart = React.createRef();
    }

    componentWillMount() {
        const {
            numPalabras,
            numTweetsNegativos,
            numTweetsPositivos,
        } = this.props;

        const data = [numPalabras, numTweetsNegativos, numTweetsPositivos];

        console.log(data);

        this.setState({ series: [{ data }] });
    }

    render() {
        const {
            options,
            series,
        } = this.state;
        return(
            <div>
                <ReactChart options={options} series={series} type="bar" height={350} />
            </div>
        );
    }

}

export default BarChart;