'use strict';

var React = require('react-native');
var Common = require('../common/common');

var {
  View,
  StyleSheet,
  PropTypes,
  Text,
} = React;


var WeekView = React.createClass({
  propTypes: {
    data : React.PropTypes.array,
  },
  componentDidMount: function () {
  },
  days: function(){
    if(this.props.data)
      return Common.week(this.props.data).map((item, index) => {
          var day = 
              <Text style={ styles.day }>
                  { item.week }
              </Text>
          var iconUp = 
              <Text style = {[styles.day_icon, styles.weather_icon]}>
                  { item.iconUp }
              </Text>
          var iconDown = 
              <Text style = {[styles.day_icon, styles.weather_icon]}>
                  { item.iconDown }
              </Text>
          var date = 
              <Text style={ styles.date }>
                  { item.date }
              </Text>
          return (
              <View style={ styles.dayCol } key={item.week}>
                {day}
                {iconUp}
                <View style={{flex: 2}} />
                {iconDown}
                {date}
              </View>
          );
      });
    else
      return <View style={ styles.dayCol }/>
  },
  render: function(){
    if(this.props.data){
      return (
        <View style = { styles.week }>
          <View style = { styles.week_panel } >
              <View style={ styles.dayCol } />
              { this.days() }
              <View style={ styles.dayCol } />
          </View>
        </View>
      );
    }else{
      return(
        <View style = { styles.week } />
        );
    }
  }
});

var styles = StyleSheet.create({
    dayCol: {
        borderRightColor: '#4d667e',
        borderRightWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        flexDirection: 'column',
    },
    weather_icon: {
        fontFamily: 'WeatherIcons-Regular',
    },
    week_panel: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'stretch',
    },
    week: {
        alignItems: 'stretch',
        flex: 6,
    },
    day_icon: {
        fontSize: 20,
        color: '#ffffff',
        flex: 1,
    },
    day: {
        fontSize: 12,
        color: '#ffffff',
        flex: 1,
    },
    date: {
        fontSize: 12,
        color: '#ffffff',
        flex: 1,
    }
});
module.exports = WeekView;
