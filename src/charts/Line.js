import React from 'react';
import _ from 'underscore';
import Colors from '../pallete/Colors.js';
import Options from '../component/Options.js';
import fontAdapt from '../fontAdapter.js';

var Axis = require('../component/Axis');
var Path = require('paths-js/path');

function cyclic(coll, i) { return coll[i % coll.length]; }

export default class LineChart extends React.Component {
    constructor(props, chartType) {
        super(props);
        this.chartType = chartType;
        this.state = {finished: true};
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

    color(i) {
        var pallete = this.props.pallete || Colors.mix(this.props.options.color || '#9ac7f7');
        return Colors.string(cyclic(pallete, i));
    }

    render() {
        var noDataMsg = this.props.noDataMessage || "No data available";
        if (this.props.data === undefined) return (<span>{noDataMsg}</span>);

        var options = new Options(this.props);


        var accessor = function (key) {
            return function (x) {
                return x[key];
            }
        };
        var chart = this.chartType({
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

        var transparent = {opacity: 0.5};

        var lines = _.map(chart.curves, function (c, i) {
            return <path d={ c.line.path.print() } stroke={ this.color(i) } fill="none"/>
        },this);
        var areas = _.map(chart.curves, function (c, i) {
            //var transparent = { opacity: 0.5 };
            return <path d={ c.area.path.print() } style={ transparent } stroke="none" fill={ this.color(i) }/>
        },this);

        return <svg ref="vivus" width={options.width} height={options.height}>
            <g transform={"translate(" + options.margin.left + "," + options.margin.top + ")"}>
                { this.state.finished ? areas : null }
                { lines }
                <Axis scale ={chart.xscale} options={options.axisX} chartArea={chartArea} />
                <Axis scale ={chart.yscale} options={options.axisY} chartArea={chartArea} />
            </g>
        </svg>
    }
}