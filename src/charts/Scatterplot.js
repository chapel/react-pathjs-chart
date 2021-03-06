import React from 'react';
import _ from 'underscore';
import Options from '../component/Options.js';
import fontAdapt from '../fontAdapter.js';

var Stock  = require('paths-js/stock');
var Axis = require('../component/Axis');
var Path = require('paths-js/path');

export default class Scatterplot extends React.Component {
    constructor(props) {
        super(props);
        this.state = {finished:true};
    }
    getMaxAndMin(chart, key,scale) {
        var maxValue;
        var minValue;
        _.each(chart.curves, function (serie) {
            var values = _.map(serie.item, function (item) {
                return item[key]
            });

            var max = _.max(values);
            if (maxValue === undefined || max > maxValue) maxValue = max;
            var min = _.min(values);
            if (minValue === undefined || min < minValue) minValue = min;
        });
        return {
            minValue: minValue,
            maxValue: maxValue,
            min:scale(minValue),
            max:scale(maxValue)
        }
    }
    onEnter(index,event) {
        this.props.data[0][index].selected = true;
        this.setState({data: this.props.data});
    }
    onLeave(index,event){
        this.props.data[0][index].selected = false;
        this.setState({data:this.props.data});
    }

    render() {
        var noDataMsg = this.props.noDataMessage || "No data available";
        if (this.props.data === undefined) return (<span>{noDataMsg}</span>);

        var options = new Options(this.props);

        var palette = this.props.palette || ["#3E90F0", "#7881C2", "#707B82"];
        var accessor = function (key) {
            return function (x) {
                return x[key];
            }
        };
        var chart = Stock({
            data: this.props.data,
            xaccessor: accessor(this.props.xKey),
            yaccessor: accessor(this.props.yKey),
            width: options.chartWidth,
            height: options.chartHeight,
            closed: false
        });

        var chartArea = {
            x:this.getMaxAndMin(chart,this.props.xKey,chart.xscale),
            y:this.getMaxAndMin(chart,this.props.yKey,chart.yscale),
            margin:options.margin
        };


        var sec = options.animate.fillTransition || 0;
        var fillOpacityStyle = {fillOpacity:this.state.finished?1:0,transition: this.state.finished?'fill-opacity ' + sec + 's':''};

        var textStyle = fontAdapt(options.label);

        var points = _.map(chart.curves, function (c, i) {
            return _.map(c.line.path.points(),function(p,j) {
                var item = c.item[j];
                return (<g transform={"translate(" + p[0] + "," + p[1] + ")"}>
                    <circle cx={0} cy={0} r={5} style={fillOpacityStyle} stroke={options.stroke} fill={options.fill} onMouseEnter={this.onEnter.bind(this,j)} onMouseLeave={this.onLeave.bind(this,j)}/>
                    {item.selected?<text style={textStyle} transform="translate(15, 5)" text-anchor="start">{item.title}</text>:null}
                </g>)
            },this)
        },this);

        return (<svg ref="vivus" width={options.width} height={options.height}>
            <g transform={"translate(" + options.margin.left + "," + options.margin.top + ")"}>
                { points }
                <Axis scale ={chart.xscale} options={options.axisX} chartArea={chartArea} />
                <Axis scale ={chart.yscale} options={options.axisY} chartArea={chartArea} />
            </g>
        </svg>);
    }
}