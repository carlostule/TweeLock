import React, { Component } from 'react';
import ReactChart from 'react-apexcharts';
import Box from '@material-ui/core/Box';


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
                    id: 'basic-bar',
                    toolbar: {
                        show: false,
                    },
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

        this.barRef = React.createRef();
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
            <Box
                boxShadow={0}
                bgcolor="#ffffff"
                m={1}
                p={1}
                style={{ width: '550px', height: '250px' }}
            >
                <ReactChart options={options} series={series} type="bar" height={250} />
            </Box>
        );
    }

}

export default BarChart;