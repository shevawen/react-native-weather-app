'use strict';

var React = require('react-native');
var d3 = require('d3');
var Svg = require('react-native-svg'); 
var Common = require('../common/common');

var Path = Svg.Path;

var {
  View,
  StyleSheet,
  PropTypes,
} = React;

var Chart = React.createClass({
  propTypes: {
    data : React.PropTypes.array,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    top: React.PropTypes.number,
    pointFillColors: React.PropTypes.array,
    pointStrokeColors: React.PropTypes.array,
    lineColors: React.PropTypes.array,
  },
  getValueDomain: function(){
    var _max = [];
    var _min = [];
    this.props.data.map((item, index) => {
      _max.push(d3.max(item));
      _min.push(d3.min(item));
    });
    return [d3.max(_max), d3.min(_min)];
  },
  getPathD: function(data){
    var x = d3.scale.linear().domain([0, data.length - 1]).range([6, this.props.width - 6]);
    var y = d3.scale.linear().domain(this.getValueDomain()).range([6, this.props.height - 6]);
    var line = d3.svg.line().x(function(d,i) { 
            return x(i); 
        }).y(function(d) { 
            return y(d);
        })
    .interpolate("cardinal");
    return line(data);
  },
  paths: function(){
    var that = this;
    return this.props.data.map((item, index) => {
      return (
        <Path fill="none" stroke={that.props.lineColors[index]} strokeWidth="2" strokeMiterlimit="10"
          d={that.getPathD(item)} />);
    });
  },
  points : function(){
    var that = this;
    if(this.props.data.length > 1){
      var x = d3.scale.linear().domain([0, this.props.data[0].length - 1]).range([6, this.props.width - 6]);
      var y = d3.scale.linear().domain(this.getValueDomain()).range([6, this.props.height - 6]);
      var paths = [];
      this.props.data.map((item, index) => {
        item.map((point, _index) => {
          var cx = x(_index);
          var cy = y(point);
          var d = "M " + cx + " " + cy + " m -3,0 a 3,3 0 1,0 6,0 a 3,3 0 1,0 -6,0";
          paths.push(<Path fill={that.props.pointFillColors[index]} 
                      stroke={that.props.pointStrokeColors[index]} 
                      strokeWidth="1" strokeMiterlimit="10" 
                      d={d} />);
        });
      });
      return paths;
    }
  },
  svg: function(){
    return (<Svg width={this.props.width} height={this.props.height} forceUpdate="0" 
            style={{
                width: this.props.width, 
                height: this.props.height,}}>
            {this.paths()}
            {this.points()}
        </Svg>);
  },
  render: function() {
    if(this.props.data){
      return(
        <View style={{
                  position: 'absolute',
                  backgroundColor:'transparent',
                  top: this.props.top,
                }}>
          {this.svg()}
        </View>);
    }else{
      return(
        <View style={{
                  position: 'absolute',
                  backgroundColor:'transparent',
                  top: this.props.top,
                }}>
        </View>);
    }
  }
});

module.exports = Chart;