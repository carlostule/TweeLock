import React, { Component } from 'react';
import ReactChart from 'react-apexcharts';

class RadialChart extends Component {
    constructor(props) {
        super(props);

        this.state = {
            series: [],
            options: {
              chart: {
                height: 420,
                type: 'radialBar',
                toolbar: {
                  show: false,
                },
              },
              plotOptions: {
                radialBar: {
                  offsetY: 0,
                  startAngle: 0,
                  endAngle: 270,
                  hollow: {
                    margin: 5,
                    size: '30%',
                    background: 'transparent',
                    image: undefined,
                  },
                  dataLabels: {
                    name: {
                      show: false,
                    },
                    value: {
                      show: false,
                    }
                  }
                }
              },
              colors: ['#1ab7ea', '#0084ff', '#39539E'],
              labels: ['Retweets', 'Seguidores', 'Me gusta'],
              legend: {
                show: true,
                floating: true,
                fontSize: '14px',
                position: 'left',
                offsetX: 90,
                offsetY: 20,
                labels: {
                  useSeriesColors: true,
                },
                markers: {
                  size: 0
                },
                formatter: function(seriesName, opts) {
                  return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex]
                },
                itemMargin: {
                  vertical: 3
                }
              },
              title: {
                text: 'Estadísticas de Twitter',
              },
              responsive: [{
                breakpoint: 480,
                options: {
                  legend: {
                      show: false
                  }
                }
              }]
            },
        };
    }

    componentWillReceiveProps() {
        const {
            retweets,
            followers,
            favorites,
        } = this.props;

        this.setState({ series: [retweets, followers, favorites] });
    }

    render() {
        const {
            options,
            series,
        } = this.state;
        return(
            <div>
                <ReactChart options={ options } series={ series } type="radialBar" height={250} />
            </div>
        );
    }
}

export default RadialChart;